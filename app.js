/* ==========================================================================
   Daily Gym — App logic
   ========================================================================== */

/* ---------------- Storage helpers ---------------- */
const STORE_KEYS = { PROGRESS: "dg_progress", SETTINGS: "dg_settings", FOODLOG: "dg_foodlog", REMINDERS: "dg_reminders" };

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ }
  if (typeof scheduleCloudSync === "function") scheduleCloudSync();
}

let progress = loadJSON(STORE_KEYS.PROGRESS, {});
let settings = loadJSON(STORE_KEYS.SETTINGS, { darkMode: false, unit: "lb", restLength: 60, calorieGoal: 2000 });
if (!settings.calorieGoal) settings.calorieGoal = 2000;
let foodLog = loadJSON(STORE_KEYS.FOODLOG, {});
let reminders = loadJSON(STORE_KEYS.REMINDERS, []);

function dateKey(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayKey() { return dateKey(new Date()); }

function getDayEntry(key) {
  if (!progress[key]) progress[key] = { done: [] };
  return progress[key];
}
function isExerciseDone(key, exId) {
  return !!(progress[key] && progress[key].done && progress[key].done.includes(exId));
}
function toggleExercise(key, exId) {
  const entry = getDayEntry(key);
  const i = entry.done.indexOf(exId);
  if (i >= 0) entry.done.splice(i, 1); else entry.done.push(exId);
  saveJSON(STORE_KEYS.PROGRESS, progress);
}
function dayCompletionRatio(key, program) {
  if (!program || program.type !== "workout") return 1;
  const entry = progress[key];
  const done = entry && entry.done ? entry.done.filter(id => program.exercises.includes(id)).length : 0;
  return program.exercises.length ? done / program.exercises.length : 0;
}

/* ---------------- Streak calculation ---------------- */
function computeStreak() {
  let streak = 0;
  let d = new Date();
  // if today's workout isn't finished yet, start counting from yesterday
  const todayProgram = WEEK_PROGRAM[d.getDay()];
  const todayRatio = dayCompletionRatio(todayKey(), todayProgram);
  if (todayProgram.type === "workout" && todayRatio < 1) {
    d.setDate(d.getDate() - 1);
  }
  for (let i = 0; i < 365; i++) {
    const key = dateKey(d);
    const program = WEEK_PROGRAM[d.getDay()];
    if (program.type !== "workout") {
      // rest / active-rest days don't break the streak
      d.setDate(d.getDate() - 1);
      continue;
    }
    const ratio = dayCompletionRatio(key, program);
    if (ratio >= 1) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/* ---------------- Food log helpers ---------------- */
function getFoodDayEntry(key) {
  if (!foodLog[key]) foodLog[key] = { entries: [] };
  return foodLog[key];
}
function addFoodEntry(key, food, mealType, multiplier) {
  const entry = getFoodDayEntry(key);
  entry.entries.push({
    uid: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    foodId: food.id,
    name: food.name,
    serving: food.serving,
    mealType,
    multiplier,
    cal: Math.round(food.cal * multiplier),
    protein: +(food.protein * multiplier).toFixed(1),
    carbs: +(food.carbs * multiplier).toFixed(1),
    fat: +(food.fat * multiplier).toFixed(1)
  });
  saveJSON(STORE_KEYS.FOODLOG, foodLog);
}
function removeFoodEntry(key, uid) {
  const entry = getFoodDayEntry(key);
  entry.entries = entry.entries.filter(e => e.uid !== uid);
  saveJSON(STORE_KEYS.FOODLOG, foodLog);
}
function dailyTotals(key) {
  const entry = foodLog[key];
  const list = entry ? entry.entries : [];
  return list.reduce((acc, e) => {
    acc.cal += e.cal; acc.protein += e.protein; acc.carbs += e.carbs; acc.fat += e.fat;
    return acc;
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });
}
function suggestMealType() {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}

/* ---------------- Reminders ---------------- */
const REMINDER_TYPE_META = {
  water: { icon: "💧", label: "Drink Water", defaultBody: "Time for a glass of water." },
  medicine: { icon: "💊", label: "Medicine", defaultBody: "Time to take your medicine." },
  supplement: { icon: "🧪", label: "Supplement", defaultBody: "Time to take your supplement." }
};

function saveReminders() { saveJSON(STORE_KEYS.REMINDERS, reminders); }

function addReminder(r) {
  r.id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  r.enabled = true;
  r.lastFiredDate = null;
  r.lastFiredAt = 0;
  reminders.push(r);
  saveReminders();
}
function removeReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  saveReminders();
}
function toggleReminderEnabled(id) {
  const r = reminders.find(r => r.id === id);
  if (r) { r.enabled = !r.enabled; saveReminders(); }
}

function pad2(n) { return String(n).padStart(2, "0"); }
function timeToMinutes(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
function formatTimeLabel(t) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad2(m)} ${period}`;
}
function scheduleLabel(r) {
  if (r.mode === "daily") return `Daily at ${formatTimeLabel(r.time)}`;
  return `Every ${r.everyHours}h, ${formatTimeLabel(r.startTime)}–${formatTimeLabel(r.endTime)}`;
}

/* ---------------- Notifications ---------------- */
function notifSupported() { return "Notification" in window; }
function notifPermission() { return notifSupported() ? Notification.permission : "unsupported"; }
function requestNotifPermission() {
  if (!notifSupported()) { showToast("Notifications aren't supported on this browser"); return; }
  Notification.requestPermission().then(() => renderRemind());
}

let audioCtx = null;
function playBeep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((delay, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = i === 0 ? 880 : 1046;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + 0.3);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + 0.3);
    });
  } catch (e) { /* audio not available */ }
}

function fireReminder(r) {
  const meta = REMINDER_TYPE_META[r.type];
  const title = r.type === "water" ? "Drink Water 💧" : `${meta.icon} ${r.label}`;
  const body = r.type === "water" ? meta.defaultBody : (r.note ? r.note : meta.defaultBody);

  if (notifSupported() && Notification.permission === "granted") {
    try { new Notification(title, { body, icon: "icons/icon-192.png", tag: r.id }); } catch (e) { /* ignore */ }
  }
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  playBeep();
  showToast(`${meta.icon} ${title.replace(meta.icon, "").trim()}`);
}

function checkReminders() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const today = todayKey();
  let changed = false;

  reminders.forEach(r => {
    if (!r.enabled) return;
    if (r.mode === "daily") {
      const targetMin = timeToMinutes(r.time);
      if (Math.abs(nowMinutes - targetMin) <= 1 && r.lastFiredDate !== today) {
        fireReminder(r);
        r.lastFiredDate = today;
        changed = true;
      }
    } else if (r.mode === "interval") {
      const startMin = timeToMinutes(r.startTime);
      const endMin = timeToMinutes(r.endTime);
      const withinWindow = nowMinutes >= startMin && nowMinutes <= endMin;
      if (!withinWindow) return;
      const elapsedMs = Date.now() - (r.lastFiredAt || 0);
      const lastFiredWasToday = r.lastFiredDate === today;
      const intervalMs = r.everyHours * 60 * 60 * 1000;
      const dueForCatchUp = !lastFiredWasToday; // first trigger of the day within window
      const dueByInterval = lastFiredWasToday && elapsedMs >= intervalMs;
      if (dueForCatchUp || dueByInterval) {
        fireReminder(r);
        r.lastFiredAt = Date.now();
        r.lastFiredDate = today;
        changed = true;
      }
    }
  });

  if (changed) saveReminders();
}

/* ---------------- View switching ---------------- */
const views = ["today", "diet", "remind", "week", "library", "learn", "settings"];
function switchView(name) {
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle("active", v === name);
  });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
  if (name === "today") renderToday();
  if (name === "diet") renderDiet();
  if (name === "remind") renderRemind();
  if (name === "week") renderWeek();
  if (name === "library") renderLibrary();
  if (name === "learn") renderLearn();
  if (name === "settings") renderSettings();
  window.scrollTo(0, 0);
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

/* ---------------- Toast ---------------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------------- Streak pill ---------------- */
function updateStreakPill() {
  const s = computeStreak();
  document.getElementById("streakPill").textContent = `🔥 ${s} day streak`;
}

/* ---------------- Today view ---------------- */
function renderToday() {
  const now = new Date();
  const key = todayKey();
  const program = WEEK_PROGRAM[now.getDay()];
  const container = document.getElementById("todayContent");
  updateStreakPill();

  if (program.type !== "workout") {
    const badgeClass = program.type === "rest" ? "rest" : "active-rest";
    container.innerHTML = `
      <div class="card day-banner">
        <div>
          <div class="day-name">${program.day}</div>
        </div>
        <span class="badge ${badgeClass}">${program.type === "rest" ? "Rest Day" : "Active Recovery"}</span>
      </div>
      <div class="card">
        <div class="section-label" style="margin-top:0;">${program.label}</div>
        <p style="font-size:14px; color:var(--text-dim); line-height:1.5;">${program.note}</p>
      </div>
      <div class="card">
        <div class="breathing-box">
          <div class="lbl">Recovery breathing</div>
          Try 5 minutes of box breathing today: inhale 4 seconds, hold 4, exhale 4, hold 4. It supports recovery on rest days.
        </div>
      </div>
    `;
    return;
  }

  const ratio = dayCompletionRatio(key, program);
  const pct = Math.round(ratio * 100);

  let exercisesHtml = program.exercises.map(id => {
    const ex = EXERCISES[id];
    const done = isExerciseDone(key, id);
    return exerciseItemHtml(ex, { showCheck: true, done, dateKey: key });
  }).join("");

  container.innerHTML = `
    <div class="card day-banner">
      <div>
        <div class="day-name">${program.day}</div>
      </div>
      <span class="badge workout">Workout</span>
    </div>

    <div class="card">
      <div class="section-label" style="margin-top:0;">${program.label}</div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-label">${pct}% complete — ${program.exercises.length} exercises</div>
    </div>

    <div class="card collapsible" id="warmupCollapsible">
      <div class="collapsible-head" data-toggle="warmupCollapsible">
        <div><div class="title">🔥 ${WARMUP.name}</div><div class="meta">${WARMUP.duration}</div></div>
        <span class="chevron">▾</span>
      </div>
      <div class="collapsible-body">
        ${WARMUP.items.map(i => `<div class="mini-item"><span class="n">${i.name}</span><span class="d">${i.duration}</span></div>`).join("")}
        <div class="breathing-note">${WARMUP.breathingNote}</div>
      </div>
    </div>

    <div class="section-label">Today's Exercises</div>
    ${exercisesHtml}

    <div class="card collapsible" id="cooldownCollapsible">
      <div class="collapsible-head" data-toggle="cooldownCollapsible">
        <div><div class="title">🧘 ${COOLDOWN.name}</div><div class="meta">${COOLDOWN.duration}</div></div>
        <span class="chevron">▾</span>
      </div>
      <div class="collapsible-body">
        ${COOLDOWN.items.map(i => `<div class="mini-item"><span class="n">${i.name}</span><span class="d">${i.duration}</span></div>`).join("")}
        <div class="breathing-note">${COOLDOWN.breathingNote}</div>
      </div>
    </div>

    <button class="btn btn-primary btn-block" id="startRestTimerBtn">⏱ Start Rest Timer (${settings.restLength}s)</button>
  `;

  container.querySelectorAll("[data-toggle]").forEach(head => {
    head.addEventListener("click", () => {
      document.getElementById(head.dataset.toggle).classList.toggle("open");
    });
  });

  container.querySelectorAll(".ex-item").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".check-circle")) return;
      openExerciseModal(el.dataset.id, { context: "today", dateKey: key });
    });
    const cc = el.querySelector(".check-circle");
    if (cc) {
      cc.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExercise(key, el.dataset.id);
        renderToday();
      });
    }
  });

  document.getElementById("startRestTimerBtn").addEventListener("click", () => startRestTimer(settings.restLength));
}

/* ---------------- Exercise item (shared markup) ---------------- */
function exerciseItemHtml(ex, opts) {
  opts = opts || {};
  const muscleText = [...ex.muscles.primary].join(", ");
  const dose = ex.duration ? ex.duration : `${ex.sets}×${ex.reps}`;
  const checkHtml = opts.showCheck
    ? `<div class="check-circle ${opts.done ? "done" : ""}">${opts.done ? "✓" : ""}</div>`
    : "";
  return `
    <div class="ex-item" data-id="${ex.id}">
      <div class="icon-wrap">${patternIcon(ex.pattern)}</div>
      <div class="info">
        <div class="name">${ex.name}</div>
        <div class="muscles">${muscleText}</div>
        <div class="setsreps">${dose}</div>
      </div>
      ${checkHtml}
    </div>
  `;
}

/* ---------------- Week view ---------------- */
function renderWeek() {
  const grid = document.getElementById("weekGrid");
  const todayIdx = new Date().getDay();
  let html = "";
  for (let i = 0; i < 7; i++) {
    const program = WEEK_PROGRAM[i];
    const isToday = i === todayIdx;
    const badgeClass = program.type === "workout" ? "workout" : (program.type === "rest" ? "rest" : "active-rest");
    const badgeText = program.type === "workout" ? "Workout" : (program.type === "rest" ? "Rest" : "Active");
    html += `
      <div class="week-day-card ${isToday ? "today" : ""}" data-day="${i}">
        <div>
          <div class="wd-name">${program.day}${isToday ? " · Today" : ""}</div>
          <div class="wd-label">${program.label}</div>
        </div>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }
  grid.innerHTML = html;
  grid.querySelectorAll(".week-day-card").forEach(el => {
    el.addEventListener("click", () => openDayPreview(parseInt(el.dataset.day, 10)));
  });
}

