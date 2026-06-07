// ─── תוכניות אימון ABC מלאות ────────────────────────────────────────────────
// כל תרגיל מכיל: שם, שרירים, סטים, חזרות, מנוחה, וידאו (URL לשרת שלך)

export const gymWorkouts = {
  A: {
    name: 'אימון A — חזה, כתפיים, טריצפס',
    muscleGroups: ['חזה', 'כתפיים', 'טריצפס'],
    exercises: [
      { id: 'bench_press', name: 'לחיצת חזה במוט', sets: 4, reps: '8-10', rest: 90, muscles: 'חזה עליון', videoId: 'bench_press' },
      { id: 'incline_db', name: 'לחיצת משקולות בשיפוע', sets: 3, reps: '10-12', rest: 75, muscles: 'חזה עליון', videoId: 'incline_db' },
      { id: 'cable_fly', name: 'פשיטות כבל (Fly)', sets: 3, reps: '12-15', rest: 60, muscles: 'חזה אמצע', videoId: 'cable_fly' },
      { id: 'ohp', name: 'לחיצת כתפיים במוט', sets: 4, reps: '8-10', rest: 90, muscles: 'כתפיים קדמיות', videoId: 'ohp' },
      { id: 'lateral_raise', name: 'הרמות צד', sets: 3, reps: '12-15', rest: 60, muscles: 'כתפיים צדיות', videoId: 'lateral_raise' },
      { id: 'tricep_pushdown', name: 'לחיצת טריצפס בכבל', sets: 3, reps: '12-15', rest: 60, muscles: 'טריצפס', videoId: 'tricep_pushdown' },
      { id: 'skull_crusher', name: 'שוברי גולגולת', sets: 3, reps: '10-12', rest: 75, muscles: 'טריצפס', videoId: 'skull_crusher' },
    ],
  },
  B: {
    name: 'אימון B — גב, ביצפס',
    muscleGroups: ['גב', 'ביצפס'],
    exercises: [
      { id: 'deadlift', name: 'דדליפט', sets: 4, reps: '5-6', rest: 120, muscles: 'גב תחתון, ירכיים', videoId: 'deadlift' },
      { id: 'pullup', name: 'מתח רחב', sets: 4, reps: '6-10', rest: 90, muscles: 'גב רחב', videoId: 'pullup' },
      { id: 'barbell_row', name: 'חתירה במוט', sets: 4, reps: '8-10', rest: 90, muscles: 'גב אמצע', videoId: 'barbell_row' },
      { id: 'lat_pulldown', name: 'משיכת לט', sets: 3, reps: '10-12', rest: 75, muscles: 'גב רחב', videoId: 'lat_pulldown' },
      { id: 'seated_row', name: 'חתירה ישובה', sets: 3, reps: '10-12', rest: 75, muscles: 'גב אמצע', videoId: 'seated_row' },
      { id: 'barbell_curl', name: 'כפיפות מוט', sets: 3, reps: '10-12', rest: 60, muscles: 'ביצפס', videoId: 'barbell_curl' },
      { id: 'hammer_curl', name: 'Hammer Curl', sets: 3, reps: '12-15', rest: 60, muscles: 'ביצפס, ברכיוראדיאליס', videoId: 'hammer_curl' },
    ],
  },
  C: {
    name: 'אימון C — רגליים, ישבן',
    muscleGroups: ['רגליים', 'ישבן'],
    exercises: [
      { id: 'squat', name: 'סקוואט עמוק', sets: 4, reps: '6-8', rest: 120, muscles: 'ארבע ראשי, ישבן', videoId: 'squat' },
      { id: 'leg_press', name: 'לחיצת רגליים', sets: 3, reps: '10-12', rest: 90, muscles: 'ארבע ראשי', videoId: 'leg_press' },
      { id: 'romanian_dl', name: 'דדליפט רומני', sets: 3, reps: '10-12', rest: 90, muscles: 'ירכיים אחוריות, ישבן', videoId: 'romanian_dl' },
      { id: 'leg_curl', name: 'כפיפת רגל', sets: 3, reps: '12-15', rest: 60, muscles: 'ירכיים אחוריות', videoId: 'leg_curl' },
      { id: 'leg_ext', name: 'פשיטת רגל', sets: 3, reps: '12-15', rest: 60, muscles: 'ארבע ראשי', videoId: 'leg_ext' },
      { id: 'calf_raise', name: 'עמידות עקב', sets: 4, reps: '15-20', rest: 45, muscles: 'שוקיים', videoId: 'calf_raise' },
      { id: 'hip_thrust', name: 'Hip Thrust', sets: 3, reps: '12-15', rest: 75, muscles: 'ישבן', videoId: 'hip_thrust' },
    ],
  },
};

