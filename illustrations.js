/* ==========================================================================
   Daily Gym — SVG illustrations
   1) Posed figure engine — a simple forward-kinematics stick/capsule figure
      drawn in the actual exercise position, with muscles colored directly
      on the body segment being worked (primary / secondary / not targeted).
   2) Small movement-pattern icons used on exercise list rows.
   ========================================================================== */

/* ---- Tiny forward-kinematics figure engine ------------------------------ */

const FIG = { torsoLen: 55, neckLen: 12, headR: 13, thighLen: 52, shinLen: 48, upperArmLen: 40, forearmLen: 36 };

function deg2rad(d) { return (d * Math.PI) / 180; }

function rotPoint(x, y, deg) {
  const r = deg2rad(deg);
  const cs = Math.cos(r), sn = Math.sin(r);
  return [x * cs - y * sn, x * sn + y * cs];
}

// Computes all named joint keypoints for a pose descriptor.
// Angles are defined in a canonical "standing" local frame, then the whole
// figure is rotated by bodyRotation (0 = standing, 90 = lying on the floor)
// around the hip root and translated to its position on the canvas.
function computeFigure(pose) {
  const {
    torsoAngle = 0, hipAngle = 0, kneeAngle = 0,
    shoulderAngle = 10, elbowAngle = 10,
    bodyRotation = 0, rootX = 130, rootY = 125,
    gluteOffset = [-15, 5], footFwd = 20
  } = pose;

  const hip = [0, 0];
  const torsoVec = [Math.sin(deg2rad(torsoAngle)), -Math.cos(deg2rad(torsoAngle))];
  const neck = [hip[0] + torsoVec[0] * FIG.torsoLen, hip[1] + torsoVec[1] * FIG.torsoLen];
  const waist = [hip[0] + torsoVec[0] * FIG.torsoLen * 0.45, hip[1] + torsoVec[1] * FIG.torsoLen * 0.45];
  const headBase = [neck[0] + torsoVec[0] * FIG.neckLen, neck[1] + torsoVec[1] * FIG.neckLen];
  const head = [headBase[0] + torsoVec[0] * FIG.headR, headBase[1] + torsoVec[1] * FIG.headR];

  const thighVec = [Math.sin(deg2rad(hipAngle)), Math.cos(deg2rad(hipAngle))];
  const knee = [hip[0] + thighVec[0] * FIG.thighLen, hip[1] + thighVec[1] * FIG.thighLen];
  const shinAngle = hipAngle - kneeAngle;
  const shinVec = [Math.sin(deg2rad(shinAngle)), Math.cos(deg2rad(shinAngle))];
  const ankle = [knee[0] + shinVec[0] * FIG.shinLen, knee[1] + shinVec[1] * FIG.shinLen];
  const toe = [ankle[0] + footFwd, ankle[1] + 4];

  const shoulder = neck;
  const upperArmVec = [Math.sin(deg2rad(shoulderAngle)), Math.cos(deg2rad(shoulderAngle))];
  const elbow = [shoulder[0] + upperArmVec[0] * FIG.upperArmLen, shoulder[1] + upperArmVec[1] * FIG.upperArmLen];
  const foreArmAngle = shoulderAngle - elbowAngle;
  const foreArmVec = [Math.sin(deg2rad(foreArmAngle)), Math.cos(deg2rad(foreArmAngle))];
  const hand = [elbow[0] + foreArmVec[0] * FIG.forearmLen, elbow[1] + foreArmVec[1] * FIG.forearmLen];

  const glute = [hip[0] + gluteOffset[0], hip[1] + gluteOffset[1]];

  const raw = { head, neck, waist, hip, knee, ankle, toe, shoulder, elbow, hand, glute };
  const out = {};
  for (const k in raw) {
    const [x, y] = rotPoint(raw[k][0], raw[k][1], bodyRotation);
    out[k] = [x + rootX, y + rootY];
  }
  return out;
}

function resolveMuscleColor(options, primarySet, secondarySet) {
  for (const m of options) if (primarySet.has(m)) return "var(--muscle-primary)";
  for (const m of options) if (secondarySet.has(m)) return "var(--muscle-secondary)";
  return "var(--muscle-inactive)";
}

function segLine(p1, p2, w, color) {
  return `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function segDot(p, r, color) {
  return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${color}"/>`;
}