function openDayPreview(dayIdx) {
  const program = WEEK_PROGRAM[dayIdx];
  const modalContent = document.getElementById("modalContent");
  if (program.type !== "workout") {
    modalContent.innerHTML = `
      <div class="modal-title">${program.day}</div>
      <div class="modal-meta-row"><span class="tag">${program.label}</span></div>
      <p style="font-size:14px; color:var(--text-dim); line-height:1.5;">${program.note}</p>
    `;
  } else {
    const key = dateKey(new Date());
    const isCurrentDay = dayIdx === new Date().getDay();
    const html = program.exercises.map(id => exerciseItemHtml(EXERCISES[id], {
      showCheck: isCurrentDay, done: isCurrentDay && isExerciseDone(key, id)
    })).join("");
    modalContent.innerHTML = `
      <div class="modal-title">${program.day}</div>
      <div class="modal-meta-row"><span class="tag">${program.label}</span><span class="tag">${program.exercises.length} exercises</span></div>
      ${html}
    `;
    modalContent.querySelectorAll(".ex-item").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target.closest(".check-circle")) return;
        openExerciseModal(el.dataset.id, isCurrentDay ? { context: "today", dateKey: key } : {});
      });
      const cc = el.querySelector(".check-circle");
      if (cc) cc.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleExercise(key, el.dataset.id);
        openDayPreview(dayIdx);
      });
    });
  }
  openModal();
}

