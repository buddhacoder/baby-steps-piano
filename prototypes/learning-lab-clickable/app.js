const state = {
  currentStep: 0,
  currentMode: "lab",
  currentPalette: "chords",
  attemptCount: 0,
  activeSequenceToken: 0,
  selectedRepertoireId: "bach",
};

const el = {
  objectiveKicker: document.getElementById("objectiveKicker"),
  objectiveTitle: document.getElementById("objectiveTitle"),
  objectiveCopy: document.getElementById("objectiveCopy"),
  stepsRow: document.getElementById("stepsRow"),
  paletteTabs: document.getElementById("paletteTabs"),
  sessionPills: document.getElementById("sessionPills"),
  keyboard: document.getElementById("keyboard"),
  tableHead: document.getElementById("tableHead"),
  tableBody: document.getElementById("tableBody"),
  tableStatus: document.getElementById("tableStatus"),
  guideCopy: document.getElementById("guideCopy"),
  guideBadge: document.getElementById("guideBadge"),
  transferCopy: document.getElementById("transferCopy"),
  attemptMeter: document.getElementById("attemptMeter"),
  attemptMeta: document.getElementById("attemptMeta"),
  featuredGrid: document.getElementById("featuredGrid"),
  repDetail: document.getElementById("repDetail"),
  suggestions: document.getElementById("suggestions"),
  watchDemoBtn: document.getElementById("watchDemoBtn"),
  markAttemptBtn: document.getElementById("markAttemptBtn"),
  suggestedBtn: document.getElementById("suggestedBtn"),
  playStudyBtn: document.getElementById("playStudyBtn"),
  simulatePlay: document.getElementById("simulatePlay"),
};

