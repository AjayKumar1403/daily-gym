/* ==========================================================================
   Daily Gym — App logic
   ========================================================================== */

/* ---------------- Storage helpers ---------------- */
const STORE_KEYS = { PROGRESS: "dg_progress", SETTINGS: "dg_settings", FOODLOG: "dg_foodlog" };

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}
function saveJSON(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage unavailable */ }
}

let progress = loadJSON(STORE_KEYS.PROGRESS, {});
let settings = loadJSON(STORE_KEYS.SETTINGS, { darkMode: false, unit: "lb", restLength: 60, calorieGoal: 2000 });
if (!settings.calorieGoal) settings.calorieGoal = 2000;
let foodLog = loadJSON(STORE_KEYS.FOODLOG, {});

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

/* ---------------- View switching ---------------- */
const views = ["today", "diet", "week", "library", "learn", "settings"];
function switchView(name) {
  views.forEach(v => {
    document.getElementById(`view-${v}`).classList.toggle("active", v === name);
  });
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === name);
  });
  if (name === "today") renderToday();
  if (name === "diet") renderDiet();
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
}

/* ---------------- Settings view ---------------- */
function renderSettings() {
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

/* ---------------- Init ---------------- */
applyTheme();
switchView("today");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