/* ---------------- Diet view ---------------- */
function renderDiet() {
  const key = todayKey();
  const totals = dailyTotals(key);
  const goal = settings.calorieGoal;
  const pct = Math.min(100, Math.round((totals.cal / goal) * 100));
  const remaining = goal - totals.cal;

  document.getElementById("calConsumed").textContent = totals.cal;
  document.getElementById("calGoalLabel").textContent = goal;
  document.getElementById("calProgressFill").style.width = `${pct}%`;
  document.getElementById("calRemainingLabel").textContent = remaining >= 0
    ? `${remaining} kcal remaining`
    : `${Math.abs(remaining)} kcal over goal`;
  document.getElementById("macroRow").innerHTML = `
    <div class="macro-pill"><span class="v">${totals.protein.toFixed(0)}g</span><span class="l">Protein</span></div>
    <div class="macro-pill"><span class="v">${totals.carbs.toFixed(0)}g</span><span class="l">Carbs</span></div>
    <div class="macro-pill"><span class="v">${totals.fat.toFixed(0)}g</span><span class="l">Fat</span></div>
  `;

  const entry = foodLog[key];
  const allEntries = entry ? entry.entries : [];

  document.getElementById("mealSections").innerHTML = MEAL_TYPES.map(mt => {
    const items = allEntries.filter(e => e.mealType === mt);
    const subtotal = items.reduce((s, e) => s + e.cal, 0);
    const itemsHtml = items.length
      ? items.map(e => `
          <div class="food-log-item" data-uid="${e.uid}">
            <div class="info">
              <div class="name">${e.name} <span class="mult">${e.multiplier}×</span></div>
              <div class="serving">${e.serving}</div>
            </div>
            <div class="cal">${e.cal} kcal</div>
            <button class="food-remove" data-uid="${e.uid}">✕</button>
          </div>
        `).join("")
      : `<div class="empty-meal">No items logged yet.</div>`;
    return `
      <div class="card">
        <div class="collapsible-head" style="cursor:default;">
          <div><div class="title">${MEAL_LABELS[mt]}</div><div class="meta">${subtotal} kcal</div></div>
          <button class="btn btn-secondary btn-sm" data-add-meal="${mt}">+ Add</button>
        </div>
        <div style="margin-top:8px;">${itemsHtml}</div>
      </div>
    `;
  }).join("");

  document.getElementById("mealSections").querySelectorAll("[data-add-meal]").forEach(btn => {
    btn.addEventListener("click", () => openFoodPicker(btn.dataset.addMeal));
  });
  document.getElementById("mealSections").querySelectorAll(".food-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFoodEntry(key, btn.dataset.uid);
      renderDiet();
    });
  });

  document.getElementById("openFoodPickerBtn").onclick = () => openFoodPicker(suggestMealType());
}