/* Per-exercise pose parameters. bodyRotation 0 = standing, 90 = on the floor. */
const POSES = {
  squat:          { torsoAngle: 20, hipAngle: 65, kneeAngle: 95, shoulderAngle: 75, elbowAngle: 15, rootY: 150 },
  pushup:         { bodyRotation: 90, shoulderAngle: 80, elbowAngle: 70, rootY: 110, footFwd: 14 },
  glutebridge:    { bodyRotation: 90, hipAngle: 50, kneeAngle: 90, shoulderAngle: 95, elbowAngle: 5, rootY: 115, footFwd: 10 },
  row:            { torsoAngle: 55, hipAngle: 15, kneeAngle: 15, shoulderAngle: 80, elbowAngle: 25, rootY: 125 },
  plank:          { bodyRotation: 90, shoulderAngle: 80, elbowAngle: 90, rootY: 120, footFwd: 14 },
  lunge:          { torsoAngle: 10, hipAngle: 40, kneeAngle: 90, shoulderAngle: 20, elbowAngle: 20, rootY: 135 },
  ohp:            { shoulderAngle: 175, elbowAngle: 10, rootY: 120 },
  superman:       { bodyRotation: 90, hipAngle: -10, shoulderAngle: 170, elbowAngle: 0, rootY: 120 },
  mountainclimber:{ bodyRotation: 90, hipAngle: -60, kneeAngle: 100, shoulderAngle: 80, elbowAngle: 70, rootY: 120, footFwd: 10 },
  bicepcurl:      { shoulderAngle: 15, elbowAngle: 110, rootY: 120 },
  tricepdip:      { torsoAngle: 10, hipAngle: 80, kneeAngle: 90, shoulderAngle: -20, elbowAngle: 90, rootY: 150 },
  sideplank:      { bodyRotation: 90, shoulderAngle: 85, elbowAngle: 80, rootY: 120, footFwd: 12 },
  stepup:         { torsoAngle: 5, hipAngle: 75, kneeAngle: 95, shoulderAngle: 10, elbowAngle: 15, rootY: 130 },
  birddog:        { bodyRotation: 90, hipAngle: -30, kneeAngle: 10, shoulderAngle: 170, elbowAngle: 5, rootY: 115, footFwd: 20 },
  calfraise:      { kneeAngle: 5, shoulderAngle: 10, elbowAngle: 10, rootY: 118, footFwd: 10 },
  deadlift:       { torsoAngle: 45, hipAngle: 10, kneeAngle: 10, shoulderAngle: 5, elbowAngle: 5, rootY: 125 },
  burpee:         { shoulderAngle: 170, elbowAngle: 5, rootY: 110, footFwd: 15 },
  russiantwist:   { torsoAngle: -25, hipAngle: 80, kneeAngle: 95, shoulderAngle: 40, elbowAngle: 60, rootY: 150 },
  wallsit:        { hipAngle: 85, kneeAngle: 90, shoulderAngle: 0, elbowAngle: 5, rootY: 145 },
  bandpull:       { shoulderAngle: 30, elbowAngle: 100, rootY: 120 },
  chestfly:       { bodyRotation: 90, shoulderAngle: 100, elbowAngle: 15, rootY: 120, footFwd: 15 },
  highknees:      { torsoAngle: 5, hipAngle: 85, kneeAngle: 100, shoulderAngle: 60, elbowAngle: 90, rootY: 125 },
  reverselunge:   { torsoAngle: 8, hipAngle: 35, kneeAngle: 80, shoulderAngle: 15, elbowAngle: 15, rootY: 133 },
  deadbug:        { bodyRotation: 90, hipAngle: -20, kneeAngle: 10, shoulderAngle: 160, elbowAngle: 5, rootY: 120, footFwd: 22 }
};

function renderPoseFigure(exId) {
  const ex = EXERCISES[exId];
  const pose = POSES[exId] || {};
  const primarySet = new Set(ex.muscles.primary);
  const secondarySet = new Set(ex.muscles.secondary);
  const pts = computeFigure(pose);
  const inactive = "var(--muscle-inactive)";

  const cTorsoUpper = resolveMuscleColor(["chest", "back"], primarySet, secondarySet);
  const cTorsoLower = resolveMuscleColor(["abs", "obliques", "lowerback"], primarySet, secondarySet);
  const cShoulder = resolveMuscleColor(["shoulders"], primarySet, secondarySet);
  const cArm = resolveMuscleColor(["biceps", "triceps"], primarySet, secondarySet);
  const cGlute = resolveMuscleColor(["glutes"], primarySet, secondarySet);
  const cThigh = resolveMuscleColor(["quads", "hamstrings"], primarySet, secondarySet);
  const cShin = resolveMuscleColor(["calves"], primarySet, secondarySet);

  return `
<svg viewBox="0 0 260 210" xmlns="http://www.w3.org/2000/svg" class="pose-figure" aria-label="${ex.name} illustration">
  ${segLine(pts.hip, pts.knee, 20, cThigh)}
  ${segLine(pts.knee, pts.ankle, 15, cShin)}
  ${segLine(pts.ankle, pts.toe, 11, inactive)}
  ${segLine(pts.waist, pts.hip, 20, cTorsoLower)}
  ${segLine(pts.neck, pts.waist, 24, cTorsoUpper)}
  ${segDot(pts.glute, 15, cGlute)}
  ${segLine(pts.shoulder, pts.elbow, 15, cArm)}
  ${segLine(pts.elbow, pts.hand, 13, inactive)}
  ${segDot(pts.shoulder, 11, cShoulder)}
  ${segDot(pts.head, FIG.headR, inactive)}
</svg>`;
}