const steps = [
  {
    kicker: "Concept Objective",
    title: "Hear why V7 resolves to I",
    copy: "Outcome: understand tension/release and transfer it to your real piano in 3 keys.",
    guide: "Why it works: dominant function pulls strongly into tonic because semitone voice-leading wants to resolve.",
    badge: "Theory Focus: Dominant Function",
    transfer: "Play G7 -> C on your piano, then transpose to F and D while keeping the top voice smooth.",
    pills: ["Key: C", "BPM: 78", "Subdivision: Eighth", "Exercise: Power of Resolution"],
    table: {
      columns: ["1", "2", "3", "4", "5", "6", "7", "8"],
      rows: [
        { name: "Triad", cells: ["C", "Dm", "Em", "F", "G", "Am", "Bdim", "C"] },
        { name: "7th", cells: ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5", "Cmaj7"] },
      ],
    },
    keyboard: { active: [0, 6, 13], removed: [], added: [] },
  },
  {
    kicker: "Visual Analysis",
    title: "See voice movement between chords",
    copy: "Removed tones fade red, new tones pulse green, shared tones stay stable.",
    guide: "This is for finger mapping: see exactly what changed before you release and play the next chord.",
    badge: "Theory Focus: Voice Leading",
    transfer: "Hold one chord, arm the next chord, then identify which fingers must move.",
    pills: ["Current: V7 -> I", "Motion Overlay: ON", "Hold to inspect"],
    table: {
      columns: ["Authentic", "Plagal", "Half", "Deceptive", "Backdoor", "ii-V-I", "vi-ii-V-I", "Turnaround"],
      rows: [
        { name: "Cadences", cells: ["V7 -> I", "IV -> I", "ii -> V", "V -> vi", "bVII7 -> I", "ii-V-I", "vi-ii-V-I", "I-VI7-ii-V"] },
      ],
    },
    keyboard: { active: [5, 8, 12], removed: [7], added: [9] },
  },
  {
    kicker: "Transfer Checkpoint",
    title: "Recreate on your real piano",
    copy: "Use the same concept in 3 keys to prove transfer, not memorization.",
    guide: "You pass when timing is even and the same voicing idea survives transposition.",
    badge: "Theory Focus: Transfer Skill",
    transfer: "Run C -> F -> D. Keep left hand shell compact and right hand guide tones smooth.",
    pills: ["Loop: 4 bars", "Keys: C/F/D", "Self-check: ON"],
    table: {
      columns: ["Timing", "Shape", "Root", "Guide tones", "Dynamics", "Pedal", "Transpose", "Pass"],
      rows: [
        { name: "Attempt 1", cells: ["Good", "Good", "Good", "Needs work", "Good", "Off", "C only", "No"] },
        { name: "Attempt 2", cells: ["Good", "Good", "Good", "Good", "Good", "Good", "C + F", "Almost"] },
        { name: "Attempt 3", cells: ["Good", "Good", "Good", "Good", "Good", "Good", "C + F + D", "Pass"] },
      ],
    },
    keyboard: { active: [10, 15, 18], removed: [], added: [] },
  },
  {
    kicker: "Repertoire Anchor",
    title: "Apply concept in musical context",
    copy: "Pick a licensed study, then jump straight to related concepts and exercises.",
    guide: "Anchor each concept to at least one repertoire item so learning is contextual and repeatable.",
    badge: "Theory Focus: Contextual Learning",
    transfer: "After hearing the study loop, reproduce just the target cadence on your piano in the same key.",
    pills: ["Repertoire: Featured", "Jump to related palette", "Exercise link: ON"],
    table: {
      columns: ["Cadences", "Arpeggios", "Scales", "Modes", "Secondary", "Borrowed", "Substitution", "Exercises"],
      rows: [
        { name: "From Tags", cells: ["Authentic", "Triad root", "Major", "Mixolydian", "Row sweep", "Borrowed row", "Tritone compare", "Arpeggio Arch"] },
      ],
    },
    keyboard: { active: [2, 9, 16], removed: [], added: [] },
  },
];

const repertoire = [
  {
    id: "bach",
    title: "Bach Prelude in C",
    meta: "Public Domain • Mutopia",
    focus: "Arpeggios, cadences, secondary dominants",
    suggestions: ["Cadences: Authentic", "Arpeggios: Triad Root", "Secondary: Row Sweep"],
  },
  {
    id: "blues",
    title: "12-Bar Blues Study",
    meta: "Internal Study • Original",
    focus: "Blues scale, dominant color, backdoor",
    suggestions: ["Pentatonic: Blues", "Cadences: Backdoor", "Dominant Colors"],
  },
  {
    id: "bossa",
    title: "Bossa ii-V-I Study",
    meta: "Internal Study • Original",
    focus: "ii-V-I flow, shell voicing",
    suggestions: ["Cadences: ii-V-I", "Modes: Mixolydian", "Exercises: ii-V-I Builder"],
  },
  {
    id: "rock",
    title: "Rock Mixolydian Study",
    meta: "Internal Study • Original",
    focus: "I-bVII-IV modal movement",
    suggestions: ["Modes: Mixolydian", "Borrowed: Row", "Exercises: Modal Contrast"],
  },
];

function createKeyboard() {
  el.keyboard.innerHTML = "";
  const windowLine = document.createElement("div");
  windowLine.className = "window-line";
  el.keyboard.appendChild(windowLine);

  const whiteCount = 36;
  for (let i = 0; i < whiteCount; i += 1) {
    const key = document.createElement("div");
    key.className = "key";
    key.dataset.index = String(i);
    el.keyboard.appendChild(key);
  }

  const blackPositions = [1.6, 2.6, 4.6, 5.6, 6.6, 8.6, 9.6, 11.6, 12.6, 13.6, 15.6, 16.6, 18.6, 19.6, 20.6, 22.6, 23.6, 25.6, 26.6, 27.6, 29.6, 30.6, 32.6, 33.6, 34.6];
  blackPositions.forEach((pos) => {
    const black = document.createElement("div");
    black.className = "black-key";
    black.style.left = `calc((100% / 36) * ${pos})`;
    el.keyboard.appendChild(black);
  });
}

function applyKeyboardState() {
  const config = steps[state.currentStep].keyboard;
  const keys = Array.from(el.keyboard.querySelectorAll(".key"));
  keys.forEach((key, idx) => {
    key.classList.remove("active", "removed", "added");
    if (config.active.includes(idx)) key.classList.add("active");
    if (config.removed.includes(idx)) key.classList.add("removed");
    if (config.added.includes(idx)) key.classList.add("added");
  });
}

function renderSessionPills() {
  const items = steps[state.currentStep].pills;
  el.sessionPills.innerHTML = "";
  items.forEach((txt) => {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = txt;
    el.sessionPills.appendChild(span);
  });
}

function renderObjective() {
  const s = steps[state.currentStep];
  el.objectiveKicker.textContent = s.kicker;
  el.objectiveTitle.textContent = s.title;
  el.objectiveCopy.textContent = s.copy;
  el.guideCopy.textContent = s.guide;
  el.guideBadge.textContent = s.badge;
  el.transferCopy.textContent = s.transfer;
  renderSessionPills();
}

function renderStepButtons() {
  const buttons = Array.from(el.stepsRow.querySelectorAll(".step-btn"));
  buttons.forEach((btn, idx) => btn.classList.toggle("active", idx === state.currentStep));
}

function renderPaletteTabs() {
  const buttons = Array.from(el.paletteTabs.querySelectorAll(".chip"));
  buttons.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === state.currentPalette));
}