export const calisthenicsWorkouts = {
  A: {
    name: 'אימון A — דחיפה (Push)',
    muscleGroups: ['חזה', 'כתפיים', 'טריצפס'],
    exercises: [
      { id: 'cal_pushup', name: 'שכיבות סמיכה (רחבות)', sets: 4, reps: '12-20', rest: 60, muscles: 'חזה, כתפיים', videoId: 'cal_pushup' },
      { id: 'cal_pike', name: 'Pike Push-Up', sets: 3, reps: '10-15', rest: 60, muscles: 'כתפיים', videoId: 'cal_pike' },
      { id: 'cal_dip', name: 'מקבילים (Dips)', sets: 4, reps: '8-15', rest: 75, muscles: 'חזה, טריצפס', videoId: 'cal_dip' },
      { id: 'cal_diamond', name: 'שכיבות יהלום', sets: 3, reps: '10-15', rest: 60, muscles: 'טריצפס', videoId: 'cal_diamond' },
      { id: 'cal_archer', name: 'Archer Push-Up', sets: 3, reps: '8-12', rest: 75, muscles: 'חזה חד-צדדי', videoId: 'cal_archer' },
      { id: 'cal_handstand_wall', name: 'עמידת ידיים (כנגד קיר)', sets: 3, reps: '20-30 שניות', rest: 90, muscles: 'כתפיים', videoId: 'cal_handstand_wall' },
    ],
  },
  B: {
    name: 'אימון B — משיכה (Pull)',
    muscleGroups: ['גב', 'ביצפס'],
    exercises: [
      { id: 'cal_pullup', name: 'מתח (Pull-Up)', sets: 4, reps: '5-10', rest: 90, muscles: 'גב רחב', videoId: 'cal_pullup' },
      { id: 'cal_chinup', name: 'צ\'ין-אפ', sets: 3, reps: '6-12', rest: 75, muscles: 'ביצפס, גב', videoId: 'cal_chinup' },
      { id: 'cal_au', name: 'Australian Pull-Up', sets: 3, reps: '12-15', rest: 60, muscles: 'גב אמצע', videoId: 'cal_au' },
      { id: 'cal_com_row', name: 'Commando Row (רצועות TRX)', sets: 3, reps: '10-15', rest: 60, muscles: 'גב, ביצפס', videoId: 'cal_com_row' },
      { id: 'cal_lto', name: 'Tuck L-Sit', sets: 3, reps: '15-30 שניות', rest: 60, muscles: 'בטן, ירכיים', videoId: 'cal_lto' },
      { id: 'cal_neg_pullup', name: 'Negative Pull-Up', sets: 3, reps: '5-8', rest: 90, muscles: 'גב, ביצפס', videoId: 'cal_neg_pullup' },
    ],
  },
  C: {
    name: 'אימון C — רגליים ופלג גוף תחתון',
    muscleGroups: ['רגליים', 'ישבן', 'כוח ליבה'],
    exercises: [
      { id: 'cal_squat', name: 'Bodyweight Squat', sets: 4, reps: '20-25', rest: 45, muscles: 'ארבע ראשי, ישבן', videoId: 'cal_squat' },
      { id: 'cal_pistol', name: 'Pistol Squat', sets: 3, reps: '5-10', rest: 90, muscles: 'ארבע ראשי חד-צדדי', videoId: 'cal_pistol' },
      { id: 'cal_lunge', name: 'לאנג\'ס', sets: 3, reps: '12-15', rest: 60, muscles: 'ירכיים, ישבן', videoId: 'cal_lunge' },
      { id: 'cal_nordic', name: 'Nordic Curl', sets: 3, reps: '5-8', rest: 90, muscles: 'ירכיים אחוריות', videoId: 'cal_nordic' },
      { id: 'cal_glute_bridge', name: 'Glute Bridge', sets: 4, reps: '20-25', rest: 45, muscles: 'ישבן', videoId: 'cal_glute_bridge' },
      { id: 'cal_jump_squat', name: 'Jump Squat', sets: 3, reps: '10-15', rest: 60, muscles: 'כל הרגל + ליבה', videoId: 'cal_jump_squat' },
      { id: 'cal_burpee', name: 'בורפי', sets: 3, reps: '10-15', rest: 60, muscles: 'גוף מלא', videoId: 'cal_burpee' },
    ],
  },
};

