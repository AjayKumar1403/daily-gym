/* ==========================================================================
   Daily Gym — Auth + cloud sync
   Sign-in with Google (Firebase Auth) and per-user data sync (Firestore).
   All reads/writes only touch users/{uid}, enforced by Firestore rules.
   The app still works fully offline afterwards — Firestore's SDK caches
   data locally and syncs automatically once back online.
   ========================================================================== */

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
try { db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch (e) { /* not supported */ }

let currentUser = null;
let cloudSyncTimer = null;

function persistLocalOnly() {
  try {
    localStorage.setItem(STORE_KEYS.PROGRESS, JSON.stringify(progress));
    localStorage.setItem(STORE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORE_KEYS.FOODLOG, JSON.stringify(foodLog));
    localStorage.setItem(STORE_KEYS.REMINDERS, JSON.stringify(reminders));
  } catch (e) { /* storage unavailable */ }
}

function scheduleCloudSync() {
  if (!currentUser) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => pushCloudSync(), 800);
}

function pushCloudSync() {
  if (!currentUser) return Promise.resolve();
  clearTimeout(cloudSyncTimer);
  return db.collection("users").doc(currentUser.uid).set({
    progress, settings, foodLog, reminders,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch((err) => console.warn("Cloud sync failed:", err));
}

function hasLocalData() {
  const hasProgress = Object.keys(progress).length > 0;
  const hasFood = Object.values(foodLog).some((d) => d.entries && d.entries.length);
  const hasReminders = reminders.length > 0;
  return hasProgress || hasFood || hasReminders;
}

function askMigration() {
  return new Promise((resolve) => {
    const backdrop = document.getElementById("migrationModalBackdrop");
    backdrop.classList.add("open");
    document.getElementById("migrateYesBtn").onclick = () => {
      backdrop.classList.remove("open");
      resolve(true);
    };
    document.getElementById("migrateNoBtn").onclick = () => {
      backdrop.classList.remove("open");
      resolve(false);
    };
  });
}

async function hydrateFromCloud(uid) {
  let snap = null;
  try {
    snap = await db.collection("users").doc(uid).get();
  } catch (e) {
    console.warn("Could not reach Firestore, using local data offline:", e);
    return;
  }

  if (snap && snap.exists) {
    const data = snap.data();
    progress = data.progress || {};
    settings = Object.assign({ darkMode: false, unit: "lb", restLength: 60, calorieGoal: 2000 }, data.settings || {});
    foodLog = data.foodLog || {};
    reminders = data.reminders || [];
    persistLocalOnly();
  } else if (hasLocalData()) {
    const upload = await askMigration();
    if (!upload) {
      progress = {};
      foodLog = {};
      reminders = [];
      settings = { darkMode: false, unit: "lb", restLength: 60, calorieGoal: 2000 };
      persistLocalOnly();
    }
    await pushCloudSync();
  } else {
    await pushCloudSync();
  }
}

/* ---------------- Gate UI ---------------- */
function showGate() {
  document.getElementById("authGate").classList.add("show");
  document.getElementById("app").classList.add("app-hidden");
}
function hideGate() {
  document.getElementById("authGate").classList.remove("show");
  document.getElementById("app").classList.remove("app-hidden");
}
function setGateStatus(msg, isError) {
  const el = document.getElementById("gateStatus");
  el.textContent = msg || "";
  el.classList.toggle("error", !!isError);
}

document.getElementById("googleSignInBtn").addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  setGateStatus("Signing in…");
  // Try a popup first (nicer UX, stays on this tab in the background);
  // fall back to a full-page redirect if the popup gets blocked/closed,
  // which happens in some embedded/automated browser contexts.
  auth.signInWithPopup(provider).catch((err) => {
    if (err.code === "auth/popup-closed-by-user" || err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request") {
      setGateStatus("Redirecting to Google sign-in…");
      auth.signInWithRedirect(provider);
    } else {
      setGateStatus("Sign-in failed. Please try again.", true);
    }
  });
});

/* Handle the return trip from signInWithRedirect, if that path was used. */
auth.getRedirectResult().catch((err) => {
  if (err && err.code) setGateStatus("Sign-in failed: " + err.code, true);
});

auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (!user) {
    showGate();
    return;
  }
  setGateStatus("Loading your data…");
  await hydrateFromCloud(user.uid);
  hideGate();
  initAppUI();
  updateAccountRow();
});

function updateAccountRow() {
  const row = document.getElementById("accountRow");
  if (!row) return;
  if (currentUser) {
    document.getElementById("accountEmail").textContent = currentUser.email || currentUser.displayName || "Signed in";
  }
}

function signOutUser() {
  pushCloudSync().finally(() => auth.signOut());
}