/* ---------------- Food picker modal ---------------- */
let foodPickerState = { mealType: "breakfast", cuisine: "all", query: "" };

function openFoodPicker(mealType) {
  foodPickerState = { mealType: mealType || suggestMealType(), cuisine: "all", query: "" };
  renderFoodPickerList();
  document.getElementById("foodModalBackdrop").classList.add("open");
}
function closeFoodModal() { document.getElementById("foodModalBackdrop").classList.remove("open"); }

function renderFoodPickerList() {
  const content = document.getElementById("foodModalContent");
  content.innerHTML = `
    <div class="modal-title">Add Food</div>
    <div class="section-label" style="margin-top:8px;">Meal</div>
    <div class="filter-row" id="pickerMealChips">
      ${MEAL_TYPES.map(mt => `<div class="chip ${mt === foodPickerState.mealType ? "active" : ""}" data-mt="${mt}">${MEAL_LABELS[mt]}</div>`).join("")}
    </div>
    <input type="text" class="search-input" id="foodSearch" placeholder="Search foods..." value="${foodPickerState.query}">
    <div class="filter-row" id="pickerCuisineChips">
      <div class="chip ${foodPickerState.cuisine === "all" ? "active" : ""}" data-c="all">All</div>
      ${CUISINES.map(c => `<div class="chip ${foodPickerState.cuisine === c ? "active" : ""}" data-c="${c}">${CUISINE_LABELS[c]}</div>`).join("")}
    </div>
    <div id="foodPickerResults"></div>
  `;

  content.querySelectorAll("#pickerMealChips .chip").forEach(chip => {
    chip.addEventListener("click", () => { foodPickerState.mealType = chip.dataset.mt; renderFoodPickerList(); });
  });
  content.querySelectorAll("#pickerCuisineChips .chip").forEach(chip => {
    chip.addEventListener("click", () => { foodPickerState.cuisine = chip.dataset.c; renderFoodResults(); });
  });
  const searchInput = content.querySelector("#foodSearch");
  searchInput.addEventListener("input", () => { foodPickerState.query = searchInput.value; renderFoodResults(); });
  searchInput.focus();

  renderFoodResults();
}

