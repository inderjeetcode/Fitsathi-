import { Exercise } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
  // ==========================================
  // CHEST EXERCISES
  // ==========================================
  {
    id: 'barbell_bench_press',
    image_url: '/exercises/repdb/barbell_bench_press.webp',
    name: 'Barbell Flat Bench Press',
    hindi_name: 'बेंच प्रेस (Barbell)',
    category: 'chest',
    targetMuscle: 'Pectoralis Major (Mid/Overall)',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Lie flat on the bench with eyes directly below the barbell.',
      'Grip the bar slightly wider than shoulder-width, plant feet firmly on the floor, and retract shoulder blades.',
      'Unrack the bar and slowly lower it with control to the mid-chest line.',
      'Press upward explosively while keeping forearms vertical until arms are fully extended without locking elbows.'
    ],
    defaultRestSeconds: 90,
    tips: 'Keep your wrists straight and avoid bouncing the bar off your ribcage.'
  },
  {
    id: 'incline_dumbbell_press',
    image_url: '/exercises/repdb/incline_dumbbell_press.webp',
    name: 'Incline Dumbbell Press',
    hindi_name: 'इंकलाइन डम्बल प्रेस',
    category: 'chest',
    targetMuscle: 'Upper Chest (Clavicular Head)',
    secondaryMuscles: ['Anterior Deltoids', 'Triceps'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Set an adjustable bench to a 30° to 45° angle.',
      'Kick dumbbells up to shoulder level with knees and retract shoulder blades.',
      'Lower the weights steadily until elbows reach roughly 90 degrees with a gentle stretch in the upper chest.',
      'Press upward in a slight arc, bringing dumbbells close together at the peak without clanking.'
    ],
    defaultRestSeconds: 75,
    tips: 'A 30-degree incline prioritizes upper chest while minimizing excessive shoulder strain.'
  },
  {
    id: 'decline_barbell_press',
    image_url: '/exercises/repdb/decline_barbell_press.webp',
    name: 'Decline Barbell Press',
    hindi_name: 'डिक्लाइन बेंच प्रेस',
    category: 'chest',
    targetMuscle: 'Lower Chest (Sternal Head)',
    secondaryMuscles: ['Triceps', 'Shoulders'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Secure feet under the leg pads on a decline bench and lie back.',
      'Grip the bar shoulder-width apart and unrack carefully.',
      'Lower the bar to the lower chest / upper sternum.',
      'Press upward smoothly to the starting position.'
    ],
    defaultRestSeconds: 90,
    tips: 'Great for building thickness in the lower chest line.'
  },
  {
    id: 'cable_crossover_flyes',
    image_url: '/exercises/repdb/cable_crossover_flyes.webp',
    name: 'Cable Chest Flyes',
    hindi_name: 'केबल चेस्ट फ्लाई',
    category: 'chest',
    targetMuscle: 'Pectoralis Major (Inner / Squeeze)',
    secondaryMuscles: ['Anterior Deltoids'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Set pulleys at chest height or slightly higher with single D-handles.',
      'Step forward in a staggered stance with a slight forward lean and bent elbows.',
      'Bring hands together in front of your chest in a hugging motion.',
      'Pause and squeeze chest muscles for 1 second, then control the stretch back.'
    ],
    defaultRestSeconds: 60,
    tips: 'Keep constant tension on the cables throughout the movement.'
  },
  {
    id: 'dumbbell_chest_flyes',
    image_url: '/exercises/repdb/dumbbell_chest_flyes.webp',
    name: 'Flat Dumbbell Flyes',
    hindi_name: 'डम्बल फ्लाई',
    category: 'chest',
    targetMuscle: 'Chest (Deep Stretch & Squeeze)',
    secondaryMuscles: ['Anterior Deltoids'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Lie on a flat bench holding dumbbells directly above your chest with palms facing each other.',
      'With a slight bend in your elbows, lower the dumbbells outward in a wide arc until you feel a deep chest stretch.',
      'Bring the weights back up following the same wide arc path, squeezing the chest at the top.'
    ],
    defaultRestSeconds: 60,
    tips: 'Never lower the weights below shoulder level to protect the rotator cuff.'
  },
  {
    id: 'standard_pushups',
    image_url: '/exercises/repdb/standard_pushups.webp',
    name: 'Push-Ups (Standard)',
    hindi_name: 'पुश-अप्स',
    category: 'chest',
    targetMuscle: 'Chest & Core Stability',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids', 'Abdominals'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Place hands slightly wider than shoulder-width, with body in a straight plank line from head to heels.',
      'Engage glutes and core, then lower chest until it is about an inch from the floor.',
      'Push through palms to return to top plank position.'
    ],
    defaultRestSeconds: 60,
    tips: 'Do not let your hips sag or flare your elbows excessively.'
  },
  {
    id: 'chest_dips',
    image_url: '/exercises/repdb/chest_dips.webp',
    name: 'Chest Dips (Forward Lean)',
    hindi_name: 'चेस्ट डिप्स',
    category: 'chest',
    targetMuscle: 'Lower Chest & Triceps',
    secondaryMuscles: ['Front Shoulders'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Grip parallel dip bars and lift yourself to lock out arms.',
      'Lean torso forward roughly 30° and flare elbows slightly outward.',
      'Lower body until elbows are at a 90° angle.',
      'Drive upward through palms, squeezing chest at the top.'
    ],
    defaultRestSeconds: 90,
    tips: 'Leaning forward emphasizes the chest; staying upright shifts focus to triceps.'
  },

  // ==========================================
  // BACK EXERCISES
  // ==========================================
  {
    id: 'barbell_deadlift',
    image_url: '/exercises/repdb/barbell_deadlift.webp',
    name: 'Conventional Barbell Deadlift',
    hindi_name: 'डेडलिफ्ट (Deadlift)',
    category: 'back',
    targetMuscle: 'Erector Spinae & Posterior Chain',
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Lats', 'Traps', 'Forearms'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Stand with feet hip-width apart, barbell over mid-foot.',
      'Hinge at hips to grip the bar just outside legs with an overhand or mixed grip.',
      'Engage lats, flatten back, take a deep breath into core, and drive through the floor.',
      'Lock out hips and knees simultaneously at the top, then hinge back down under control.'
    ],
    defaultRestSeconds: 120,
    tips: 'Keep the bar dragging close to your shins and thighs throughout the lift.'
  },
  {
    id: 'barbell_bent_over_row',
    image_url: '/exercises/repdb/barbell_bent_over_row.webp',
    name: 'Bent-Over Barbell Row',
    hindi_name: 'बेंट ओवर बार्बेल रो',
    category: 'back',
    targetMuscle: 'Latissimus Dorsi & Rhomboids',
    secondaryMuscles: ['Biceps', 'Rear Deltoids', 'Lower Back'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Hold a barbell with an overhand grip, bend knees slightly, and hinge torso forward to about 45 degrees.',
      'Keep back flat and chest upright.',
      'Pull the bar up toward your belly button, driving with your elbows and squeezing your shoulder blades together.',
      'Lower the weight smoothly back to the hanging position.'
    ],
    defaultRestSeconds: 90,
    tips: 'Avoid using momentum or jerking your torso upward.'
  },
  {
    id: 'pull_ups',
    image_url: '/exercises/repdb/pull_ups.webp',
    name: 'Wide-Grip Pull-Ups',
    hindi_name: 'पुल-अप्स',
    category: 'back',
    targetMuscle: 'Latissimus Dorsi (Width)',
    secondaryMuscles: ['Biceps', 'Upper Back', 'Forearms'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Hang from a pull-up bar with an overhand grip wider than shoulder-width.',
      'Depress shoulder blades and pull chest up toward the bar until chin clears the bar.',
      'Pause briefly, then lower slowly to a full dead hang.'
    ],
    defaultRestSeconds: 90,
    tips: 'Lead with your chest, not your chin, for maximum lat activation.'
  },
  {
    id: 'lat_pulldown',
    image_url: '/exercises/repdb/lat_pulldown.webp',
    name: 'Cable Lat Pulldown',
    hindi_name: 'लैट पुलडाउन',
    category: 'back',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Rhomboids', 'Rear Deltoids'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Sit comfortably on the lat pulldown station with thighs secured under roller pads.',
      'Grip the wide bar with an overhand grip.',
      'Pull the bar down toward upper chest while leaning back slightly (10-15°).',
      'Squeeze lats at the bottom, then allow bar to rise smoothly with full stretch.'
    ],
    defaultRestSeconds: 75,
    tips: 'Pull with your elbows rather than biceps.'
  },
  {
    id: 'seated_cable_row',
    image_url: '/exercises/repdb/seated_cable_row.webp',
    name: 'Seated Cable Row',
    hindi_name: 'सीटेड केबल रो',
    category: 'back',
    targetMuscle: 'Middle Back, Rhomboids & Lats',
    secondaryMuscles: ['Biceps', 'Rear Delts', 'Erectors'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Sit on the bench with feet on footrests and knees slightly bent.',
      'Grip the V-bar handle with arms extended and torso upright.',
      'Pull handle into abdomen, driving elbows back and squeezing shoulder blades.',
      'Slowly extend arms forward for a full stretch without rounding lower back.'
    ],
    defaultRestSeconds: 75,
    tips: 'Maintain an upright posture throughout; avoid excessive swinging.'
  },
  {
    id: 'single_arm_dumbbell_row',
    image_url: '/exercises/repdb/single_arm_dumbbell_row.webp',
    name: 'Single-Arm Dumbbell Row',
    hindi_name: 'सिंगल आर्म डम्बल रो',
    category: 'back',
    targetMuscle: 'Lats & Mid-Back Thickness',
    secondaryMuscles: ['Biceps', 'Rear Delts'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Place one knee and hand on a flat bench for support, with other foot on the floor.',
      'Hold a dumbbell in free hand, letting arm hang down fully.',
      'Pull dumbbell up toward hip pocket, keeping elbow close to side.',
      'Lower weight slowly until arm is fully extended.'
    ],
    defaultRestSeconds: 60,
    tips: 'Pull toward the hip rather than straight up to chest to isolate lats.'
  },
  {
    id: 't_bar_row',
    image_url: '/exercises/repdb/t_bar_row.webp',
    name: 'T-Bar Row',
    hindi_name: 'टी-बार रो',
    category: 'back',
    targetMuscle: 'Mid-Back Thickness & Lower Lats',
    secondaryMuscles: ['Biceps', 'Trapezius', 'Erector Spinae'],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Straddle the bar and grip the handles with knees slightly bent and back flat.',
      'Pull weight up towards lower ribcage by squeezing back muscles.',
      'Lower the weight until arms are extended without rounding the back.'
    ],
    defaultRestSeconds: 90,
    tips: 'Keep core tight to protect lower spine.'
  },

  // ==========================================
  // LEGS EXERCISES
  // ==========================================
  {
    id: 'barbell_back_squat',
    image_url: '/exercises/repdb/barbell_back_squat.webp',
    name: 'Barbell Back Squat',
    hindi_name: 'बार्बेल स्क्वाट (Squats)',
    category: 'legs',
    targetMuscle: 'Quadriceps, Glutes & Adductors',
    secondaryMuscles: ['Hamstrings', 'Core', 'Calves'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Rest barbell securely across upper traps, feet shoulder-width apart, toes pointed slightly outward.',
      'Inhale deeply, brace core, and break at hips and knees simultaneously.',
      'Squat down until thighs are parallel to the floor or slightly below (crease of hip below knee).',
      'Drive forcefully through mid-foot to stand back up, exhaling at the top.'
    ],
    defaultRestSeconds: 120,
    tips: 'Keep chest tall and knees tracking in line with toes.'
  },
  {
    id: 'leg_press',
    image_url: '/exercises/repdb/leg_press.webp',
    name: '45° Leg Press Machine',
    hindi_name: 'लेग प्रेस',
    category: 'legs',
    targetMuscle: 'Quadriceps & Glutes',
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Sit on machine with lower back firmly pressed against seat pad, feet shoulder-width on the sled platform.',
      'Release safety handles and lower sled under control until knees bend to 90 degrees.',
      'Press through heels and mid-foot to push platform back up without locking knees at top.'
    ],
    defaultRestSeconds: 90,
    tips: 'Never let your lower back curl off the seat cushion.'
  },
  {
    id: 'romanian_deadlift',
    image_url: '/exercises/repdb/romanian_deadlift.webp',
    name: 'Barbell Romanian Deadlift (RDL)',
    hindi_name: 'रोमानियन डेडलिफ्ट (RDL)',
    category: 'legs',
    targetMuscle: 'Hamstrings & Gluteus Maximus',
    secondaryMuscles: ['Lower Back', 'Core', 'Forearms'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Stand upright holding barbell at hip level with an overhand grip.',
      'Keep a soft bend in knees and push hips straight back as if trying to touch a wall behind you.',
      'Lower bar along thighs and shins until you feel a deep hamstring stretch (around mid-shin).',
      'Drive hips forward to return to standing position and squeeze glutes.'
    ],
    defaultRestSeconds: 90,
    tips: 'This is a pure hip hinge; do not turn it into a squat.'
  },
  {
    id: 'walking_lunges',
    image_url: '/exercises/repdb/walking_lunges.webp',
    name: 'Dumbbell Walking Lunges',
    hindi_name: 'डम्बल लंग्स (Lunges)',
    category: 'legs',
    targetMuscle: 'Quadriceps, Glutes & Hamstrings',
    secondaryMuscles: ['Calves', 'Core Balance'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Hold dumbbells at your sides and take a big stride forward with one leg.',
      'Lower body until front thigh is parallel to floor and back knee nearly touches the ground.',
      'Drive through front heel to step forward directly into the next stride.'
    ],
    defaultRestSeconds: 75,
    tips: 'Keep torso upright and maintain equal stride length.'
  },
  {
    id: 'leg_extension',
    image_url: '/exercises/repdb/leg_extension.webp',
    name: 'Leg Extension Machine',
    hindi_name: 'लेग एक्सटेंशन',
    category: 'legs',
    targetMuscle: 'Quadriceps (Isolation)',
    secondaryMuscles: [],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Adjust back pad so knees align with machine pivot point, shin pad resting just above ankles.',
      'Extend legs upward until knees are almost straight, squeezing quads at peak for 1 second.',
      'Lower the weight slowly to starting position.'
    ],
    defaultRestSeconds: 60,
    tips: 'Control the eccentric (lowering) phase without dropping the stack.'
  },
  {
    id: 'lying_leg_curl',
    image_url: '/exercises/repdb/lying_leg_curl.webp',
    name: 'Lying Hamstring Leg Curl',
    hindi_name: 'हैमस्ट्रिंग कर्ल',
    category: 'legs',
    targetMuscle: 'Hamstrings (Isolation)',
    secondaryMuscles: ['Calves'],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Lie face down on machine with pad positioned against back of lower legs/ankles.',
      'Curl legs upward toward buttocks smoothly as far as possible.',
      'Squeeze hamstrings for a moment, then lower the weight under control.'
    ],
    defaultRestSeconds: 60,
    tips: 'Keep hips pressed into the bench to prevent using lower back momentum.'
  },
  {
    id: 'standing_calf_raise',
    image_url: '/exercises/repdb/standing_calf_raise.webp',
    name: 'Standing Calf Raises',
    hindi_name: 'काफ रेज (पिंडली)',
    category: 'legs',
    targetMuscle: 'Gastrocnemius & Soleus (Calves)',
    secondaryMuscles: [],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Place balls of feet on edge of step with shoulders under pads.',
      'Lower heels as far as comfortable for a deep stretch.',
      'Rise up onto tiptoes as high as possible, pausing at the top for 2 seconds before lowering.'
    ],
    defaultRestSeconds: 45,
    tips: 'Emphasize the full stretch and peak contraction on every single rep.'
  },
  {
    id: 'bodyweight_squats',
    image_url: '/exercises/repdb/bodyweight_squats.webp',
    name: 'Bodyweight Air Squats',
    hindi_name: 'एयर स्क्वाट',
    category: 'legs',
    targetMuscle: 'Quadriceps, Glutes',
    secondaryMuscles: ['Hamstrings', 'Calves'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Stand with feet shoulder-width apart, arms extended in front for balance.',
      'Lower hips back and down until thighs are parallel to ground.',
      'Press through heels to return to standing.'
    ],
    defaultRestSeconds: 45,
    tips: 'Great for warmup or high-rep endurance sets.'
  },

  // ==========================================
  // SHOULDERS EXERCISES
  // ==========================================
  {
    id: 'overhead_barbell_press',
    image_url: '/exercises/repdb/overhead_barbell_press.webp',
    name: 'Overhead Standing Barbell Press (OHP)',
    hindi_name: 'शोल्डर प्रेस (Overhead Press)',
    category: 'shoulders',
    targetMuscle: 'Anterior & Lateral Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Chest', 'Trapezius', 'Core'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Stand with feet hip-width apart, bar resting on front shoulders with overhand grip just outside shoulders.',
      'Brace core and glutes, tilt head slightly back, and press bar straight overhead.',
      'Move head forward once bar clears forehead and lock out with bar directly above crown of head.',
      'Lower under control to clavicle.'
    ],
    defaultRestSeconds: 90,
    tips: 'Keep your glutes squeezed tight to prevent excessive lower back arching.'
  },
  {
    id: 'seated_dumbbell_shoulder_press',
    image_url: '/exercises/repdb/seated_dumbbell_shoulder_press.webp',
    name: 'Seated Dumbbell Shoulder Press',
    hindi_name: 'डम्बल शोल्डर प्रेस',
    category: 'shoulders',
    targetMuscle: 'Anterior & Medial Deltoids',
    secondaryMuscles: ['Triceps', 'Upper Traps'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Sit on an upright bench with dumbbells at shoulder height, palms facing forward or slightly angled inward.',
      'Press weights vertically until arms are fully extended overhead without clanking.',
      'Lower slowly until dumbbells are back at ear level.'
    ],
    defaultRestSeconds: 75,
    tips: 'Keep palms slightly turned inward at 45 degrees for healthier shoulder mechanics.'
  },
  {
    id: 'dumbbell_lateral_raise',
    image_url: '/exercises/repdb/dumbbell_lateral_raise.webp',
    name: 'Dumbbell Side Lateral Raises',
    hindi_name: 'साइड लेटरल रेज',
    category: 'shoulders',
    targetMuscle: 'Lateral Deltoids (Shoulder Width)',
    secondaryMuscles: ['Upper Trapezius'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Stand upright holding dumbbells at sides with a slight forward torso tilt and soft elbow bend.',
      'Raise arms out to sides until elbows reach shoulder height.',
      'Lead with elbows as if pouring water from a pitcher at top, then lower slowly.'
    ],
    defaultRestSeconds: 60,
    tips: 'Use moderate weight and avoid swinging your body.'
  },
  {
    id: 'cable_lateral_raise',
    image_url: '/exercises/repdb/cable_lateral_raise.webp',
    name: 'Cable Lateral Raise',
    hindi_name: 'केबल साइड रेज',
    category: 'shoulders',
    targetMuscle: 'Lateral Deltoids (Constant Tension)',
    secondaryMuscles: ['Traps'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Set low pulley with single handle, stand sideways to cable stack.',
      'Raise handle out to side up to shoulder level.',
      'Control the descent back down against continuous cable tension.'
    ],
    defaultRestSeconds: 60,
    tips: 'Provides superior tension at the bottom of the movement compared to dumbbells.'
  },
  {
    id: 'face_pulls',
    image_url: '/exercises/repdb/face_pulls.webp',
    name: 'Cable Rope Face Pulls',
    hindi_name: 'फेस पुल (Rear Delts)',
    category: 'shoulders',
    targetMuscle: 'Rear Deltoids & Rotator Cuff',
    secondaryMuscles: ['Rhomboids', 'Middle Trapezius'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Attach rope to high cable pulley, grip ends with palms facing inward or down.',
      'Step back, pull rope toward eye level while spreading hands apart and rotating wrists back.',
      'Squeeze rear shoulders and upper back blades together for 2 seconds, then return slowly.'
    ],
    defaultRestSeconds: 60,
    tips: 'Essential for posture correction and healthy shoulder joint longevity.'
  },
  {
    id: 'barbell_shrugs',
    image_url: '/exercises/repdb/barbell_shrugs.webp',
    name: 'Barbell Shrugs',
    hindi_name: 'श्राग्स (Traps)',
    category: 'shoulders',
    targetMuscle: 'Upper Trapezius',
    secondaryMuscles: ['Forearms'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Hold a barbell in front of thighs with shoulder-width overhand grip.',
      'Elevate shoulders straight up towards ears as high as possible.',
      'Hold the contraction at the peak for 1-2 seconds, then lower smoothly.'
    ],
    defaultRestSeconds: 60,
    tips: 'Never roll shoulders in circles; move straight up and down.'
  },

  // ==========================================
  // BICEPS EXERCISES
  // ==========================================
  {
    id: 'barbell_bicep_curl',
    image_url: '/exercises/repdb/barbell_bicep_curl.webp',
    name: 'Standing Barbell Bicep Curl',
    hindi_name: 'बार्बेल बाइसेप कर्ल',
    category: 'biceps',
    targetMuscle: 'Biceps Brachii (Overall Mass)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Stand tall holding a barbell with underhand shoulder-width grip.',
      'Keep elbows pinned close to torso and curl bar up towards chest.',
      'Squeeze biceps at the top without letting elbows drift forward, then lower under full control.'
    ],
    defaultRestSeconds: 60,
    tips: 'Avoid swinging your hips or arching your back.'
  },
  {
    id: 'dumbbell_incline_curl',
    image_url: '/exercises/repdb/dumbbell_incline_curl.webp',
    name: 'Incline Dumbbell Bicep Curl',
    hindi_name: 'इंकलाइन डम्बल कर्ल',
    category: 'biceps',
    targetMuscle: 'Biceps Long Head (Peak & Stretch)',
    secondaryMuscles: ['Brachialis'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Sit back on a 45° inclined bench holding dumbbells with arms hanging straight down.',
      'Curl weights upward while supinating wrists (turning pinkies inward at top).',
      'Lower slowly to feel a deep stretch in the long head of the bicep.'
    ],
    defaultRestSeconds: 60,
    tips: 'Incline angle puts maximum stretch on the long head.'
  },
  {
    id: 'dumbbell_hammer_curl',
    image_url: '/exercises/repdb/dumbbell_hammer_curl.webp',
    name: 'Dumbbell Hammer Curls',
    hindi_name: 'हैमर कर्ल',
    category: 'biceps',
    targetMuscle: 'Brachialis & Brachioradialis (Forearms/Arm Thickness)',
    secondaryMuscles: ['Biceps Brachii'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Stand with dumbbells at sides, palms facing each other (neutral grip).',
      'Curl dumbbells up while keeping palms facing each other throughout the rep.',
      'Squeeze forearms and brachialis at the top, then lower smoothly.'
    ],
    defaultRestSeconds: 60,
    tips: 'Develops arm width and forearm grip strength.'
  },
  {
    id: 'preacher_curl',
    image_url: '/exercises/repdb/preacher_curl.webp',
    name: 'EZ-Bar Preacher Curl',
    hindi_name: 'प्रीचर कर्ल',
    category: 'biceps',
    targetMuscle: 'Biceps Short Head (Isolation)',
    secondaryMuscles: ['Brachialis'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Sit at preacher bench with armpits snug against top of pad and arms extended.',
      'Grip the EZ-bar on inner curves and curl weight upward toward shoulders.',
      'Stop just short of vertical to maintain tension, then lower with control.'
    ],
    defaultRestSeconds: 60,
    tips: 'Strictly prevents cheating by locking upper arms in place.'
  },
  {
    id: 'chin_ups',
    image_url: '/exercises/repdb/chin_ups.webp',
    name: 'Underhand Chin-Ups',
    hindi_name: 'चिन-अप्स (बाइसेप्स)',
    category: 'biceps',
    targetMuscle: 'Biceps & Lats',
    secondaryMuscles: ['Upper Back', 'Forearms'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Hang from bar with palms facing you (supinated grip) shoulder-width apart.',
      'Pull yourself up until chin clears bar, focusing on bicep flexion.',
      'Lower slowly all the way to a dead hang.'
    ],
    defaultRestSeconds: 90,
    tips: 'One of the best compound mass builders for biceps and back.'
  },

  // ==========================================
  // TRICEPS EXERCISES
  // ==========================================
  {
    id: 'skull_crushers',
    image_url: '/exercises/repdb/skull_crushers.webp',
    name: 'EZ-Bar Lying Triceps Extension (Skull Crushers)',
    hindi_name: 'स्कल क्रशर (Triceps)',
    category: 'triceps',
    targetMuscle: 'Triceps (Long & Medial Heads)',
    secondaryMuscles: ['Forearms'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Lie on flat bench holding EZ-bar with arms extended over chest.',
      'Angle upper arms slightly back toward your head (10-15°).',
      'Bend elbows to lower bar toward crown of forehead or just beyond top of head.',
      'Extend elbows to press weight back up to start position.'
    ],
    defaultRestSeconds: 75,
    tips: 'Keep elbows tucked in; do not let them flare outward.'
  },
  {
    id: 'cable_triceps_pushdown',
    image_url: '/exercises/repdb/cable_triceps_pushdown.webp',
    name: 'Cable Triceps Rope Pushdown',
    hindi_name: 'केबल ट्राइसेप पुशडाउन',
    category: 'triceps',
    targetMuscle: 'Triceps Lateral & Medial Heads',
    secondaryMuscles: ['Core Stability'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Attach rope to high pulley, stand with slight forward torso lean and elbows tucked at sides.',
      'Push rope straight down until arms are fully locked out.',
      'Spread rope ends apart at the bottom to maximize peak contraction.',
      'Allow forearms to rise smoothly to roughly 90 degrees before next rep.'
    ],
    defaultRestSeconds: 60,
    tips: 'Keep elbows stationary like hinges; do not move upper arms.'
  },
  {
    id: 'overhead_dumbbell_triceps_extension',
    image_url: '/exercises/repdb/overhead_dumbbell_triceps_extension.webp',
    name: 'Overhead Dumbbell Triceps Extension',
    hindi_name: 'ओवरहेड ट्राइसेप एक्सटेंशन',
    category: 'triceps',
    targetMuscle: 'Triceps Long Head (Stretch)',
    secondaryMuscles: ['Shoulder Stabilizers'],
    equipment: 'dumbbell',
    isBodyweight: false,
    instructions: [
      'Sit or stand holding one heavy dumbbell overhead with both hands cup-gripping under top plate.',
      'Lower dumbbell behind your head by bending elbows until you feel a deep triceps stretch.',
      'Extend arms straight back up overhead and squeeze.'
    ],
    defaultRestSeconds: 60,
    tips: 'Overhead positioning provides maximum stretch on the long head of the triceps.'
  },
  {
    id: 'close_grip_bench_press',
    image_url: '/exercises/repdb/close_grip_bench_press.webp',
    name: 'Close-Grip Barbell Bench Press',
    hindi_name: 'क्लोज ग्रिप बेंच प्रेस',
    category: 'triceps',
    targetMuscle: 'Triceps & Inner Chest',
    secondaryMuscles: ['Front Delts'],
    equipment: 'barbell',
    isBodyweight: false,
    instructions: [
      'Lie flat on bench, grip bar with hands shoulder-width apart (not too narrow to protect wrists).',
      'Lower bar to lower chest while keeping elbows tucked close along torso.',
      'Press up explosively through triceps to lock out.'
    ],
    defaultRestSeconds: 90,
    tips: 'Keep grip roughly 12–14 inches apart to avoid wrist strain.'
  },
  {
    id: 'bench_dips',
    image_url: '/exercises/repdb/bench_dips.webp',
    name: 'Bench Dips',
    hindi_name: 'बेंच डिप्स',
    category: 'triceps',
    targetMuscle: 'Triceps & Chest',
    secondaryMuscles: ['Anterior Delts'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Place hands on edge of bench behind you, legs extended in front on floor.',
      'Lower hips by bending elbows until they reach 90 degrees.',
      'Push through palms to return to top position.'
    ],
    defaultRestSeconds: 60,
    tips: 'Elevate feet on a second bench for increased resistance.'
  },

  // ==========================================
  // CORE & ABDOMINALS
  // ==========================================
  {
    id: 'hanging_leg_raise',
    image_url: '/exercises/repdb/hanging_leg_raise.webp',
    name: 'Hanging Leg / Knee Raises',
    hindi_name: 'हैंगिंग लेग रेज',
    category: 'core',
    targetMuscle: 'Lower Abdominals & Hip Flexors',
    secondaryMuscles: ['Grip / Forearms', 'Obliques'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Hang from pull-up bar with arms straight and body still.',
      'Engage core and raise legs (or knees for beginners) until thighs are parallel to ground or higher.',
      'Curl pelvis upward at top of rep to actively engage abs, then lower slowly without swinging.'
    ],
    defaultRestSeconds: 60,
    tips: 'Eliminate swinging by resetting completely at the bottom of each rep.'
  },
  {
    id: 'cable_woodchoppers',
    name: 'Cable Woodchoppers (Obliques)',
    hindi_name: 'केबल वुडचॉपर',
    category: 'core',
    targetMuscle: 'Internal & External Obliques',
    secondaryMuscles: ['Transverse Abdominis', 'Shoulders'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Set cable handle at high position, stand sideways holding handle with both hands.',
      'Rotate torso downward and across body toward opposite knee in a diagonal chopping motion.',
      'Control the return back to starting position.'
    ],
    defaultRestSeconds: 45,
    tips: 'Rotate from your core/torso rather than pulling purely with your arms.'
  },
  {
    id: 'plank_hold',
    image_url: '/exercises/repdb/plank_hold.webp',
    name: 'Standard Forearm Plank',
    hindi_name: 'प्लैंक (Plank)',
    category: 'core',
    targetMuscle: 'Transverse Abdominis & Deep Core Stability',
    secondaryMuscles: ['Glutes', 'Shoulders', 'Lower Back'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'Support weight on forearms and toes, elbows placed directly under shoulders.',
      'Engage abs, squeeze glutes, and maintain a rigid straight line from head to heels.',
      'Breathe steadily without letting hips sag down or pike upward.'
    ],
    defaultRestSeconds: 60,
    tips: 'Focus on maximum tension for time duration (e.g. 45-60s).'
  },
  {
    id: 'cable_ab_crunches',
    image_url: '/exercises/repdb/cable_ab_crunches.webp',
    name: 'Kneeling Cable Rope Crunch',
    hindi_name: 'केबल क्रंचेस',
    category: 'core',
    targetMuscle: 'Rectus Abdominis (Upper Abs)',
    secondaryMuscles: ['Obliques'],
    equipment: 'cable',
    isBodyweight: false,
    instructions: [
      'Kneel below high pulley holding rope attachment at sides of head.',
      'Hinge at waist and flex abs to curl torso downward, bringing elbows toward knees.',
      'Hold the contraction for 1 second, then slowly return.'
    ],
    defaultRestSeconds: 45,
    tips: 'Curl your spine into a C-shape to contract abs rather than hinging at hips.'
  },

  // ==========================================
  // CARDIO & CONDITIONING
  // ==========================================
  {
    id: 'treadmill_running',
    image_url: '/exercises/repdb/treadmill_running.webp',
    name: 'Treadmill Incline Walk / Jog',
    hindi_name: 'ट्रेडमिल रनिंग / वॉक',
    category: 'cardio',
    targetMuscle: 'Cardiovascular & Lower Body Endurance',
    secondaryMuscles: ['Calves', 'Hamstrings', 'Glutes'],
    equipment: 'machine',
    isBodyweight: false,
    instructions: [
      'Set treadmill to desired speed and 2-5% incline.',
      'Maintain an upright posture and brisk pace for 15-30 minutes.'
    ],
    defaultRestSeconds: 60,
    tips: 'Incline walking is easy on the knees while burning high calories.'
  },
  {
    id: 'jump_rope',
    image_url: '/exercises/repdb/jump_rope.webp',
    name: 'Jump Rope / Skipping',
    hindi_name: 'रस्सी कूदना (Jump Rope)',
    category: 'cardio',
    targetMuscle: 'Calves, Core & Cardio Stamina',
    secondaryMuscles: ['Forearms', 'Shoulders'],
    equipment: 'none',
    isBodyweight: true,
    instructions: [
      'Hold rope handles at waist level, turn rope with wrists rather than whole arms.',
      'Jump gently on the balls of your feet just high enough for rope to pass beneath.'
    ],
    defaultRestSeconds: 60,
    tips: 'Stay light on your feet and jump in a steady rhythm.'
  },
  {
    id: 'burpees',
    image_url: '/exercises/repdb/burpees.webp',
    name: 'Full Body Burpees',
    hindi_name: 'बर्पीज (Full Body)',
    category: 'cardio',
    targetMuscle: 'Full Body Conditioning',
    secondaryMuscles: ['Chest', 'Quads', 'Core', 'Cardio'],
    equipment: 'bodyweight',
    isBodyweight: true,
    instructions: [
      'From standing, drop into a squat and place hands on floor.',
      'Kick feet back into a push-up position, perform a quick pushup.',
      'Jump feet back in toward hands and explode vertically with hands overhead.'
    ],
    defaultRestSeconds: 60,
    tips: 'High-intensity conditioning builder.'
  },

  // ==========================================
  // KETTLEBELL & FUNCTIONAL
  // ==========================================
  {
    id: 'kettlebell_swing',
    image_url: '/exercises/repdb/kettlebell_swing.webp',
    name: 'Russian Kettlebell Swing',
    hindi_name: 'केटलबेल स्विंग (Swings)',
    category: 'legs',
    targetMuscle: 'Glutes, Hamstrings & Posterior Chain',
    secondaryMuscles: ['Core', 'Lower Back', 'Shoulders', 'Forearms'],
    equipment: 'kettlebell',
    isBodyweight: false,
    instructions: [
      'Stand with feet slightly wider than shoulder-width, kettlebell on floor about a foot in front.',
      'Hinge at hips, reach down to grip handle firmly with both hands.',
      'Hike kettlebell back between legs, then snap hips forward forcefully to propel bell to chest height.',
      'Allow bell to swing back between legs under control and repeat in a fluid rhythm.'
    ],
    defaultRestSeconds: 60,
    tips: 'Power comes entirely from the hip hinge snap, not by lifting with your arms.'
  },
  {
    id: 'kettlebell_goblet_squat',
    image_url: '/exercises/repdb/kettlebell_goblet_squat.webp',
    name: 'Kettlebell Goblet Squat',
    hindi_name: 'केटलबेल गॉब्लेट स्क्वाट',
    category: 'legs',
    targetMuscle: 'Quadriceps, Glutes & Core',
    secondaryMuscles: ['Adductors', 'Calves', 'Biceps'],
    equipment: 'kettlebell',
    isBodyweight: false,
    instructions: [
      'Hold kettlebell at chest height with both hands cupping the horns.',
      'Keep chest tall and squat down between your knees until elbows touch inside of thighs.',
      'Drive through mid-foot to stand up and lock out hips.'
    ],
    defaultRestSeconds: 60,
    tips: 'Helps master deep squatting mechanics with a clean upright torso.'
  },

  // ==========================================
  // RESISTANCE BANDS
  // ==========================================
  {
    id: 'band_pull_apart',
    image_url: '/exercises/repdb/band_pull_apart.webp',
    name: 'Resistance Band Pull-Aparts',
    hindi_name: 'बैंड पुल-अपार्ट',
    category: 'shoulders',
    targetMuscle: 'Rear Deltoids & Rhomboids',
    secondaryMuscles: ['Upper Traps', 'Rotator Cuff'],
    equipment: 'bands',
    isBodyweight: false,
    instructions: [
      'Hold resistance band in front of chest with arms extended shoulder-width apart.',
      'Keeping arms straight with a soft elbow bend, pull band apart horizontally until it touches chest.',
      'Squeeze shoulder blades together for 1 second, then control band back to starting width.'
    ],
    defaultRestSeconds: 45,
    tips: 'Excellent for shoulder warmup, posture correction, and scapular health.'
  },
  {
    id: 'band_bicep_curl',
    name: 'Resistance Band Standing Bicep Curl',
    hindi_name: 'रेजिस्टेंस बैंड बाइसेप कर्ल',
    category: 'biceps',
    targetMuscle: 'Biceps Brachii (Peak Contraction)',
    secondaryMuscles: ['Brachialis', 'Forearms'],
    equipment: 'bands',
    isBodyweight: false,
    instructions: [
      'Stand on center of loop band with both feet shoulder-width apart.',
      'Hold band ends with underhand grip, elbows pinned to sides.',
      'Curl upward against increasing band resistance, squeezing at the peak.',
      'Lower slowly back to full arm extension.'
    ],
    defaultRestSeconds: 45,
    tips: 'Tension increases as you reach the top of the curl for maximum bicep pump.'
  }
];
