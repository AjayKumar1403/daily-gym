/* ==========================================================================
   Daily Gym — SVG illustrations
   1) Body muscle map (front + back silhouette) with colorable regions
   2) Simple stick-figure "pattern" icons per movement type
   ========================================================================== */

/* ---- Body muscle map -----------------------------------------------------
   Each region is a shape with a data-muscle name. renderBodyMap() colors
   regions based on which muscles are passed as "primary" or "secondary".
---------------------------------------------------------------------------*/

function bodyMapColor(muscle, primarySet, secondarySet) {
  if (primarySet.has(muscle)) return "var(--muscle-primary)";
  if (secondarySet.has(muscle)) return "var(--muscle-secondary)";
  return "var(--muscle-inactive)";
}

function renderBodyMap(view, primary, secondary) {
  const primarySet = new Set(primary || []);
  const secondarySet = new Set(secondary || []);
  const c = (m) => bodyMapColor(m, primarySet, secondarySet);

  if (view === "front") {
    return `
<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" class="body-map" aria-label="Front body muscle map">
  <!-- head -->
  <circle cx="100" cy="28" r="20" fill="var(--muscle-inactive)"/>
  <!-- neck -->
  <rect x="92" y="46" width="16" height="14" fill="var(--muscle-inactive)"/>
  <!-- shoulders -->
  <ellipse data-muscle="shoulders" cx="62" cy="70" rx="18" ry="14" fill="${c('shoulders')}"/>
  <ellipse data-muscle="shoulders" cx="138" cy="70" rx="18" ry="14" fill="${c('shoulders')}"/>
  <!-- chest -->
  <rect data-muscle="chest" x="72" y="66" width="56" height="46" rx="12" fill="${c('chest')}"/>
  <!-- biceps -->
  <rect data-muscle="biceps" x="42" y="86" width="16" height="46" rx="8" fill="${c('biceps')}"/>
  <rect data-muscle="biceps" x="142" y="86" width="16" height="46" rx="8" fill="${c('biceps')}"/>
  <!-- forearms (inactive) -->
  <rect x="40" y="134" width="14" height="42" rx="7" fill="var(--muscle-inactive)"/>
  <rect x="146" y="134" width="14" height="42" rx="7" fill="var(--muscle-inactive)"/>
  <!-- abs -->
  <rect data-muscle="abs" x="80" y="114" width="40" height="56" rx="8" fill="${c('abs')}"/>
  <!-- obliques -->
  <rect data-muscle="obliques" x="66" y="118" width="14" height="48" rx="6" fill="${c('obliques')}"/>
  <rect data-muscle="obliques" x="120" y="118" width="14" height="48" rx="6" fill="${c('obliques')}"/>
  <!-- quads -->
  <rect data-muscle="quads" x="76" y="176" width="20" height="70" rx="9" fill="${c('quads')}"/>
  <rect data-muscle="quads" x="104" y="176" width="20" height="70" rx="9" fill="${c('quads')}"/>
  <!-- calves (front / shin) -->
  <rect data-muscle="calves" x="78" y="250" width="16" height="60" rx="7" fill="${c('calves')}"/>
  <rect data-muscle="calves" x="106" y="250" width="16" height="60" rx="7" fill="${c('calves')}"/>
  <!-- feet -->
  <ellipse cx="86" cy="320" rx="14" ry="8" fill="var(--muscle-inactive)"/>
  <ellipse cx="114" cy="320" rx="14" ry="8" fill="var(--muscle-inactive)"/>
</svg>`;
  }

  // back view
  return `
<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg" class="body-map" aria-label="Back body muscle map">
  <!-- head -->
  <circle cx="100" cy="28" r="20" fill="var(--muscle-inactive)"/>
  <!-- neck -->
  <rect x="92" y="46" width="16" height="14" fill="var(--muscle-inactive)"/>
  <!-- shoulders (rear delts) -->
  <ellipse data-muscle="shoulders" cx="62" cy="70" rx="18" ry="14" fill="${c('shoulders')}"/>
  <ellipse data-muscle="shoulders" cx="138" cy="70" rx="18" ry="14" fill="${c('shoulders')}"/>
  <!-- upper back / lats -->
  <rect data-muscle="back" x="72" y="66" width="56" height="46" rx="12" fill="${c('back')}"/>
  <!-- triceps -->
  <rect data-muscle="triceps" x="42" y="86" width="16" height="46" rx="8" fill="${c('triceps')}"/>
  <rect data-muscle="triceps" x="142" y="86" width="16" height="46" rx="8" fill="${c('triceps')}"/>
  <!-- forearms (inactive) -->
  <rect x="40" y="134" width="14" height="42" rx="7" fill="var(--muscle-inactive)"/>
  <rect x="146" y="134" width="14" height="42" rx="7" fill="var(--muscle-inactive)"/>
  <!-- lower back -->
  <rect data-muscle="lowerback" x="80" y="114" width="40" height="34" rx="8" fill="${c('lowerback')}"/>
  <!-- glutes -->
  <ellipse data-muscle="glutes" cx="88" cy="164" rx="18" ry="18" fill="${c('glutes')}"/>
  <ellipse data-muscle="glutes" cx="112" cy="164" rx="18" ry="18" fill="${c('glutes')}"/>
  <!-- hamstrings -->
  <rect data-muscle="hamstrings" x="76" y="184" width="20" height="62" rx="9" fill="${c('hamstrings')}"/>
  <rect data-muscle="hamstrings" x="104" y="184" width="20" height="62" rx="9" fill="${c('hamstrings')}"/>
  <!-- calves -->
  <rect data-muscle="calves" x="78" y="250" width="16" height="60" rx="7" fill="${c('calves')}"/>
  <rect data-muscle="calves" x="106" y="250" width="16" height="60" rx="7" fill="${c('calves')}"/>
  <!-- feet -->
  <ellipse cx="86" cy="320" rx="14" ry="8" fill="var(--muscle-inactive)"/>
  <ellipse cx="114" cy="320" rx="14" ry="8" fill="var(--muscle-inactive)"/>
</svg>`;
}

/* ---- Movement pattern stick-figure icons --------------------------------
   Simple, consistent line-art icons shown on exercise cards.
---------------------------------------------------------------------------*/

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