function renderFoodResults() {
  const results = document.getElementById("foodPickerResults");
  const q = foodPickerState.query.trim().toLowerCase();
  const filtered = FOODS.filter(f => {
    const matchesCuisine = foodPickerState.cuisine === "all" || f.cuisine === foodPickerState.cuisine;
    const matchesQuery = !q || f.name.toLowerCase().includes(q);
    return matchesCuisine && matchesQuery;
  });
  if (!filtered.length) {
    results.innerHTML = `<div class="empty-state"><div class="emoji">🍽️</div>No foods match.</div>`;
    return;
  }
  results.innerHTML = filtered.map(f => `
    <div class="food-item" data-id="${f.id}">
      <div class="info">
        <div class="name">${f.name}</div>
        <div class="serving">${f.serving} · <span class="cuisine-tag">${CUISINE_LABELS[f.cuisine]}</span></div>
      </div>
      <div class="cal-badge">${f.cal}<span>kcal</span></div>
    </div>
  `).join("");
  results.querySelectorAll(".food-item").forEach(el => {
    el.addEventListener("click", () => openFoodQuantityStep(el.dataset.id));
  });
}

function openFoodQuantityStep(foodId) {
  const food = foodById(foodId);
  const content = document.getElementById("foodModalContent");
  let multiplier = 1;

  function draw() {
    content.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="foodBackBtn" style="margin-bottom:12px;">← Back</button>
      <div class="modal-title">${food.name}</div>
      <div class="modal-meta-row"><span class="tag">${food.serving}</span><span class="tag">${CUISINE_LABELS[food.cuisine]}</span><span class="tag">${food.category}</span></div>

      <div class="section-label">Meal</div>
      <div class="filter-row" id="qtyMealChips">
        ${MEAL_TYPES.map(mt => `<div class="chip ${mt === foodPickerState.mealType ? "active" : ""}" data-mt="${mt}">${MEAL_LABELS[mt]}</div>`).join("")}
      </div>

      <div class="section-label">Portion</div>
      <div class="filter-row" id="qtyChips">
        ${[0.5, 1, 1.5, 2, 2.5, 3].map(m => `<div class="chip ${m === multiplier ? "active" : ""}" data-m="${m}">${m}×</div>`).join("")}
      </div>

      <div class="card" style="margin-top:6px;">
        <div class="cal-summary">
          <div class="cal-summary-num">${Math.round(food.cal * multiplier)}</div>
          <div class="cal-summary-sub">kcal for ${multiplier}× serving</div>
        </div>
        <div class="macro-row">
          <div class="macro-pill"><span class="v">${(food.protein * multiplier).toFixed(1)}g</span><span class="l">Protein</span></div>
          <div class="macro-pill"><span class="v">${(food.carbs * multiplier).toFixed(1)}g</span><span class="l">Carbs</span></div>
          <div class="macro-pill"><span class="v">${(food.fat * multiplier).toFixed(1)}g</span><span class="l">Fat</span></div>
        </div>
      </div>

      <button class="btn btn-primary btn-block" id="confirmAddFoodBtn" style="margin-top:14px;">Add to ${MEAL_LABELS[foodPickerState.mealType]}</button>
    `;

    content.querySelector("#foodBackBtn").addEventListener("click", renderFoodPickerList);
    content.querySelectorAll("#qtyMealChips .chip").forEach(chip => {
      chip.addEventListener("click", () => { foodPickerState.mealType = chip.dataset.mt; draw(); });
    });
    content.querySelectorAll("#qtyChips .chip").forEach(chip => {
      chip.addEventListener("click", () => { multiplier = parseFloat(chip.dataset.m); draw(); });
    });
    content.querySelector("#confirmAddFoodBtn").addEventListener("click", () => {
      addFoodEntry(todayKey(), food, foodPickerState.mealType, multiplier);
      showToast(`Added ${food.name} to ${MEAL_LABELS[foodPickerState.mealType]}`);
      closeFoodModal();
      if (document.getElementById("view-diet").classList.contains("active")) renderDiet();
    });
  }

  draw();
}

/* ---------------- Reminders view ---------------- */
function renderRemind() {
  const permCard = document.getElementById("notifPermCard");
  if (notifSupported() && Notification.permission !== "granted") {
    permCard.style.display = "block";
    document.getElementById("enableNotifBtn").onclick = requestNotifPermission;
  } else {
    permCard.style.display = "none";
  }

  const hasWater = reminders.some(r => r.type === "water");
  document.getElementById("quickAddRow").innerHTML = hasWater ? "" : `
    <button class="btn btn-secondary btn-sm" id="quickAddWater">💧 Quick add: Water every 2h (8am–9pm)</button>
  `;
  const quickBtn = document.getElementById("quickAddWater");
  if (quickBtn) {
    quickBtn.onclick = () => {
      addReminder({ type: "water", label: "Drink Water", mode: "interval", everyHours: 2, startTime: "08:00", endTime: "21:00" });
      showToast("Water reminder added");
      renderRemind();
    };
  }

  const list = document.getElementById("reminderList");
  if (!reminders.length) {
    list.innerHTML = `<div class="empty-state"><div class="emoji">⏰</div>No reminders yet. Add one above.</div>`;
  } else {
    list.innerHTML = reminders.map(r => {
      const meta = REMINDER_TYPE_META[r.type];
      return `
        <div class="reminder-card">
          <div class="reminder-icon">${meta.icon}</div>
          <div class="info">
            <div class="name">${r.label}</div>
            <div class="schedule">${scheduleLabel(r)}</div>
            ${r.note ? `<div class="note">${r.note}</div>` : ""}
          </div>
          <div class="reminder-actions">
            <div class="switch ${r.enabled ? "on" : ""}" data-id="${r.id}"></div>
            <button class="food-remove" data-del="${r.id}">✕</button>
          </div>
        </div>
      `;
    }).join("");
    list.querySelectorAll(".switch").forEach(sw => {
      sw.addEventListener("click", () => { toggleReminderEnabled(sw.dataset.id); renderRemind(); });
    });
    list.querySelectorAll("[data-del]").forEach(btn => {
      btn.addEventListener("click", () => {
        if (confirm("Delete this reminder?")) { removeReminder(btn.dataset.del); renderRemind(); }
      });
    });
  }

  document.getElementById("openReminderModalBtn").onclick = openReminderModal;
}

/* ---------------- Reminder add modal ---------------- */
function openReminderModal() {
  let state = { type: "water", mode: "daily", time: "09:00", everyHours: 2, startTime: "08:00", endTime: "21:00", label: "", note: "" };

  function draw() {
    const content = document.getElementById("reminderModalContent");
    const needsName = state.type !== "water";
    content.innerHTML = `
      <div class="modal-title">Add Reminder</div>

      <div class="section-label" style="margin-top:8px;">Type</div>
      <div class="filter-row" id="typeChips">
        ${Object.keys(REMINDER_TYPE_META).map(t => `<div class="chip ${t === state.type ? "active" : ""}" data-t="${t}">${REMINDER_TYPE_META[t].icon} ${REMINDER_TYPE_META[t].label}</div>`).join("")}
      </div>

      ${needsName ? `
        <div class="section-label">Name</div>
        <input type="text" class="search-input" id="reminderNameInput" placeholder="e.g. Vitamin D, Blood pressure tablet" value="${state.label}">
        <div class="section-label">Note (optional)</div>
        <input type="text" class="search-input" id="reminderNoteInput" placeholder="e.g. 1 tablet with breakfast" value="${state.note}">
      ` : ""}

      <div class="section-label">Schedule</div>
      <div class="filter-row" id="modeChips">
        <div class="chip ${state.mode === "daily" ? "active" : ""}" data-m="daily">Once daily</div>
        <div class="chip ${state.mode === "interval" ? "active" : ""}" data-m="interval">Repeat every few hours</div>
      </div>

      ${state.mode === "daily" ? `
        <div class="section-label">Time</div>
        <input type="time" class="search-input" id="dailyTimeInput" value="${state.time}">
      ` : `
        <div class="section-label">Every</div>
        <div class="filter-row" id="hoursChips">
          ${[1, 2, 3, 4].map(h => `<div class="chip ${h === state.everyHours ? "active" : ""}" data-h="${h}">${h}h</div>`).join("")}
        </div>
        <div class="section-label">Active window</div>
        <div style="display:flex; gap:10px;">
          <input type="time" class="search-input" id="startTimeInput" value="${state.startTime}">
          <input type="time" class="search-input" id="endTimeInput" value="${state.endTime}">
        </div>
      `}

      <button class="btn btn-primary btn-block" id="saveReminderBtn" style="margin-top:10px;">Save Reminder</button>
    `;

    content.querySelectorAll("#typeChips .chip").forEach(chip => {
      chip.addEventListener("click", () => { state.type = chip.dataset.t; draw(); });
    });
    content.querySelectorAll("#modeChips .chip").forEach(chip => {
      chip.addEventListener("click", () => { state.mode = chip.dataset.m; draw(); });
    });
    if (needsName) {
      content.querySelector("#reminderNameInput").addEventListener("input", (e) => { state.label = e.target.value; });
      content.querySelector("#reminderNoteInput").addEventListener("input", (e) => { state.note = e.target.value; });
    }
    if (state.mode === "daily") {
      content.querySelector("#dailyTimeInput").addEventListener("input", (e) => { state.time = e.target.value; });
    } else {
      content.querySelectorAll("#hoursChips .chip").forEach(chip => {
        chip.addEventListener("click", () => { state.everyHours = parseInt(chip.dataset.h, 10); draw(); });
      });
      content.querySelector("#startTimeInput").addEventListener("input", (e) => { state.startTime = e.target.value; });
      content.querySelector("#endTimeInput").addEventListener("input", (e) => { state.endTime = e.target.value; });
    }

    content.querySelector("#saveReminderBtn").addEventListener("click", () => {
      if (needsName && !state.label.trim()) { showToast("Please enter a name"); return; }
      if (state.type === "water") state.label = "Drink Water";
      addReminder({ type: state.type, label: state.label.trim(), note: state.note.trim(), mode: state.mode, time: state.time, everyHours: state.everyHours, startTime: state.startTime, endTime: state.endTime });
      if (notifSupported() && Notification.permission === "default") requestNotifPermission();
      showToast("Reminder added");
      closeReminderModal();
      renderRemind();
    });
  }

  draw();
  document.getElementById("reminderModalBackdrop").classList.add("open");
}
function closeReminderModal() { document.getElementById("reminderModalBackdrop").classList.remove("open"); }

/* ---------------- Library view ---------------- */
let activeMuscleFilter = "all";
function renderLibrary() {
  const filterRow = document.getElementById("muscleFilters");
  if (!filterRow.dataset.built) {
    const chips = ["all", ...MUSCLE_GROUPS];
    filterRow.innerHTML = chips.map(m => `<div class="chip ${m === "all" ? "active" : ""}" data-m="${m}">${m}</div>`).join("");
    filterRow.dataset.built = "1";
    filterRow.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        activeMuscleFilter = chip.dataset.m;
        filterRow.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
        renderLibraryList();
      });
    });
  }
  document.getElementById("librarySearch").oninput = renderLibraryList;
  renderLibraryList();
}

function renderLibraryList() {
  const q = document.getElementById("librarySearch").value.trim().toLowerCase();
  const list = document.getElementById("libraryList");
  const all = Object.values(EXERCISES);
  const filtered = all.filter(ex => {
    const matchesMuscle = activeMuscleFilter === "all" ||
      ex.muscles.primary.includes(activeMuscleFilter) || ex.muscles.secondary.includes(activeMuscleFilter);
    const matchesSearch = !q || ex.name.toLowerCase().includes(q) ||
      ex.muscles.primary.some(m => m.includes(q));
    return matchesMuscle && matchesSearch;
  });
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state"><div class="emoji">🔍</div>No exercises match.</div>`;
    return;
  }
  list.innerHTML = filtered.map(ex => exerciseItemHtml(ex, {})).join("");
  list.querySelectorAll(".ex-item").forEach(el => {
    el.addEventListener("click", () => openExerciseModal(el.dataset.id, {}));
  });
}