function renderTable() {
  const table = steps[state.currentStep].table;
  el.tableHead.innerHTML = "";
  el.tableBody.innerHTML = "";

  const headRow = document.createElement("tr");
  const corner = document.createElement("th");
  corner.textContent = "Concept";
  corner.className = "col-label";
  headRow.appendChild(corner);

  table.columns.forEach((col, colIdx) => {
    const th = document.createElement("th");
    th.textContent = col;
    th.className = "col-label";
    th.dataset.colIndex = String(colIdx);
    headRow.appendChild(th);
  });

  el.tableHead.appendChild(headRow);

  table.rows.forEach((row, rowIdx) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = row.name;
    th.className = "row-label";
    th.dataset.rowIndex = String(rowIdx);
    tr.appendChild(th);

    row.cells.forEach((txt, colIdx) => {
      const td = document.createElement("td");
      td.textContent = txt;
      td.className = "concept-cell";
      td.dataset.rowIndex = String(rowIdx);
      td.dataset.colIndex = String(colIdx);
      tr.appendChild(td);
    });

    el.tableBody.appendChild(tr);
  });
}

function clearTableHighlights() {
  el.tableBody.querySelectorAll(".concept-cell").forEach((cell) => {
    cell.classList.remove("active", "resolve");
    cell.querySelectorAll(".confetti").forEach((c) => c.remove());
  });
}

function addConfetti(cell) {
  if (!cell) return;
  for (let i = 0; i < 3; i += 1) {
    const icon = document.createElement("span");
    icon.className = "confetti";
    icon.textContent = ["♪", "♫", "♬"][i % 3];
    icon.style.right = `${8 + i * 12}px`;
    icon.style.animationDelay = `${i * 40}ms`;
    cell.appendChild(icon);
    setTimeout(() => icon.remove(), 520 + i * 45);
  }
}

function playSequence(cells) {
  if (!cells.length) return;
  const token = ++state.activeSequenceToken;
  clearTableHighlights();

  const stepMs = 220;
  cells.forEach((cell, idx) => {
    setTimeout(() => {
      if (token !== state.activeSequenceToken) return;
      cell.classList.add("active");
      if (idx > 0) cells[idx - 1].classList.remove("active");

      if (idx === cells.length - 1) {
        cell.classList.remove("active");
        cell.classList.add("resolve");
        addConfetti(cell);
        el.tableStatus.textContent = "Sequence resolved on final destination. This is where the release lands.";
      }
    }, idx * stepMs);
  });
}

function runRowSequence(rowIdx) {
  const cells = Array.from(el.tableBody.querySelectorAll(`.concept-cell[data-row-index='${rowIdx}']`));
  playSequence(cells);
}

function runColSequence(colIdx) {
  const cells = Array.from(el.tableBody.querySelectorAll(`.concept-cell[data-col-index='${colIdx}']`));
  playSequence(cells);
}