// תפריטי תזונה מוכנים מראש
export const nutritionPlans = {
  cut: {
    name: 'חיטוב',
    description: 'גירעון קלורי מבוקר לשריפת שומן תוך שמירת שריר',
    meals: [
      {
        meal: 'ארוחת בוקר',
        foods: ['3 ביצים קשות', '2 פרוסות לחם מלא', 'גבינה 5% (100 גרם)', 'ירקות חתוכים', 'קפה/תה ללא סוכר'],
        calories: 480, protein: 38, carbs: 35, fat: 18,
      },
      {
        meal: 'ארוחת אמצע בוקר',
        foods: ['גביע קוטג\' 3% (200 גרם)', 'תפוח / בננה אחת', 'קומץ שקדים (20 גרם)'],
        calories: 280, protein: 22, carbs: 28, fat: 8,
      },
      {
        meal: 'ארוחת צהריים',
        foods: ['חזה עוף (150 גרם)', 'אורז לבן מבושל (150 גרם)', 'ירקות מוקפצים בשמן זית', 'סלט ירוק'],
        calories: 520, protein: 45, carbs: 52, fat: 10,
      },
      {
        meal: 'אחה"צ (אחרי אימון)',
        foods: ['שייק חלבון (1 סקופ)', '150 מל חלב 1%', 'בננה', '2 אורז תופח'],
        calories: 320, protein: 30, carbs: 42, fat: 4,
      },
      {
        meal: 'ארוחת ערב',
        foods: ['סלמון / טונה / עוף (150 גרם)', 'בטטה (200 גרם)', 'ברוקולי מאודה', 'לימון + שמן זית'],
        calories: 440, protein: 40, carbs: 38, fat: 12,
      },
    ],
    totalCalories: 2040, totalProtein: 175, totalCarbs: 195, totalFat: 52,
  },
  bulk: {
    name: 'מסה',
    description: 'עודף קלורי נקי לבניית שריר מקסימלית',
    meals: [
      {
        meal: 'ארוחת בוקר',
        foods: ['4 ביצים (חביתה)', '3 פרוסות לחם מלא', 'אבוקדו חצי', 'גבינה עמוקה (50 גרם)', 'כוס שיבולת שועל'],
        calories: 720, protein: 42, carbs: 68, fat: 28,
      },
      {
        meal: 'ארוחת אמצע בוקר',
        foods: ['שייק מסה: חלב, בננה, שוקולד שחור, 2 כפות חמאת בוטנים, סקופ חלבון'],
        calories: 580, protein: 38, carbs: 62, fat: 18,
      },
      {
        meal: 'ארוחת צהריים',
        foods: ['אנטריקוט / עוף שלם (200 גרם)', 'אורז לבן (200 גרם מבושל)', 'ירקות מוקפצים', 'לחם פיתה'],
        calories: 780, protein: 58, carbs: 88, fat: 18,
      },
      {
        meal: 'אחה"צ (אחרי אימון)',
        foods: ['2 סקופ חלבון', '300 מל חלב 3%', 'בננה', '3 אורז תופח עם ריבה'],
        calories: 520, protein: 50, carbs: 62, fat: 8,
      },
      {
        meal: 'ארוחת ערב',
        foods: ['סטייק כתף (200 גרם)', 'תפוחי אדמה אפויים (250 גרם)', 'סלט + שמן זית נדיב', 'לחם 2 פרוסות'],
        calories: 680, protein: 52, carbs: 72, fat: 20,
      },
      {
        meal: 'לפני שינה',
        foods: ['קוטג\' 3% (250 גרם)', 'כפית דבש', '10 שקדים'],
        calories: 280, protein: 28, carbs: 18, fat: 10,
      },
    ],
    totalCalories: 3560, totalProtein: 268, totalCarbs: 370, totalFat: 102,
  },
  maintain: {
    name: 'שמירה',
    description: 'שמירה על המשקל תוך שיפור יחס שריר-שומן',
    meals: [
      {
        meal: 'ארוחת בוקר',
        foods: ['3 ביצים', '2 פרוסות לחם מלא', 'גבינה לבנה (80 גרם)', 'עגבניה, מלפפון'],
        calories: 520, protein: 36, carbs: 38, fat: 20,
      },
      {
        meal: 'ארוחת אמצע בוקר',
        foods: ['יוגורט יווני (150 גרם)', 'פרי עונתי', '15 שקדים'],
        calories: 300, protein: 20, carbs: 28, fat: 12,
      },
      {
        meal: 'ארוחת צהריים',
        foods: ['חזה עוף (180 גרם)', 'קינואה (120 גרם מבושל)', 'ירקות צלויים בתנור', 'חומוס (3 כפות)'],
        calories: 580, protein: 50, carbs: 55, fat: 14,
      },
      {
        meal: 'אחה"צ (אחרי אימון)',
        foods: ['שייק חלבון (1 סקופ)', 'חלב 1.5% (200 מל)', 'בננה'],
        calories: 320, protein: 30, carbs: 38, fat: 5,
      },
      {
        meal: 'ארוחת ערב',
        foods: ['דג (סלמון/פנגסיוס) 160 גרם', 'פתיתים / אורז (120 גרם)', 'סלט ירוק גדול', 'שמן זית + לימון'],
        calories: 480, protein: 40, carbs: 44, fat: 14,
      },
    ],
    totalCalories: 2200, totalProtein: 176, totalCarbs: 203, totalFat: 65,
  },
};

// לוגיקה לבחירת סשן אימון לפי יום + מחזור ABC
export function getWorkoutSession(workoutType, sessionIndex) {
  const plan = workoutType === 'gym' ? gymWorkouts : calisthenicsWorkouts;
  const keys = ['A', 'B', 'C'];
  const key = keys[sessionIndex % 3];
  return { ...plan[key], key, workoutType };
}

// מחשבון קלוריות (Mifflin-St Jeor)
export function calcDailyCalories({ weight, height, age, gender = 'male', goal, activityLevel = 1.55 }) {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const tdee = Math.round(bmr * activityLevel);
  if (goal === 'cut') return Math.round(tdee - 400);
  if (goal === 'bulk') return Math.round(tdee + 400);
  return tdee;
}
