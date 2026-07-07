/* ==========================================================================
   Daily Gym — Exercise Database
   Each exercise: id, name, pattern (for illustration), muscles (for body map),
   equipment, level, sets/reps or duration, steps, breathing cue, tips,
   mistakes, videoQuery (used to build a YouTube search link)
   ========================================================================== */

const MUSCLE_GROUPS = [
  "chest", "shoulders", "biceps", "triceps", "back", "lowerback",
  "abs", "obliques", "quads", "hamstrings", "glutes", "calves"
];

const EXERCISES = {

  squat: {
    id: "squat",
    name: "Bodyweight Squat",
    pattern: "squat",
    muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings", "abs"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "12-15",
    steps: [
      "Stand with feet shoulder-width apart, toes slightly turned out.",
      "Brace your core and keep your chest tall.",
      "Push your hips back and bend your knees to lower down, as if sitting into a chair.",
      "Go down until thighs are at least parallel to the floor (or as deep as comfortable).",
      "Keep knees tracking over your toes, weight in mid-foot/heels.",
      "Drive through your heels to stand back up to the start."
    ],
    breathing: "Inhale at the top before you descend. Hold a light brace as you lower down. Exhale forcefully through your mouth as you drive back up to standing.",
    tips: ["Keep your chest up, don't round your lower back.", "Knees should track in line with your toes, not collapse inward."],
    mistakes: ["Rounding the lower back at the bottom", "Rising onto toes instead of pushing through heels", "Knees caving inward"],
    videoQuery: "bodyweight squat proper form tutorial"
  },

  pushup: {
    id: "pushup",
    name: "Push-Up",
    pattern: "push",
    muscles: { primary: ["chest", "triceps"], secondary: ["shoulders", "abs"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "8-12",
    steps: [
      "Start in a plank with hands slightly wider than shoulders, arms straight.",
      "Keep your body in one straight line from head to heels — brace your core and glutes.",
      "Lower your chest toward the floor by bending your elbows at about a 45° angle to your body.",
      "Go down until your chest is a couple inches from the floor.",
      "Push through your palms to press back up to the start position."
    ],
    breathing: "Inhale as you lower your chest to the floor. Exhale as you push back up to the top.",
    tips: ["Keep hips from sagging or piking — think 'straight plank' the whole time.", "Drop to knees if needed to keep good form."],
    mistakes: ["Sagging hips", "Flaring elbows straight out to the sides", "Only doing a half range of motion"],
    videoQuery: "push up proper form tutorial"
  },

  glutebridge: {
    id: "glutebridge",
    name: "Glute Bridge",
    pattern: "hinge",
    muscles: { primary: ["glutes"], secondary: ["hamstrings", "abs"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "15",
    steps: [
      "Lie on your back with knees bent, feet flat on the floor hip-width apart, close to your glutes.",
      "Arms rest flat by your sides for stability.",
      "Squeeze your glutes and push through your heels to lift your hips toward the ceiling.",
      "Form a straight line from shoulders to knees at the top — don't overarch the lower back.",
      "Pause and squeeze at the top, then lower with control."
    ],
    breathing: "Inhale as your hips lower to the floor. Exhale and squeeze your glutes hard as you lift your hips up.",
    tips: ["Drive through heels, not toes.", "Squeeze glutes at the top rather than just arching your back."],
    mistakes: ["Overarching the lower back", "Pushing through toes instead of heels"],
    videoQuery: "glute bridge proper form tutorial"
  },

  row: {
    id: "row",
    name: "Bent-Over Row (Dumbbell or Band)",
    pattern: "pull",
    muscles: { primary: ["back"], secondary: ["biceps", "shoulders"] },
    equipment: "Dumbbells or resistance band",
    level: "Beginner",
    sets: 3, reps: "10-12",
    steps: [
      "Hold a weight in each hand, hinge at the hips until your torso is roughly 45° forward, knees slightly bent.",
      "Let your arms hang straight down, shoulder blades relaxed.",
      "Keep a flat back and braced core throughout.",
      "Pull both weights up toward your lower ribs, squeezing your shoulder blades together.",
      "Lower with control back to a full arm extension."
    ],
    breathing: "Exhale as you pull the weight up toward your torso. Inhale as you lower it back down.",
    tips: ["Lead with your elbows, not your hands.", "Keep your neck neutral — look slightly down, not straight ahead."],
    mistakes: ["Rounding the back", "Using momentum/jerking the weight up instead of controlled pulling"],
    videoQuery: "dumbbell bent over row proper form"
  },

  plank: {
    id: "plank",
    name: "Plank",
    pattern: "isometric",
    muscles: { primary: ["abs"], secondary: ["lowerback", "shoulders"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, duration: "30-45 sec",
    steps: [
      "Rest on your forearms and toes, elbows directly under your shoulders.",
      "Form a straight line from head to heels.",
      "Squeeze your glutes and brace your abs as if bracing for a punch.",
      "Keep your neck neutral, eyes toward the floor.",
      "Hold the position for the target time without letting hips sag or pike up."
    ],
    breathing: "Don't hold your breath. Breathe in slow, controlled belly breaths the entire time you hold the plank.",
    tips: ["Squeeze glutes to help keep hips level.", "Shorten the hold time before letting form break down."],
    mistakes: ["Letting hips sag toward the floor", "Holding your breath", "Piking hips up too high"],
    videoQuery: "plank proper form tutorial"
  },

  lunge: {
    id: "lunge",
    name: "Walking Lunge",
    pattern: "lunge",
    muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings", "abs"] },
    equipment: "None (optional dumbbells)",
    level: "Intermediate",
    sets: 3, reps: "10 per leg",
    steps: [
      "Stand tall, core braced, hands on hips or holding dumbbells at your sides.",
      "Step forward with one leg, landing on the heel first.",
      "Lower your back knee toward the floor until both knees are bent around 90°.",
      "Front knee should stay above the ankle, not pushed far past the toes.",
      "Push through the front heel to bring your back leg forward into the next step, continuing to 'walk' forward."
    ],
    breathing: "Inhale as you step forward and lower down. Exhale as you push back up to bring your feet together or into the next step.",
    tips: ["Keep your torso upright, don't lean forward.", "Take a long enough step that your front knee doesn't shoot past your toes."],
    mistakes: ["Front knee collapsing inward", "Too short a stride causing knee strain", "Leaning the torso too far forward"],
    videoQuery: "walking lunge proper form tutorial"
  },

  ohp: {
    id: "ohp",
    name: "Overhead Press (Dumbbell)",
    pattern: "push",
    muscles: { primary: ["shoulders"], secondary: ["triceps", "abs"] },
    equipment: "Dumbbells",
    level: "Intermediate",
    sets: 3, reps: "8-10",
    steps: [
      "Stand with feet hip-width apart, holding a dumbbell in each hand at shoulder height, palms facing forward.",
      "Brace your core and glutes so your ribs stay stacked over your hips (avoid over-arching your lower back).",
      "Press the weights straight overhead until your arms are fully extended.",
      "At the top, the weights should be roughly in line with your ears.",
      "Lower back down under control to shoulder height."
    ],
    breathing: "Inhale and brace your core at shoulder height. Exhale as you press the weights overhead.",
    tips: ["Squeeze your glutes to avoid arching your lower back.", "Press slightly back so the bar/dumbbells travel in a straight vertical line over your head."],
    mistakes: ["Excessive lower back arch", "Flaring elbows too wide at the bottom", "Using leg drive (unless intentionally doing a push press)"],
    videoQuery: "dumbbell overhead press proper form"
  },

  superman: {
    id: "superman",
    name: "Superman",
    pattern: "extension",
    muscles: { primary: ["lowerback"], secondary: ["glutes"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "12-15",
    steps: [
      "Lie face down with arms extended in front of you, legs straight behind you.",
      "Engage your glutes and lower back.",
      "Simultaneously lift your arms, chest, and legs a few inches off the floor.",
      "Hold briefly at the top, squeezing your glutes and back.",
      "Lower back down with control."
    ],
    breathing: "Exhale as you lift your chest and legs off the floor. Inhale as you lower back down.",
    tips: ["Lift a few inches, not maximum height — this isn't about how high you go.", "Keep your neck neutral, don't crank your head back."],
    mistakes: ["Yanking the head back to look up", "Using jerky, fast reps instead of controlled ones"],
    videoQuery: "superman exercise proper form"
  },

  mountainclimber: {
    id: "mountainclimber",
    name: "Mountain Climbers",
    pattern: "cardio",
    muscles: { primary: ["abs"], secondary: ["shoulders", "quads"] },
    equipment: "None",
    level: "Intermediate",
    sets: 3, duration: "30 sec",
    steps: [
      "Start in a high plank, hands under shoulders, body in a straight line.",
      "Brace your core so your hips stay level throughout.",
      "Drive one knee toward your chest, then quickly switch, driving the other knee in.",
      "Keep hips low and steady — avoid bouncing them up and down.",
      "Continue alternating at a controlled, steady pace."
    ],
    breathing: "Breathe rhythmically in sync with your leg drive — don't hold your breath. Exhale a little sharper each time a knee drives in.",
    tips: ["Slow it down if your hips start bouncing.", "Keep shoulders stacked over wrists the whole time."],
    mistakes: ["Hips rising up (turning it into a mini downward-dog)", "Holding the breath"],
    videoQuery: "mountain climbers proper form tutorial"
  },

  bicepcurl: {
    id: "bicepcurl",
    name: "Bicep Curl (Dumbbell)",
    pattern: "curl",
    muscles: { primary: ["biceps"], secondary: [] },
    equipment: "Dumbbells",
    level: "Beginner",
    sets: 3, reps: "10-12",
    steps: [
      "Stand tall holding a dumbbell in each hand, arms fully extended, palms facing forward.",
      "Keep elbows pinned close to your torso throughout the movement.",
      "Curl the weights up toward your shoulders by bending only at the elbow.",
      "Squeeze your biceps at the top.",
      "Lower the weights back down slowly and under control to full extension."
    ],
    breathing: "Exhale as you curl the weight up. Inhale as you lower it back down.",
    tips: ["Don't swing your torso or use momentum.", "Fully extend the arms at the bottom for full range of motion."],
    mistakes: ["Swinging the body to heave the weight up", "Letting elbows drift forward away from the torso"],
    videoQuery: "dumbbell bicep curl proper form"
  },

  tricepdip: {
    id: "tricepdip",
    name: "Tricep Dip (Chair/Bench)",
    pattern: "push",
    muscles: { primary: ["triceps"], secondary: ["chest", "shoulders"] },
    equipment: "Sturdy chair or bench",
    level: "Intermediate",
    sets: 3, reps: "10-12",
    steps: [
      "Sit on the edge of a sturdy chair or bench, hands gripping the edge next to your hips.",
      "Slide your hips off the front, legs extended or knees bent, weight supported on your hands.",
      "Lower your body by bending your elbows straight back until they're around 90°.",
      "Keep your shoulders down away from your ears.",
      "Push through your palms to straighten your arms and rise back up."
    ],
    breathing: "Inhale as you lower your body down. Exhale as you push back up to the top.",
    tips: ["Keep elbows pointing behind you, not flaring out to the sides.", "Bend your knees more to make it easier, straighten legs to make it harder."],
    mistakes: ["Shrugging shoulders up toward the ears", "Going too low and straining the shoulder joint"],
    videoQuery: "tricep dip chair proper form"
  },

  sideplank: {
    id: "sideplank",
    name: "Side Plank",
    pattern: "isometric",
    muscles: { primary: ["obliques"], secondary: ["abs", "shoulders"] },
    equipment: "None",
    level: "Intermediate",
    sets: 3, duration: "20-30 sec per side",
    steps: [
      "Lie on your side, propped up on one forearm with elbow under your shoulder.",
      "Stack your feet on top of each other (or stagger for more stability).",
      "Brace your core and lift your hips off the floor into a straight line.",
      "Keep your hips stacked, not rotated forward or backward.",
      "Hold, then repeat on the other side."
    ],
    breathing: "Breathe steadily and continuously — never hold your breath during the hold.",
    tips: ["Stack shoulders and hips vertically.", "Lower to your knees for an easier variation if needed."],
    mistakes: ["Letting hips sag toward the floor", "Rotating the torso forward"],
    videoQuery: "side plank proper form tutorial"
  },

  stepup: {
    id: "stepup",
    name: "Step-Up",
    pattern: "squat",
    muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"] },
    equipment: "Sturdy step or bench",
    level: "Beginner",
    sets: 3, reps: "10 per leg",
    steps: [
      "Stand in front of a sturdy step, bench, or box.",
      "Place one foot fully on the step, keeping your weight centered over that foot.",
      "Push through the heel of the front foot to stand up on the step, bringing the other foot up.",
      "Stand fully tall at the top, avoid pushing off with the trailing leg.",
      "Step back down with control and repeat, alternating legs."
    ],
    breathing: "Exhale as you drive up onto the step. Inhale as you step back down.",
    tips: ["Use a step height that lets your knee stay roughly at 90°.", "Keep your torso upright rather than leaning forward."],
    mistakes: ["Pushing off the back foot to help", "Using a step that's too high, causing knee strain"],
    videoQuery: "step up exercise proper form"
  },

  birddog: {
    id: "birddog",
    name: "Bird Dog",
    pattern: "core",
    muscles: { primary: ["abs", "lowerback"], secondary: ["glutes"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "10 per side",
    steps: [
      "Start on all fours, hands under shoulders, knees under hips.",
      "Brace your core to keep your back flat, like a tabletop.",
      "Extend one arm straight forward and the opposite leg straight back at the same time.",
      "Keep hips and shoulders square to the floor — avoid rotating.",
      "Pause briefly, then return to the start and switch sides."
    ],
    breathing: "Exhale as you extend your arm and leg out. Inhale as you return to the starting position.",
    tips: ["Move slowly — this is a control exercise, not a speed one.", "Imagine a glass of water balanced on your lower back that shouldn't spill."],
    mistakes: ["Rotating the hips or shoulders", "Rushing through reps"],
    videoQuery: "bird dog exercise proper form"
  },

  calfraise: {
    id: "calfraise",
    name: "Calf Raise",
    pattern: "calf",
    muscles: { primary: ["calves"], secondary: [] },
    equipment: "None (optional step for range of motion)",
    level: "Beginner",
    sets: 3, reps: "15-20",
    steps: [
      "Stand tall, feet hip-width apart (use a step edge for extra range if available).",
      "Hold onto something stable for balance if needed.",
      "Push through the balls of your feet to rise up onto your toes as high as possible.",
      "Pause and squeeze at the top.",
      "Lower back down slowly, going below neutral if using a step, to fully stretch the calves."
    ],
    breathing: "Exhale as you rise onto your toes. Inhale as you lower back down.",
    tips: ["Slow the lowering phase down for a better stretch and more muscle work.", "Keep knees soft, not locked out."],
    mistakes: ["Bouncing quickly instead of a controlled tempo", "Only using a partial range of motion"],
    videoQuery: "calf raise proper form tutorial"
  },

  deadlift: {
    id: "deadlift",
    name: "Romanian Deadlift (Dumbbell)",
    pattern: "hinge",
    muscles: { primary: ["hamstrings", "glutes"], secondary: ["lowerback"] },
    equipment: "Dumbbells or kettlebell",
    level: "Intermediate",
    sets: 3, reps: "10-12",
    steps: [
      "Stand tall holding weights in front of your thighs, feet hip-width apart.",
      "Keep a soft bend in your knees that stays constant throughout the movement.",
      "Push your hips straight back, hinging at the hips while keeping your back flat.",
      "Lower the weights along your legs until you feel a stretch in your hamstrings (roughly shin height).",
      "Drive your hips forward to return to standing, squeezing your glutes at the top."
    ],
    breathing: "Take a deep breath and brace before you hinge down. Exhale once you've passed the hardest part, near the top of the lift.",
    tips: ["Think 'push the hips back,' not 'bend the knees.'", "Keep the weights close to your legs the entire time."],
    mistakes: ["Rounding the lower back", "Bending the knees too much, turning it into a squat", "Letting the weights drift away from the body"],
    videoQuery: "dumbbell romanian deadlift proper form"
  },

  burpee: {
    id: "burpee",
    name: "Burpee",
    pattern: "cardio",
    muscles: { primary: ["quads", "chest"], secondary: ["shoulders", "abs", "glutes"] },
    equipment: "None",
    level: "Advanced",
    sets: 3, reps: "8-10",
    steps: [
      "Start standing, feet shoulder-width apart.",
      "Squat down and place your hands on the floor in front of you.",
      "Jump or step your feet back into a plank position.",
      "Perform a push-up (optional), then jump or step your feet back up to your hands.",
      "Explosively jump up into the air, reaching your arms overhead, then land softly and repeat."
    ],
    breathing: "Exhale sharply on the explosive jump. Inhale as you drop into the plank/reset position.",
    tips: ["Step instead of jumping your feet in/out to lower impact.", "Land softly with bent knees on the jump."],
    mistakes: ["Letting the lower back sag in the plank position", "Landing stiff-legged from the jump"],
    videoQuery: "burpee proper form tutorial"
  },

  russiantwist: {
    id: "russiantwist",
    name: "Russian Twist",
    pattern: "core",
    muscles: { primary: ["obliques"], secondary: ["abs"] },
    equipment: "None (optional light weight)",
    level: "Beginner",
    sets: 3, reps: "16 (8 per side)",
    steps: [
      "Sit on the floor with knees bent, leaning your torso back to about 45°.",
      "Lift your feet slightly off the floor for more challenge, or keep them down for stability.",
      "Clasp your hands together (or hold a light weight) in front of your chest.",
      "Rotate your torso to tap the floor beside one hip.",
      "Rotate through center to the other side, keeping your core braced throughout."
    ],
    breathing: "Exhale as you rotate to each side. Inhale briefly as you pass back through center.",
    tips: ["Move slowly and with control rather than fast, sloppy twists.", "Keep your feet down if your lower back rounds when lifted."],
    mistakes: ["Rounding the lower back", "Using arm momentum instead of rotating from the torso"],
    videoQuery: "russian twist proper form tutorial"
  },

  wallsit: {
    id: "wallsit",
    name: "Wall Sit",
    pattern: "isometric",
    muscles: { primary: ["quads"], secondary: ["glutes"] },
    equipment: "Wall",
    level: "Beginner",
    sets: 3, duration: "30-45 sec",
    steps: [
      "Stand with your back against a wall, feet shoulder-width apart, about two feet from the wall.",
      "Slide down the wall until your knees are bent to roughly 90°.",
      "Keep your knees directly above your ankles, not pushed past your toes.",
      "Press your lower back flat against the wall.",
      "Hold the position for the target time."
    ],
    breathing: "Don't hold your breath. Breathe slowly and steadily through your nose the entire hold.",
    tips: ["Shift your feet further from the wall for a deeper, harder hold.", "Keep weight balanced through both feet evenly."],
    mistakes: ["Knees collapsing inward", "Holding the breath through the hold"],
    videoQuery: "wall sit proper form tutorial"
  },

  bandpull: {
    id: "bandpull",
    name: "Doorway Row / Band Pull",
    pattern: "pull",
    muscles: { primary: ["back"], secondary: ["biceps", "shoulders"] },
    equipment: "Resistance band anchored to a door or sturdy point",
    level: "Beginner",
    sets: 3, reps: "12-15",
    steps: [
      "Anchor a resistance band at chest height, step back until there's tension in the band.",
      "Stand tall, feet staggered or hip-width apart, core braced.",
      "Pull both handles toward your ribs, squeezing your shoulder blades together.",
      "Keep elbows close to your body as you pull.",
      "Extend your arms back out with control to the starting position."
    ],
    breathing: "Exhale as you pull the band toward your torso. Inhale as you extend back out.",
    tips: ["Focus on squeezing the shoulder blades together at the end of the pull.", "Keep your torso still — don't lean back to help pull."],
    mistakes: ["Using body lean/momentum instead of back muscles", "Shrugging shoulders up during the pull"],
    videoQuery: "band row proper form tutorial"
  },

  chestfly: {
    id: "chestfly",
    name: "Chest Fly (Dumbbell or Band)",
    pattern: "fly",
    muscles: { primary: ["chest"], secondary: ["shoulders"] },
    equipment: "Dumbbells or resistance band",
    level: "Intermediate",
    sets: 3, reps: "10-12",
    steps: [
      "Lie on your back on a bench or floor, holding a weight in each hand above your chest, palms facing in.",
      "Keep a slight, fixed bend in your elbows throughout.",
      "Lower your arms out to the sides in a wide arc until you feel a stretch across your chest.",
      "Keep the motion controlled — don't let the weights drop.",
      "Bring your arms back together above your chest, squeezing your chest muscles."
    ],
    breathing: "Inhale as you open your arms out wide. Exhale as you bring your hands back together above your chest.",
    tips: ["Keep the elbow bend constant — don't turn it into a press.", "Use a lighter weight than you'd think; this is a stretch-focused movement."],
    mistakes: ["Bending the elbows more at the bottom (turning it into a press)", "Lowering the weights too far and straining the shoulders"],
    videoQuery: "dumbbell chest fly proper form"
  },

  highknees: {
    id: "highknees",
    name: "High Knees",
    pattern: "cardio",
    muscles: { primary: ["quads", "abs"], secondary: ["calves"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, duration: "30 sec",
    steps: [
      "Stand tall with feet hip-width apart.",
      "Drive one knee up toward your chest as high as comfortable.",
      "Quickly switch, driving the other knee up while the first foot returns to the floor.",
      "Pump your arms in rhythm with your legs like a light jog in place.",
      "Keep your torso upright and core braced throughout."
    ],
    breathing: "Match your breathing rhythm to your cadence — inhale and exhale steadily, don't hold your breath during the fast pace.",
    tips: ["Land softly on the balls of your feet.", "Slow the pace down before your form starts to break."],
    mistakes: ["Leaning the torso back", "Landing hard/flat-footed"],
    videoQuery: "high knees proper form tutorial"
  },

  reverselunge: {
    id: "reverselunge",
    name: "Reverse Lunge",
    pattern: "lunge",
    muscles: { primary: ["quads", "glutes"], secondary: ["hamstrings"] },
    equipment: "None (optional dumbbells)",
    level: "Beginner",
    sets: 3, reps: "10 per leg",
    steps: [
      "Stand tall, feet hip-width apart, core braced.",
      "Step one foot backward, landing on the ball of that foot.",
      "Bend both knees to lower your back knee toward the floor, front knee stacked over the ankle.",
      "Keep your torso upright throughout the movement.",
      "Push through your front heel to return to standing, then repeat on the other side."
    ],
    breathing: "Inhale as you step back and lower down. Exhale as you push back up to standing.",
    tips: ["Reverse lunges are gentler on the front knee than forward lunges — good if you have knee sensitivity.", "Keep most of your weight on the front leg."],
    mistakes: ["Leaning the torso forward", "Letting the front knee cave inward"],
    videoQuery: "reverse lunge proper form tutorial"
  },

  deadbug: {
    id: "deadbug",
    name: "Dead Bug",
    pattern: "core",
    muscles: { primary: ["abs"], secondary: ["lowerback"] },
    equipment: "None",
    level: "Beginner",
    sets: 3, reps: "10 per side",
    steps: [
      "Lie on your back with arms reaching straight up toward the ceiling, knees bent 90° above your hips (tabletop position).",
      "Press your lower back flat into the floor and brace your core.",
      "Slowly extend one arm overhead and the opposite leg straight out, keeping both a few inches off the floor.",
      "Keep your lower back pressed into the floor the entire time — don't let it arch.",
      "Return to the start and repeat on the opposite side."
    ],
    breathing: "Exhale as you extend your arm and leg away from your body. Inhale as you return to the starting position.",
    tips: ["Move slowly — if your back arches off the floor, shorten the range of motion.", "Keep this slow and controlled rather than fast."],
    mistakes: ["Lower back arching up off the floor", "Moving too fast to maintain control"],
    videoQuery: "dead bug exercise proper form"
  }

};

/* Warm-up and cool-down blocks, shown before/after every workout day */
const WARMUP = {
  name: "Warm-Up",
  duration: "5 minutes",
  breathingNote: "Breathe naturally and rhythmically through the warm-up — this is about raising your heart rate and loosening joints, not bracing hard.",
  items: [
    { name: "Arm Circles", duration: "30 sec", note: "Small to large circles, both directions." },
    { name: "Torso Twists", duration: "30 sec", note: "Feet planted, rotate gently side to side." },
    { name: "Leg Swings", duration: "30 sec per leg", note: "Hold onto a wall, swing leg forward/back then side to side." },
    { name: "Cat-Cow Stretch", duration: "45 sec", note: "On all fours — inhale arching your back down (cow), exhale rounding it up (cat)." },
    { name: "Jumping Jacks", duration: "1 minute", note: "Light pace, just to get blood flowing." },
    { name: "Bodyweight Squats", duration: "10 reps", note: "Slow, easy reps to prime the hips and knees." }
  ]
};

const COOLDOWN = {
  name: "Cool-Down & Stretch",
  duration: "5 minutes",
  breathingNote: "This is the best time to practice box breathing: inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds. It calms your nervous system and helps recovery.",
  items: [
    { name: "Standing Quad Stretch", duration: "30 sec per leg", note: "Hold ankle behind you, knees together." },
    { name: "Hamstring Stretch", duration: "30 sec per leg", note: "Straight leg forward, hinge gently at hips." },
    { name: "Doorway Chest Stretch", duration: "30 sec", note: "Forearm on doorframe, gently rotate away." },
    { name: "Child's Pose", duration: "45 sec", note: "Sit back onto heels, arms extended forward, breathe deeply into your back." },
    { name: "Box Breathing", duration: "1 minute", note: "4-second inhale, 4-second hold, 4-second exhale, 4-second hold. Repeat." }
  ]
};

/* Weekly program — 4 full-body training days + active rest/mobility + full rest */
const WEEK_PROGRAM = {
  0: { day: "Sunday", type: "rest", label: "Rest Day", note: "Full rest. Light walking or gentle stretching is fine. Let your muscles recover." },
  1: { day: "Monday", type: "workout", label: "Full Body A — Push & Legs Focus", exercises: ["squat", "pushup", "glutebridge", "ohp", "plank", "calfraise"] },
  2: { day: "Tuesday", type: "active-rest", label: "Active Recovery / Mobility", note: "20-30 min light walk, gentle full-body stretching, or yoga. Keep intensity low." },
  3: { day: "Wednesday", type: "workout", label: "Full Body B — Pull & Core Focus", exercises: ["deadlift", "row", "lunge", "bicepcurl", "birddog", "deadbug"] },
  4: { day: "Thursday", type: "active-rest", label: "Active Recovery / Mobility", note: "20-30 min light walk, gentle full-body stretching, or yoga. Keep intensity low." },
  5: { day: "Friday", type: "workout", label: "Full Body C — Strength Focus", exercises: ["reverselunge", "tricepdip", "chestfly", "stepup", "sideplank", "superman"] },
  6: { day: "Saturday", type: "workout", label: "Full Body D — Conditioning & Core", exercises: ["burpee", "mountainclimber", "highknees", "russiantwist", "wallsit", "plank"] }
};

/* Breathing fundamentals shown in the Learn tab */
const BREATHING_GUIDE = [
  {
    title: "The core rule: exhale on exertion",
    text: "Breathe out during the hardest part of a lift — the push, pull, or lift phase (called the 'concentric' phase). Breathe in during the easier, controlled lowering phase (the 'eccentric' phase). Example: on a squat, inhale as you sit down, exhale as you stand back up."
  },
  {
    title: "Never fully hold your breath",
    text: "For lighter, higher-rep exercises and holds like planks or wall sits, breathe continuously and steadily. Holding your breath spikes blood pressure and can make you lightheaded. A brief 'brace' before a heavy effort is fine, but let it go with an exhale, don't lock it."
  },
  {
    title: "Brace before heavy lifts",
    text: "For hinge and squat movements with weight (like deadlifts), take a full breath into your belly and gently brace your core like someone's about to nudge your stomach — this stabilizes your spine. Release the breath with an exhale once you're through the hardest part of the lift."
  },
  {
    title: "Cardio and conditioning",
    text: "During fast-paced moves like burpees, mountain climbers, or high knees, keep breathing rhythmically matched to your movement rather than a strict inhale/exhale count — the priority is not holding your breath."
  },
  {
    title: "Cool-down: box breathing",
    text: "After your workout, try box breathing: inhale 4 seconds, hold 4 seconds, exhale 4 seconds, hold 4 seconds. This helps shift your body out of 'work mode' and into recovery."
  }
];