/* ---- Small movement pattern icons (used on exercise list rows) ---------- */

const PATTERN_ICONS = {
  squat: `<svg viewBox="0 0 100 100"><circle cx="50" cy="18" r="8"/><path d="M50 26 L50 50 M50 50 L34 66 M50 50 L66 66 M34 66 L30 84 M66 66 L70 84 M38 40 L20 52 M62 40 L80 52"/></svg>`,
  push: `<svg viewBox="0 0 100 100"><circle cx="24" cy="46" r="8"/><path d="M24 54 L70 54 M70 54 L86 40 M70 54 L86 68 M40 54 L36 78 M60 54 L64 78 M32 46 L48 34"/></svg>`,
  pull: `<svg viewBox="0 0 100 100"><circle cx="50" cy="18" r="8"/><path d="M50 26 L50 60 M50 34 L26 46 M50 34 L74 46 M50 60 L36 84 M50 60 L64 84 M26 46 L18 30 M74 46 L82 30"/></svg>`,
  hinge: `<svg viewBox="0 0 100 100"><circle cx="30" cy="30" r="8"/><path d="M30 38 L58 58 M40 46 L20 56 M46 50 L52 74 M58 58 L48 82 M58 58 L72 78 M40 46 L46 30"/></svg>`,
  lunge: `<svg viewBox="0 0 100 100"><circle cx="46" cy="16" r="8"/><path d="M46 24 L48 50 M48 50 L28 70 M48 50 L74 62 M28 70 L24 88 M74 62 L82 42 M38 34 L22 44 M58 34 L70 26"/></svg>`,
  isometric: `<svg viewBox="0 0 100 100"><circle cx="24" cy="50" r="8"/><path d="M24 58 L80 58 M40 58 L36 78 M64 58 L68 78 M30 50 L46 40"/></svg>`,
  cardio: `<svg viewBox="0 0 100 100"><circle cx="50" cy="16" r="8"/><path d="M50 24 L50 54 M50 34 L26 24 M50 34 L74 46 M50 54 L28 60 M50 54 L70 82"/></svg>`,
  curl: `<svg viewBox="0 0 100 100"><circle cx="50" cy="18" r="8"/><path d="M50 26 L50 60 M50 60 L34 84 M50 60 L66 84 M50 34 L28 44 M28 44 L34 24 M50 34 L72 40"/></svg>`,
  calf: `<svg viewBox="0 0 100 100"><circle cx="50" cy="18" r="8"/><path d="M50 26 L50 60 M50 60 L40 90 M50 60 L60 90 M50 34 L30 46 M50 34 L70 46"/><path d="M34 90 L46 90 M54 90 L66 90"/></svg>`,
  extension: `<svg viewBox="0 0 100 100"><circle cx="20" cy="52" r="8"/><path d="M20 52 L80 52 M40 52 L20 36 M60 52 L82 40 M40 52 L34 76 M56 52 L60 76"/></svg>`,
  core: `<svg viewBox="0 0 100 100"><circle cx="50" cy="60" r="8"/><path d="M50 68 L50 82 M42 40 L58 40 M42 40 L28 24 M58 40 L74 30 M50 68 L30 88 M50 68 L70 88"/></svg>`,
  fly: `<svg viewBox="0 0 100 100"><circle cx="50" cy="20" r="8"/><path d="M50 28 L50 62 M50 40 L18 26 M50 40 L82 26 M50 62 L36 86 M50 62 L64 86"/></svg>`
};

function patternIcon(pattern) {
  return PATTERN_ICONS[pattern] || PATTERN_ICONS.core;
}