function renderRepertoireCards() {
  el.featuredGrid.innerHTML = "";
  repertoire.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "featured-card";
    if (item.id === state.selectedRepertoireId) btn.classList.add("active");
    btn.dataset.id = item.id;
    btn.textContent = item.title;
    el.featuredGrid.appendChild(btn);
  });
}

function renderRepertoireDetail() {
  const item = repertoire.find((x) => x.id === state.selectedRepertoireId);
  if (!item) return;

  el.repDetail.innerHTML = `
    <p><strong>${item.title}</strong></p>
    <p class="tiny">${item.meta}</p>
    <p>${item.focus}</p>
  `;
}

function renderSuggestions() {
  const item = repertoire.find((x) => x.id === state.selectedRepertoireId);
  el.suggestions.innerHTML = "";
  if (!item) return;
  item.suggestions.forEach((s) => {
    const pill = document.createElement("span");
    pill.className = "suggestion";
    pill.textContent = s;
    el.suggestions.appendChild(pill);
  });
}

function updateAttempt() {
  state.attemptCount += 1;
  const pct = Math.min(100, state.attemptCount * 20);
  el.attemptMeter.style.width = `${pct}%`;
  el.attemptMeta.textContent = `Attempts logged: ${state.attemptCount}`;
}

function bindEvents() {
  document.querySelectorAll(".topnav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.currentMode = btn.dataset.mode;
      document.querySelectorAll(".topnav-btn").forEach((b) => b.classList.toggle("active", b === btn));
      if (state.currentMode === "repertoire") state.currentStep = 3;
      if (state.currentMode === "explore") state.currentStep = 1;
      if (state.currentMode === "lab") state.currentStep = 0;
      renderAll();
    });
  });

  el.stepsRow.addEventListener("click", (event) => {
    const btn = event.target.closest(".step-btn");
    if (!btn) return;
    state.currentStep = Number(btn.dataset.step);
    renderAll();
  });

  el.paletteTabs.addEventListener("click", (event) => {
    const btn = event.target.closest(".chip[data-tab]");
    if (!btn) return;
    state.currentPalette = btn.dataset.tab;
    renderPaletteTabs();
    el.tableStatus.textContent = `Palette selected: ${state.currentPalette}. Click a row/column to run a teaching sequence.`;
  });

  el.tableBody.addEventListener("click", (event) => {
    const rowLabel = event.target.closest(".row-label");
    if (rowLabel) {
      runRowSequence(Number(rowLabel.dataset.rowIndex));
      return;
    }
    const cell = event.target.closest(".concept-cell");
    if (cell) {
      playSequence([cell]);
    }
  });

  el.tableHead.addEventListener("click", (event) => {
    const colLabel = event.target.closest(".col-label[data-col-index]");
    if (!colLabel) return;
    runColSequence(Number(colLabel.dataset.colIndex));
  });

  el.simulatePlay.addEventListener("click", () => runRowSequence(0));
  el.watchDemoBtn.addEventListener("click", () => runRowSequence(0));
  el.markAttemptBtn.addEventListener("click", updateAttempt);

  el.featuredGrid.addEventListener("click", (event) => {
    const btn = event.target.closest(".featured-card[data-id]");
    if (!btn) return;
    state.selectedRepertoireId = btn.dataset.id;
    renderRepertoireCards();
    renderRepertoireDetail();
    el.suggestions.innerHTML = "";
  });

  el.suggestedBtn.addEventListener("click", renderSuggestions);

  el.playStudyBtn.addEventListener("click", () => {
    state.currentStep = 3;
    renderAll();
    runRowSequence(0);
  });
}

function renderAll() {
  renderObjective();
  renderStepButtons();
  renderPaletteTabs();
  renderTable();
  applyKeyboardState();
  renderRepertoireCards();
  renderRepertoireDetail();
  el.suggestions.innerHTML = "";
  clearTableHighlights();
  el.tableStatus.textContent = "Tip: click a row label or column label to run the sequence.";
}

function init() {
  createKeyboard();
  bindEvents();
  renderAll();
}

init();