/* ---------------- Learn view ---------------- */
function renderLearn() {
  const list = document.getElementById("breathingGuideList");
  list.innerHTML = BREATHING_GUIDE.map(g => `
    <div class="card learn-card">
      <div class="t">${g.title}</div>
      <div class="b">${g.text}</div>
    </div>
  `).join("");

  const supList = document.getElementById("supplementsList");
  supList.innerHTML = SUPPLEMENTS.map(s => `
    <div class="card learn-card supplement-card">
      <div class="t">${s.name}</div>
      <div class="b">${s.benefit}</div>
      <div class="sup-row"><span class="sup-lbl">Best time</span>${s.timing}</div>
      <div class="sup-row caution"><span class="sup-lbl">Caution</span>${s.caution}</div>
    </div>
  `).join("");
}

/* ---------------- Settings view ---------------- */
function renderSettings() {
  if (typeof updateAccountRow === "function") updateAccountRow();
  const signOutBtn = document.getElementById("signOutBtn");
  if (signOutBtn) signOutBtn.onclick = () => { if (typeof signOutUser === "function") signOutUser(); };

  const darkSwitch = document.getElementById("darkModeSwitch");
  darkSwitch.classList.toggle("on", settings.darkMode);
  darkSwitch.onclick = () => {
    settings.darkMode = !settings.darkMode;
    applyTheme();
    saveJSON(STORE_KEYS.SETTINGS, settings);
    renderSettings();
  };

  ["lb", "kg"].forEach(u => {
    const el = document.getElementById(`unit${u[0].toUpperCase()}${u[1]}`);
    el.classList.toggle("active", settings.unit === u);
    el.onclick = () => { settings.unit = u; saveJSON(STORE_KEYS.SETTINGS, settings); renderSettings(); };
  });

  document.querySelectorAll("[data-rest]").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.rest, 10) === settings.restLength);
    el.onclick = () => {
      settings.restLength = parseInt(el.dataset.rest, 10);
      saveJSON(STORE_KEYS.SETTINGS, settings);
      renderSettings();
    };
  });

  document.querySelectorAll("[data-cal]").forEach(el => {
    el.classList.toggle("active", parseInt(el.dataset.cal, 10) === settings.calorieGoal);
    el.onclick = () => {
      settings.calorieGoal = parseInt(el.dataset.cal, 10);
      saveJSON(STORE_KEYS.SETTINGS, settings);
      renderSettings();
    };
  });

  document.getElementById("resetProgressBtn").onclick = () => {
    if (confirm("Reset all workout progress and streak? This can't be undone.")) {
      progress = {};
      saveJSON(STORE_KEYS.PROGRESS, progress);
      showToast("Progress reset");
      updateStreakPill();
    }
  };

  document.getElementById("resetFoodLogBtn").onclick = () => {
    if (confirm("Clear today's logged food? This can't be undone.")) {
      delete foodLog[todayKey()];
      saveJSON(STORE_KEYS.FOODLOG, foodLog);
      showToast("Today's food log cleared");
    }
  };
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", settings.darkMode ? "dark" : "light");
}

