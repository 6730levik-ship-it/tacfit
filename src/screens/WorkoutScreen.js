import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme';
import { gymWorkouts, calisthenicsWorkouts, getWorkoutSession } from '../data/workouts';

const PHASE = { SELECT_TYPE: 'select_type', OVERVIEW: 'overview', ACTIVE: 'active', DONE: 'done' };

export default function WorkoutScreen({ user, navigation }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState(PHASE.SELECT_TYPE);
  const [workoutType, setWorkoutType] = useState(null); // 'gym' | 'calisthenics'
  const [sessionIndex] = useState(0);
  const [workout, setWorkout] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [restMode, setRestMode] = useState(false);
  const [restSecs, setRestSecs] = useState(0);
  const timerRef = useRef(null);

  const selectType = (type) => {
    const session = getWorkoutSession(type, sessionIndex);
    setWorkoutType(type);
    setWorkout(session);
    setPhase(PHASE.OVERVIEW);
  };

  const startWorkout = () => {
    setCurrentExercise(0);
    setCurrentSet(1);
    setPhase(PHASE.ACTIVE);
  };

  const startRest = (secs) => {
    setRestSecs(secs);
    setRestMode(true);
    timerRef.current = setInterval(() => {
      setRestSecs(s => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          setRestMode(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const nextSet = () => {
    const ex = workout.exercises[currentExercise];
    if (currentSet < ex.sets) {
      setCurrentSet(s => s + 1);
      startRest(ex.rest);
    } else {
      // Move to next exercise
      if (currentExercise < workout.exercises.length - 1) {
        setCurrentExercise(e => e + 1);
        setCurrentSet(1);
        startRest(60);
      } else {
        clearInterval(timerRef.current);
        setPhase(PHASE.DONE);
      }
    }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── SELECT TYPE ─────────────────────────────────────────────────────────────
  if (phase === PHASE.SELECT_TYPE) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.screenTitle}>בחר סוג אימון</Text>
        <Text style={styles.screenSub}>בחר לפי הציוד הזמין לך עכשיו</Text>

        <TouchableOpacity style={styles.typeCard} onPress={() => selectType('gym')} activeOpacity={0.85}>
          <Text style={styles.typeEmoji}>🏋️</Text>
          <View style={styles.typeInfo}>
            <Text style={styles.typeName}>אימון משקולות</Text>
            <Text style={styles.typeDesc}>חדר כושר עם מוט, דמבלים ומכונות</Text>
            <View style={styles.tagRow}>
              {['חזה', 'גב', 'רגליים'].map(t => <Tag key={t} text={t} />)}
            </View>
          </View>
          <Text style={styles.typeArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.typeCard} onPress={() => selectType('calisthenics')} activeOpacity={0.85}>
          <Text style={styles.typeEmoji}>💪</Text>
          <View style={styles.typeInfo}>
            <Text style={styles.typeName}>קליסטניקס</Text>
            <Text style={styles.typeDesc}>משקל גוף + מתח/מקבילים. מתאים לשטח ובסיסים</Text>
            <View style={styles.tagRow}>
              {['ללא ציוד', 'בסיס', 'שטח'].map(t => <Tag key={t} text={t} color={colors.success} />)}
            </View>
          </View>
          <Text style={styles.typeArrow}>›</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── OVERVIEW ────────────────────────────────────────────────────────────────
  if (phase === PHASE.OVERVIEW && workout) {
    return (
      <ScrollView
        style={[styles.container, { paddingTop: insets.top + 16 }]}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity onPress={() => setPhase(PHASE.SELECT_TYPE)} style={styles.backBtn}>
          <Text style={styles.backTxt}>‹ חזרה</Text>
        </TouchableOpacity>

        <View style={styles.overviewHeader}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionBadgeTxt}>סשן {workout.key}</Text>
          </View>
          <Text style={styles.overviewTitle}>{workout.name}</Text>
          <View style={styles.overviewMeta}>
            <OvrChip icon="🔥" text={`${workout.exercises.length} תרגילים`} />
            <OvrChip icon="⏱" text={`~${workout.exercises.length * 9} דקות`} />
            <OvrChip icon="💪" text={workout.muscleGroups.join(' • ')} />
          </View>
        </View>

        {workout.exercises.map((ex, i) => (
          <View key={ex.id} style={styles.exRow}>
            <View style={styles.exNum}><Text style={styles.exNumTxt}>{i + 1}</Text></View>
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{ex.name}</Text>
              <Text style={styles.exMeta}>{ex.sets} סטים × {ex.reps} חזרות • מנוחה {ex.rest}ש'</Text>
              <Text style={styles.exMuscles}>{ex.muscles}</Text>
            </View>
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>▶</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.bigStartBtn} onPress={startWorkout}>
          <Text style={styles.bigStartTxt}>▶  התחל אימון</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── ACTIVE ──────────────────────────────────────────────────────────────────
  if (phase === PHASE.ACTIVE && workout) {
    const ex = workout.exercises[currentExercise];
    const progress = (currentExercise / workout.exercises.length);

    return (
      <View style={[styles.container, styles.activeContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressTxt}>תרגיל {currentExercise + 1} מתוך {workout.exercises.length}</Text>

        {restMode ? (
          // REST SCREEN
          <View style={styles.restScreen}>
            <Text style={styles.restLabel}>מנוחה</Text>
            <Text style={styles.restTimer}>{restSecs}</Text>
            <Text style={styles.restSub}>התרגיל הבא: {workout.exercises[Math.min(currentExercise + (currentSet >= ex.sets ? 1 : 0), workout.exercises.length - 1)]?.name}</Text>
            <TouchableOpacity style={styles.skipBtn} onPress={() => { clearInterval(timerRef.current); setRestMode(false); }}>
              <Text style={styles.skipTxt}>דלג על מנוחה ›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // EXERCISE SCREEN
          <View style={styles.exerciseScreen}>
            <View style={styles.videoBox}>
              <Text style={styles.videoBoxIcon}>🎥</Text>
              <Text style={styles.videoBoxTxt}>סרטון הדרכה</Text>
              <Text style={styles.videoBoxSub}>{ex.name}</Text>
            </View>

            <Text style={styles.exActiveName}>{ex.name}</Text>
            <Text style={styles.exActiveMuscles}>{ex.muscles}</Text>

            <View style={styles.setInfo}>
              <View style={styles.setBox}>
                <Text style={styles.setLabel}>סט</Text>
                <Text style={styles.setBig}>{currentSet}/{ex.sets}</Text>
              </View>
              <View style={styles.setBox}>
                <Text style={styles.setLabel}>חזרות</Text>
                <Text style={styles.setBig}>{ex.reps}</Text>
              </View>
              <View style={styles.setBox}>
                <Text style={styles.setLabel}>מנוחה</Text>
                <Text style={styles.setBig}>{ex.rest}ש'</Text>
              </View>
            </View>

            {/* Set dots */}
            <View style={styles.setDots}>
              {[...Array(ex.sets)].map((_, i) => (
                <View key={i} style={[styles.dot, i < currentSet && styles.dotDone]} />
              ))}
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={nextSet}>
              <Text style={styles.doneTxt}>✓  סיימתי את הסט</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // ── DONE ────────────────────────────────────────────────────────────────────
  if (phase === PHASE.DONE) {
    return (
      <View style={[styles.container, styles.doneContainer, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.doneEmoji}>🏆</Text>
        <Text style={styles.doneTitle}>אימון הושלם!</Text>
        <Text style={styles.doneDesc}>{workout?.name}</Text>
        <View style={styles.doneSummary}>
          <DoneStat icon="🔥" val={`${workout?.exercises.length}`} label="תרגילים" />
          <DoneStat icon="💪" val={`${workout?.exercises.reduce((s, e) => s + e.sets, 0)}`} label="סטים" />
          <DoneStat icon="⏱" val={`~${workout?.exercises.length * 9}`} label="דקות" />
        </View>
        <TouchableOpacity style={styles.bigStartBtn} onPress={() => setPhase(PHASE.SELECT_TYPE)}>
          <Text style={styles.bigStartTxt}>🏋️ אימון חדש</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.backTxt}>חזור לדאשבורד</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

function Tag({ text, color = colors.accent }) {
  return (
    <View style={[styles.tag, { borderColor: color + '40', backgroundColor: color + '15' }]}>
      <Text style={[styles.tagTxt, { color }]}>{text}</Text>
    </View>
  );
}
function OvrChip({ icon, text }) {
  return (
    <View style={styles.ovrChip}>
      <Text style={styles.ovrChipTxt}>{icon} {text}</Text>
    </View>
  );
}
function DoneStat({ icon, val, label }) {
  return (
    <View style={styles.doneStat}>
      <Text style={styles.doneStatIcon}>{icon}</Text>
      <Text style={styles.doneStatVal}>{val}</Text>
      <Text style={styles.doneStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  screenTitle: { fontSize: 24, fontWeight: String(fonts.black), color: colors.textPrimary, textAlign: 'right', marginBottom: 4 },
  screenSub: { fontSize: 14, color: colors.textMuted, textAlign: 'right', marginBottom: 24 },
  backBtn: { marginBottom: 16 },
  backTxt: { color: colors.accent, fontSize: 15, fontWeight: String(fonts.semibold) },

  typeCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18,
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: colors.border, gap: 14,
  },
  typeEmoji: { fontSize: 36 },
  typeInfo: { flex: 1 },
  typeName: { fontSize: 18, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right' },
  typeDesc: { fontSize: 13, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  tagRow: { flexDirection: 'row-reverse', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  tag: { borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 1 },
  tagTxt: { fontSize: 11, fontWeight: String(fonts.semibold) },
  typeArrow: { fontSize: 24, color: colors.textMuted },

  // Overview
  overviewHeader: { marginBottom: 20 },
  sessionBadge: { alignSelf: 'flex-end', backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 },
  sessionBadgeTxt: { color: colors.black, fontWeight: String(fonts.black), fontSize: 12 },
  overviewTitle: { fontSize: 20, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right', marginBottom: 10 },
  overviewMeta: { flexDirection: 'row-reverse', gap: 8, flexWrap: 'wrap' },
  ovrChip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  ovrChipTxt: { color: colors.textSecondary, fontSize: 12 },
  exRow: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 14,
    flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  exNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  exNumTxt: { color: colors.accent, fontWeight: String(fonts.black), fontSize: 13 },
  exInfo: { flex: 1 },
  exName: { fontSize: 14, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right' },
  exMeta: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  exMuscles: { fontSize: 11, color: colors.accent, textAlign: 'right', marginTop: 2 },
  videoPlaceholder: {
    width: 44, height: 44, borderRadius: radius.sm,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  videoIcon: { color: colors.accent, fontSize: 16 },

  bigStartBtn: {
    backgroundColor: colors.accent, borderRadius: radius.xl,
    paddingVertical: 18, alignItems: 'center', marginTop: 16,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  bigStartTxt: { color: colors.black, fontWeight: String(fonts.black), fontSize: 17 },

  // Active
  activeContainer: { paddingHorizontal: 20 },
  progressTrack: { height: 4, backgroundColor: colors.surface, borderRadius: 2, marginBottom: 8 },
  progressFill: { height: 4, backgroundColor: colors.accent, borderRadius: 2 },
  progressTxt: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 16 },

  restScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  restLabel: { color: colors.textMuted, fontSize: 16, fontWeight: String(fonts.semibold), marginBottom: 8 },
  restTimer: { fontSize: 80, fontWeight: String(fonts.black), color: colors.accent, lineHeight: 90 },
  restSub: { color: colors.textSecondary, fontSize: 14, marginTop: 12, textAlign: 'center' },
  skipBtn: { marginTop: 24 },
  skipTxt: { color: colors.accent, fontSize: 14, fontWeight: String(fonts.semibold) },

  exerciseScreen: { flex: 1 },
  videoBox: {
    backgroundColor: colors.surface, borderRadius: radius.xl, height: 180,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  videoBoxIcon: { fontSize: 36, marginBottom: 8 },
  videoBoxTxt: { color: colors.textMuted, fontSize: 14, fontWeight: String(fonts.semibold) },
  videoBoxSub: { color: colors.accent, fontSize: 12, marginTop: 4 },
  exActiveName: { fontSize: 22, fontWeight: String(fonts.black), color: colors.textPrimary, textAlign: 'center', marginBottom: 4 },
  exActiveMuscles: { color: colors.accent, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  setInfo: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  setBox: { alignItems: 'center' },
  setLabel: { color: colors.textMuted, fontSize: 12, fontWeight: String(fonts.medium) },
  setBig: { fontSize: 28, fontWeight: String(fonts.black), color: colors.textPrimary },
  setDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dotDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  doneBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.accent,
    paddingVertical: 18, alignItems: 'center',
  },
  doneTxt: { color: colors.accent, fontWeight: String(fonts.black), fontSize: 17 },

  // Done
  doneContainer: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  doneEmoji: { fontSize: 72 },
  doneTitle: { fontSize: 28, fontWeight: String(fonts.black), color: colors.textPrimary },
  doneDesc: { fontSize: 14, color: colors.textMuted },
  doneSummary: { flexDirection: 'row', gap: 20, marginVertical: 8 },
  doneStat: { alignItems: 'center' },
  doneStatIcon: { fontSize: 24 },
  doneStatVal: { fontSize: 22, fontWeight: String(fonts.black), color: colors.accent },
  doneStatLabel: { fontSize: 11, color: colors.textMuted },
});
