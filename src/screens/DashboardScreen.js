import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Animated, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, fonts } from '../theme';
import { getWorkoutSession } from '../data/workouts';

let Pedometer;
if (Platform.OS !== 'web') {
  try { Pedometer = require('expo-sensors').Pedometer; } catch {}
}

const { width } = Dimensions.get('window');
const PROFILE_KEY = 'tacfit_profile';
const STEP_GOAL = 10000;

// ─── Circular Progress Ring ──────────────────────────────────────────────────
function CircularRing({ progress, size = 200, stroke = 14, children }) {
  const segments = 60;
  const filled = Math.round(progress * segments);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Tick marks */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * 360 - 90;
        const rad = (angle * Math.PI) / 180;
        const r = size / 2 - stroke / 2;
        const x = size / 2 + r * Math.cos(rad) - stroke / 2;
        const y = size / 2 + r * Math.sin(rad) - stroke / 2;
        const isFilled = i < filled;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: stroke - 2,
              height: stroke - 2,
              borderRadius: (stroke - 2) / 2,
              backgroundColor: isFilled ? colors.primary : colors.border,
              opacity: isFilled ? 1 : 0.4,
              transform: [{ scale: isFilled ? 1 : 0.7 }],
            }}
          />
        );
      })}
      {/* Center content */}
      <View style={{
        position: 'absolute',
        width: size - stroke * 3,
        height: size - stroke * 3,
        borderRadius: (size - stroke * 3) / 2,
        backgroundColor: colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </View>
    </View>
  );
}