/* ---------------- Exercise detail modal ---------------- */
function openExerciseModal(exId, ctx) {
  const ex = EXERCISES[exId];
  renderExerciseModal(ex, ctx || {});
  openModal();
}

function renderExerciseModal(ex, ctx) {
  const modalContent = document.getElementById("modalContent");
  const dose = ex.duration ? `${ex.sets} sets × ${ex.duration}` : `${ex.sets} sets × ${ex.reps} reps`;
  const videoHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.videoQuery)}`;

  const checkBtn = ctx.context === "today"
    ? `<button class="btn ${isExerciseDone(ctx.dateKey, ex.id) ? "btn-secondary" : "btn-primary"} btn-block" id="modalDoneBtn">
         ${isExerciseDone(ctx.dateKey, ex.id) ? "✓ Marked Complete" : "Mark as Complete"}
       </button>`
    : "";

  modalContent.innerHTML = `
    <div class="modal-title">${ex.name}</div>
    <div class="modal-meta-row">
      <span class="tag">${ex.level}</span>
      <span class="tag">${ex.equipment}</span>
      <span class="tag">${dose}</span>
    </div>

    <div class="body-map-wrap">${renderPoseFigure(ex.id)}</div>
    <div class="legend">
      <span><i style="background:var(--muscle-primary)"></i>Primary</span>
      <span><i style="background:var(--muscle-secondary)"></i>Secondary</span>
      <span><i style="background:var(--muscle-inactive)"></i>Not targeted</span>
    </div>

    <div class="section-label" style="margin-top:8px;">How to Do It</div>
    <ol class="steps-list">${ex.steps.map(s => `<li>${s}</li>`).join("")}</ol>

    <div class="section-label">Breathing</div>
    <div class="breathing-box"><div class="lbl">Inhale / Exhale cue</div>${ex.breathing}</div>

    <div class="section-label">Coaching Tips</div>
    <ul class="tip-list">${ex.tips.map(t => `<li>${t}</li>`).join("")}</ul>

    <div class="section-label">Common Mistakes</div>
    <ul class="mistake-list">${ex.mistakes.map(m => `<li><span>${m}</span></li>`).join("")}</ul>

    <div class="modal-actions">
      <a class="btn btn-secondary" style="flex:1; text-decoration:none;" href="${videoHref}" target="_blank" rel="noopener">▶ Watch Demo</a>
      <button class="btn btn-secondary" style="flex:1;" id="modalTimerBtn">⏱ Rest Timer</button>
    </div>
    ${checkBtn ? `<div style="margin-top:10px;">${checkBtn}</div>` : ""}
  `;

  document.getElementById("modalTimerBtn").addEventListener("click", () => startRestTimer(settings.restLength));

  const doneBtn = document.getElementById("modalDoneBtn");
  if (doneBtn) {
    doneBtn.addEventListener("click", () => {
      toggleExercise(ctx.dateKey, ex.id);
      renderExerciseModal(ex, ctx);
      if (document.getElementById("view-today").classList.contains("active")) renderToday();
    });
  }
}

/* ---------------- Modal open/close ---------------- */
function openModal() { document.getElementById("modalBackdrop").classList.add("open"); }
function closeModal() { document.getElementById("modalBackdrop").classList.remove("open"); }
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("modalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "modalBackdrop") closeModal();
});

document.getElementById("foodModalClose").addEventListener("click", closeFoodModal);
document.getElementById("foodModalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "foodModalBackdrop") closeFoodModal();
});

document.getElementById("reminderModalClose").addEventListener("click", closeReminderModal);
document.getElementById("reminderModalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "reminderModalBackdrop") closeReminderModal();
});

/* ---------------- Rest timer ---------------- */
let restInterval = null;
let restRemaining = 0;
function startRestTimer(seconds) {
  clearInterval(restInterval);
  restRemaining = seconds;
  const widget = document.getElementById("timerWidget");
  widget.classList.remove("hidden");
  updateTimerDisplay();
  restInterval = setInterval(() => {
    restRemaining--;
    if (restRemaining <= 0) {
      clearInterval(restInterval);
      widget.classList.add("hidden");
      showToast("Rest complete — next set!");
      if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
      return;
    }
    updateTimerDisplay();
  }, 1000);
}
function updateTimerDisplay() {
  const m = String(Math.floor(restRemaining / 60)).padStart(2, "0");
  const s = String(restRemaining % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${m}:${s}`;
}
document.getElementById("timerAdd15").addEventListener("click", () => { restRemaining += 15; updateTimerDisplay(); });
document.getElementById("timerCancel").addEventListener("click", () => {
  clearInterval(restInterval);
  document.getElementById("timerWidget").classList.add("hidden");
});

/* ---------------- Init ----------------
   initAppUI() is called by auth.js once the user is signed in and their
   cloud data (if any) has been loaded — not automatically on script load,
   since the app is gated behind sign-in. */
applyTheme();

let appUIStarted = false;
function initAppUI() {
  if (appUIStarted) { switchView(currentActiveView() || "today"); return; }
  appUIStarted = true;
  switchView("today");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").catch(() => {});
    });
  }

  /* Reminder scheduler — checks every 20s and once immediately, catching up
     on anything due since the app was last opened. Only fires while this
     page/tab is open; see the note on the Reminders tab for why. */
  checkReminders();
  setInterval(checkReminders, 20000);
}

function currentActiveView() {
  const active = document.querySelector(".nav-btn.active");
  return active ? active.dataset.view : null;
}