export default function DashboardScreen({ user, navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [steps, setSteps] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [sessionIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await AsyncStorage.getItem(PROFILE_KEY);
        if (data) setProfile(JSON.parse(data));
      } catch {}
    };
    load();
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  useEffect(() => {
    if (Platform.OS === 'web' || !Pedometer) {
      setSteps(Math.floor(Math.random() * 7500 + 1500));
      return;
    }
    let sub;
    const init = async () => {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') { setSteps(0); return; }
      const avail = await Pedometer.isAvailableAsync();
      setPedometerAvailable(avail);
      if (!avail) { setSteps(4200); return; }
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(midnight, now);
        setSteps(result.steps);
      } catch {}
      sub = Pedometer.watchStepCount(({ steps: s }) => setSteps(s));
    };
    init();
    return () => sub?.remove();
  }, []);

  const nextWorkout = getWorkoutSession('gym', sessionIndex);
  const displayName = profile?.name || user?.name?.split(' ')[0] || 'לוחם';
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'לילה טוב' : hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';
  const stepPct = Math.min(steps / STEP_GOAL, 1);
  const stepKm = (steps * 0.0007).toFixed(1);
  const stepCal = Math.round(steps * 0.04);
  const readiness = Math.min(99, Math.round(55 + stepPct * 30 + 10));
  const today = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── TOP SECTION (camo header) ──────────────────────── */}
        <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
          {/* Camo blobs */}
          <View style={[styles.blob, { top: -20, left: -30, width: 160, height: 130, borderRadius: 80, opacity: 0.18, backgroundColor: colors.camo1 }]} />
          <View style={[styles.blob, { top: 40, right: -20, width: 120, height: 90, borderRadius: 60, opacity: 0.13, backgroundColor: colors.camo2 }]} />
          <View style={[styles.blob, { top: 120, left: 60, width: 80, height: 60, borderRadius: 40, opacity: 0.1, backgroundColor: colors.camo3 }]} />

          {/* Header row */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>{greeting} 👊</Text>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.date}>{today}</Text>
            </View>
            <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.avatarLetter}>{displayName[0]?.toUpperCase() || '⚡'}</Text>
              <View style={styles.avatarDot} />
            </TouchableOpacity>
          </View>

          {/* Readiness Banner */}
          <View style={styles.readinessBanner}>
            <View style={styles.readinessLeft}>
              <Text style={styles.readinessBannerLabel}>מוכנות מבצעית</Text>
              <View style={styles.readinessScoreRow}>
                <Text style={styles.readinessBannerScore}>{readiness}</Text>
                <Text style={styles.readinessBannerMax}>/100</Text>
              </View>
              <View style={styles.readinessBarTrack}>
                <View style={[styles.readinessBarFill, { width: `${readiness}%` }]} />
              </View>
            </View>
            <View style={styles.readinessDivider} />
            <View style={styles.readinessRight}>
              {[
                { icon: '💤', label: 'שינה', val: '7.2h', ok: true },
                { icon: '🏃', label: 'פעילות', val: `${stepKm}km`, ok: stepPct > 0.5 },
                { icon: '🔥', label: 'קלוריות', val: `${stepCal}`, ok: stepCal > 200 },
              ].map((item, i) => (
                <View key={i} style={styles.readinessMicroStat}>
                  <Text style={styles.readinessMicroIcon}>{item.icon}</Text>
                  <View>
                    <Text style={styles.readinessMicroVal}>{item.val}</Text>
                    <Text style={styles.readinessMicroLabel}>{item.label}</Text>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: item.ok ? colors.success : colors.warning }]} />
                </View>
              ))}
            </View>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── STEP COUNTER HERO ──────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>צעדים יומיים</Text>
              <View style={[styles.sourceBadge, pedometerAvailable && styles.sourceBadgeActive]}>
                <Text style={styles.sourceBadgeIcon}>{pedometerAvailable ? '⌚' : '📱'}</Text>
                <Text style={styles.sourceBadgeTxt}>
                  {pedometerAvailable ? 'Apple Watch' : Platform.OS === 'web' ? 'הדגמה' : 'Health'}
                </Text>
              </View>
            </View>

            <View style={styles.stepsCard}>
              {/* Ring + center */}
              <View style={styles.ringSection}>
                <CircularRing progress={stepPct} size={190} stroke={12}>
                  <Text style={styles.ringSteps}>{steps.toLocaleString()}</Text>
                  <Text style={styles.ringGoal}>מתוך {STEP_GOAL.toLocaleString()}</Text>
                  <Text style={styles.ringPct}>{Math.round(stepPct * 100)}%</Text>
                </CircularRing>
              </View>

              {/* Step stats row */}
              <View style={styles.stepStatsRow}>
                <StepStat icon="📏" value={`${stepKm}`} unit='ק"מ' label="נהלכו" />
                <View style={styles.stepStatDivider} />
                <StepStat icon="🔥" value={`${stepCal}`} unit="קל'" label="נשרפו" />
                <View style={styles.stepStatDivider} />
                <StepStat icon="👣" value={`${Math.round(stepPct * 100)}`} unit="%" label="יעד" color={stepPct >= 1 ? colors.success : stepPct > 0.5 ? colors.warning : colors.danger} />
              </View>

              {/* Progress bar (linear) */}
              <View style={styles.linearProgress}>
                <View style={[styles.linearFill, { width: `${Math.min(stepPct * 100, 100)}%` }]} />
                {[0.25, 0.5, 0.75].map(m => (
                  <View key={m} style={[styles.progressMark, { left: `${m * 100}%` }]} />
                ))}
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelTxt}>0</Text>
                <Text style={styles.progressLabelTxt}>2,500</Text>
                <Text style={styles.progressLabelTxt}>5,000</Text>
                <Text style={styles.progressLabelTxt}>7,500</Text>
                <Text style={styles.progressLabelTxt}>10K</Text>
              </View>
            </View>
          </View>

          {/* ── QUICK ACTIONS ─────────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.quickGrid}>
              {[
                { icon: '🏃', label: 'ריצה GPS',   screen: 'Run',      color: '#2563EB', desc: 'Pace Coach' },
                { icon: '🏋️', label: 'אימון ABC',  screen: 'Workout',  color: '#7C3AED', desc: 'משקולות / קליסטניקס' },
                { icon: '🥗', label: 'תזונה',      screen: 'Nutrition',color: '#16A34A', desc: 'חיטוב / מסה' },
                { icon: '👤', label: 'פרופיל',     screen: 'Profile',  color: '#C8A84B', desc: 'הגדרות' },
              ].map(a => (
                <TouchableOpacity
                  key={a.screen}
                  style={[styles.quickCard, { borderTopColor: a.color }]}
                  onPress={() => navigation.navigate(a.screen)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.quickIconWrap, { backgroundColor: a.color + '18' }]}>
                    <Text style={styles.quickIconTxt}>{a.icon}</Text>
                  </View>
                  <Text style={styles.quickCardLabel}>{a.label}</Text>
                  <Text style={styles.quickCardDesc}>{a.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── TODAY'S WORKOUT ───────────────────────────────── */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>האימון הבא</Text>
              <View style={styles.sessionPill}>
                <Text style={styles.sessionPillTxt}>סשן {nextWorkout.key}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.workoutCard}
              onPress={() => navigation.navigate('Workout')}
              activeOpacity={0.88}
            >
              {/* Top stripe */}
              <View style={styles.workoutStripe}>
                <View style={styles.workoutStripeLeft}>
                  <Text style={styles.workoutTypeIcon}>🏋️</Text>
                  <Text style={styles.workoutTypeTxt}>{nextWorkout.workoutType === 'gym' ? 'משקולות' : 'קליסטניקס'}</Text>
                </View>
                <View style={styles.workoutMusclesWrap}>
                  {nextWorkout.muscleGroups.map((m, i) => (
                    <View key={i} style={styles.muscleTag}>
                      <Text style={styles.muscleTagTxt}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={styles.workoutName}>{nextWorkout.name}</Text>

              {/* Exercise preview */}
              <View style={styles.exercisePreview}>
                {nextWorkout.exercises.slice(0, 3).map((ex, i) => (
                  <View key={i} style={styles.exercisePreviewRow}>
                    <View style={styles.exercisePreviewNum}>
                      <Text style={styles.exercisePreviewNumTxt}>{i + 1}</Text>
                    </View>
                    <Text style={styles.exercisePreviewName}>{ex.name}</Text>
                    <Text style={styles.exercisePreviewMeta}>{ex.sets}×{ex.reps}</Text>
                  </View>
                ))}
                {nextWorkout.exercises.length > 3 && (
                  <Text style={styles.exerciseMore}>+ {nextWorkout.exercises.length - 3} תרגילים נוספים...</Text>
                )}
              </View>

              {/* Footer stats + CTA */}
              <View style={styles.workoutFooter}>
                <View style={styles.workoutStats}>
                  <WorkoutStat icon="🔥" val={nextWorkout.exercises.length} label="תרגילים" />
                  <WorkoutStat icon="⏱" val={`~${nextWorkout.exercises.length * 9}'`} label="דקות" />
                  <WorkoutStat icon="💪" val={nextWorkout.exercises.reduce((s, e) => s + e.sets, 0)} label="סטים" />
                </View>
                <View style={styles.workoutStartBtn}>
                  <Text style={styles.workoutStartTxt}>התחל ▶</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── WEEKLY SUMMARY ────────────────────────────────── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>השבוע שלי</Text>
            <View style={styles.weeklyRow}>
              {[
                { day: 'א', done: true,  type: 'run' },
                { day: 'ב', done: true,  type: 'gym' },
                { day: 'ג', done: false, type: null },
                { day: 'ד', done: true,  type: 'gym' },
                { day: 'ה', done: false, type: null },
                { day: 'ו', done: false, type: null, today: true },
                { day: 'ש', done: false, type: null },
              ].map((d, i) => (
                <View key={i} style={styles.weekDay}>
                  <View style={[
                    styles.weekDayDot,
                    d.done && styles.weekDayDotDone,
                    d.today && styles.weekDayDotToday,
                  ]}>
                    {d.done && <Text style={styles.weekDayDotIcon}>{d.type === 'run' ? '🏃' : '🏋️'}</Text>}
                    {d.today && !d.done && <Text style={styles.weekDayDotToday2}>•</Text>}
                  </View>
                  <Text style={[styles.weekDayLabel, d.today && { color: colors.primary, fontWeight: String(fonts.bold) }]}>{d.day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.weeklyStats}>
              <WeeklyStat icon="🏃" val='12.4 ק"מ' label="נרצו" />
              <WeeklyStat icon="🏋️" val="3" label="אימונים" />
              <WeeklyStat icon="🔥" val="2,840" label="קל' נשרפו" />
              <WeeklyStat icon="📈" val="87%" label="עמידה ביעד" />
            </View>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StepStat({ icon, value, unit, label, color = colors.primary }) {
  return (
    <View style={styles.stepStat}>
      <Text style={styles.stepStatIcon}>{icon}</Text>
      <Text style={[styles.stepStatVal, { color }]}>{value}<Text style={styles.stepStatUnit}> {unit}</Text></Text>
      <Text style={styles.stepStatLabel}>{label}</Text>
    </View>
  );
}

function WorkoutStat({ icon, val, label }) {
  return (
    <View style={styles.workoutStatItem}>
      <Text style={styles.workoutStatIcon}>{icon}</Text>
      <Text style={styles.workoutStatVal}>{val}</Text>
      <Text style={styles.workoutStatLabel}>{label}</Text>
    </View>
  );
}

function WeeklyStat({ icon, val, label }) {
  return (
    <View style={styles.weeklyStat}>
      <Text style={styles.weeklyStatIcon}>{icon}</Text>
      <Text style={styles.weeklyStatVal}>{val}</Text>
      <Text style={styles.weeklyStatLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  blob: { position: 'absolute' },

  // Top section — camo header
  topSection: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: String(fonts.medium) },
  name: { fontSize: 24, fontWeight: String(fonts.black), color: colors.white, marginTop: 2 },
  date: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarLetter: { fontSize: 20, fontWeight: String(fonts.black), color: colors.primaryDark },
  avatarDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.success, borderWidth: 2, borderColor: colors.primary,
  },

  // Readiness banner (inside top section)
  readinessBanner: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.xl, padding: 16,
    flexDirection: 'row', gap: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  readinessLeft: { flex: 1 },
  readinessBannerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: String(fonts.bold), textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  readinessScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  readinessBannerScore: { fontSize: 42, fontWeight: String(fonts.black), color: colors.white, lineHeight: 48 },
  readinessBannerMax: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: String(fonts.medium) },
  readinessBarTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  readinessBarFill: { height: 5, backgroundColor: colors.accent, borderRadius: 3 },
  readinessDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  readinessRight: { gap: 8, justifyContent: 'center' },
  readinessMicroStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  readinessMicroIcon: { fontSize: 14 },
  readinessMicroVal: { fontSize: 12, fontWeight: String(fonts.bold), color: colors.white },
  readinessMicroLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginLeft: 2 },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: String(fonts.extrabold), color: colors.textPrimary, letterSpacing: 0.3 },

  // Source badge
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.surface, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border },
  sourceBadgeActive: { borderColor: colors.primary + '60', backgroundColor: colors.primary + '12' },
  sourceBadgeIcon: { fontSize: 12 },
  sourceBadgeTxt: { fontSize: 11, fontWeight: String(fonts.semibold), color: colors.textSecondary },

  // Steps card
  stepsCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.camo3, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
  },
  ringSection: { marginBottom: 20 },
  ringSteps: { fontSize: 34, fontWeight: String(fonts.black), color: colors.primary, lineHeight: 40 },
  ringGoal: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.medium) },
  ringPct: { fontSize: 20, fontWeight: String(fonts.black), color: colors.accent, marginTop: 4 },

  stepStatsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginBottom: 16 },
  stepStat: { alignItems: 'center' },
  stepStatIcon: { fontSize: 18, marginBottom: 2 },
  stepStatVal: { fontSize: 18, fontWeight: String(fonts.black) },
  stepStatUnit: { fontSize: 11, fontWeight: String(fonts.medium), color: colors.textMuted },
  stepStatLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  stepStatDivider: { width: 1, height: 40, backgroundColor: colors.border, alignSelf: 'center' },

  linearProgress: { height: 8, backgroundColor: colors.surface, borderRadius: 4, width: '100%', overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: colors.border },
  linearFill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  progressMark: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: colors.bgCard },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 4 },
  progressLabelTxt: { fontSize: 9, color: colors.textMuted, fontWeight: String(fonts.medium) },

  // Quick grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: (width - 50) / 2, backgroundColor: colors.bgCard,
    borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border,
    borderTopWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  quickIconWrap: { width: 44, height: 44, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickIconTxt: { fontSize: 22 },
  quickCardLabel: { fontSize: 15, fontWeight: String(fonts.bold), color: colors.textPrimary, marginBottom: 2 },
  quickCardDesc: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.medium) },

  // Workout card
  workoutCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4,
  },
  workoutStripe: {
    backgroundColor: colors.primary + '18', borderBottomWidth: 1, borderBottomColor: colors.border,
    padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  workoutStripeLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workoutTypeIcon: { fontSize: 18 },
  workoutTypeTxt: { fontSize: 13, fontWeight: String(fonts.bold), color: colors.primary },
  workoutMusclesWrap: { flexDirection: 'row', gap: 4 },
  muscleTag: { backgroundColor: colors.primary + '20', borderRadius: radius.full, paddingVertical: 2, paddingHorizontal: 8 },
  muscleTagTxt: { fontSize: 10, color: colors.primary, fontWeight: String(fonts.bold) },

  workoutName: { fontSize: 17, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right', padding: 14, paddingBottom: 8 },

  exercisePreview: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  exercisePreviewRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  exercisePreviewNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  exercisePreviewNumTxt: { color: colors.white, fontSize: 11, fontWeight: String(fonts.black) },
  exercisePreviewName: { flex: 1, fontSize: 13, color: colors.textSecondary, textAlign: 'right', fontWeight: String(fonts.medium) },
  exercisePreviewMeta: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.semibold) },
  exerciseMore: { fontSize: 12, color: colors.textMuted, textAlign: 'right', fontStyle: 'italic', marginTop: 2 },

  workoutFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: colors.border, padding: 14,
  },
  workoutStats: { flexDirection: 'row', gap: 16 },
  workoutStatItem: { alignItems: 'center' },
  workoutStatIcon: { fontSize: 14 },
  workoutStatVal: { fontSize: 14, fontWeight: String(fonts.black), color: colors.textPrimary },
  workoutStatLabel: { fontSize: 9, color: colors.textMuted },
  workoutStartBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 10, paddingHorizontal: 20 },
  workoutStartTxt: { color: colors.white, fontWeight: String(fonts.black), fontSize: 14 },

  sessionPill: { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  sessionPillTxt: { color: colors.primaryDark, fontSize: 12, fontWeight: String(fonts.black) },

  // Weekly
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  weekDay: { alignItems: 'center', gap: 6 },
  weekDayDot: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  weekDayDotDone: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  weekDayDotToday: { borderColor: colors.accent, borderWidth: 2 },
  weekDayDotIcon: { fontSize: 16 },
  weekDayDotToday2: { fontSize: 20, color: colors.accent, fontWeight: String(fonts.black) },
  weekDayLabel: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.semibold) },
  weeklyStats: {
    flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.xl,
    padding: 16, justifyContent: 'space-around',
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  weeklyStat: { alignItems: 'center', gap: 2 },
  weeklyStatIcon: { fontSize: 18 },
  weeklyStatVal: { fontSize: 14, fontWeight: String(fonts.black), color: colors.textPrimary },
  weeklyStatLabel: { fontSize: 10, color: colors.textMuted },
});
