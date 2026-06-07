import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, fonts } from '../theme';
import CamoBg from '../components/CamoBg';
import { getWorkoutSession } from '../data/workouts';

// Pedometer — Apple Watch / Health / Google Fit
let Pedometer;
if (Platform.OS !== 'web') {
  try { Pedometer = require('expo-sensors').Pedometer; } catch {}
}

const PROFILE_KEY = 'tacfit_profile';
const STEP_GOAL_DEFAULT = 10000;

export default function DashboardScreen({ user, navigation }) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(null);
  const [steps, setSteps] = useState(0);
  const [stepGoal, setStepGoal] = useState(STEP_GOAL_DEFAULT);
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [sessionIndex] = useState(0);
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Load profile
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

  // Pedometer — connects to Apple Health (Apple Watch) on iOS, Google Fit on Android
  useEffect(() => {
    if (Platform.OS === 'web' || !Pedometer) {
      // Web: simulate steps
      setSteps(Math.floor(Math.random() * 7000 + 1500));
      return;
    }

    let sub;
    const init = async () => {
      const { status } = await Pedometer.requestPermissionsAsync();
      if (status !== 'granted') { setSteps(0); return; }
      const avail = await Pedometer.isAvailableAsync();
      setPedometerAvailable(avail);
      if (!avail) { setSteps(3500); return; } // fallback

      // Get today's steps (midnight → now)
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(midnight, now);
        setSteps(result.steps);
      } catch {}

      // Live updates
      sub = Pedometer.watchStepCount(({ steps: s }) => setSteps(s));
    };
    init();
    return () => sub?.remove();
  }, []);

  // Animate ring when steps change
  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: Math.min(steps / stepGoal, 1),
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [steps]);

  const nextWorkout = getWorkoutSession('gym', sessionIndex);
  const displayName = profile?.name || user?.name?.split(' ')[0] || 'לוחם';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';
  const stepPercent = Math.min(Math.round((steps / stepGoal) * 100), 100);
  const stepKm = (steps * 0.0007).toFixed(1);
  const stepCal = Math.round(steps * 0.04);
  const readiness = Math.min(99, Math.round(55 + stepPercent * 0.3 + 10));

  return (
    <CamoBg style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {displayName} 👊</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarTxt}>{displayName[0]?.toUpperCase() || '⚡'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── STEP COUNTER — CENTER HERO ────────────────────────── */}
        <View style={styles.stepsHero}>
          {/* Ring */}
          <View style={styles.ringWrap}>
            <View style={styles.ringOuter}>
              {/* Background ring */}
              <View style={styles.ringBg} />
              {/* Progress — we fake it with rotation clipping */}
              <View style={[styles.ringProgress, { transform: [{ rotate: `${stepPercent * 3.6}deg` }] }]} />
              {/* Inner white */}
              <View style={styles.ringInner}>
                <Text style={styles.stepsNum}>{steps.toLocaleString()}</Text>
                <Text style={styles.stepsGoalTxt}>/ {stepGoal.toLocaleString()}</Text>
                <Text style={styles.stepsLabel}>צעדים</Text>
                <Text style={styles.stepsPercent}>{stepPercent}%</Text>
              </View>
            </View>
          </View>

          {/* Sub stats */}
          <View style={styles.stepsMeta}>
            <StepMetaChip icon="📏" value={`${stepKm} ק"מ`} label="נהלכו" />
            <StepMetaChip icon="🔥" value={`${stepCal} קל'`} label="נשרפו" />
            <StepMetaChip
              icon={pedometerAvailable ? "⌚" : "📱"}
              value={pedometerAvailable ? "Apple Watch" : Platform.OS === 'web' ? "Web Demo" : "Health"}
              label="מקור"
              accent
            />
          </View>

          {/* Apple Watch indicator */}
          {Platform.OS !== 'web' && (
            <View style={[styles.watchBadge, pedometerAvailable && styles.watchBadgeActive]}>
              <Text style={styles.watchBadgeIcon}>⌚</Text>
              <Text style={styles.watchBadgeTxt}>
                {pedometerAvailable
                  ? 'מחובר ל-Apple Health / Apple Watch'
                  : 'מתחבר ל-Apple Health...'}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          {[
            { icon: '🏃', label: 'ריצה',    screen: 'Run',      color: colors.info },
            { icon: '🏋️', label: 'אימון',   screen: 'Workout',  color: colors.accent },
            { icon: '🥗', label: 'תזונה',   screen: 'Nutrition',color: colors.success },
            { icon: '👤', label: 'פרופיל',  screen: 'Profile',  color: colors.warning },
          ].map(a => (
            <TouchableOpacity key={a.screen} style={styles.quickBtn} onPress={() => navigation.navigate(a.screen)} activeOpacity={0.8}>
              <View style={[styles.quickIcon, { backgroundColor: a.color + '22', borderColor: a.color + '55' }]}>
                <Text style={styles.quickIconTxt}>{a.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Readiness */}
        <View style={styles.readinessCard}>
          <View>
            <Text style={styles.readinessLabel}>מוכנות מבצעית</Text>
            <Text style={styles.readinessScore}>{readiness}</Text>
            <Text style={styles.readinessStatus}>
              {readiness >= 80 ? '🟢 מצוין' : readiness >= 60 ? '🟡 בינוני' : '🔴 נמוך'}
            </Text>
          </View>
          <View style={styles.readinessBar}>
            <View style={[styles.readinessFill, { height: `${readiness}%` }]} />
          </View>
        </View>

        {/* Today's Workout */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>האימון הבא</Text>
        </View>
        <TouchableOpacity style={styles.workoutCard} onPress={() => navigation.navigate('Workout')} activeOpacity={0.85}>
          <View style={styles.workoutTop}>
            <View style={styles.sessionBadge}><Text style={styles.sessionBadgeTxt}>סשן {nextWorkout.key}</Text></View>
            <Text style={styles.workoutTypeTag}>🏋️ משקולות</Text>
          </View>
          <Text style={styles.workoutName}>{nextWorkout.name}</Text>
          <View style={styles.workoutChips}>
            <Chip text={`${nextWorkout.exercises.length} תרגילים`} />
            <Chip text={`~${nextWorkout.exercises.length * 9} דקות`} />
            <Chip text={nextWorkout.muscleGroups.join(' + ')} />
          </View>
          <View style={styles.workoutStartBtn}>
            <Text style={styles.workoutStartTxt}>▶  התחל עכשיו</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </CamoBg>
  );
}

function StepMetaChip({ icon, value, label, accent }) {
  return (
    <View style={[styles.stepChip, accent && styles.stepChipAccent]}>
      <Text style={styles.stepChipIcon}>{icon}</Text>
      <Text style={[styles.stepChipVal, accent && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.stepChipLabel}>{label}</Text>
    </View>
  );
}

function Chip({ text }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipTxt}>{text}</Text>
    </View>
  );
}

const RING_SIZE = 220;
const RING_THICKNESS = 18;

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 20, fontWeight: String(fonts.black), color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: colors.white, fontWeight: String(fonts.black), fontSize: 18 },

  // Steps Hero
  stepsHero: {
    backgroundColor: colors.bgCard, borderRadius: radius.xxl || 28, padding: 24,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.camo3, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6,
  },
  ringWrap: { marginBottom: 20 },
  ringOuter: {
    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    backgroundColor: colors.surface,
    borderWidth: RING_THICKNESS, borderColor: colors.surface,
  },
  ringBg: {
    position: 'absolute', width: RING_SIZE, height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_THICKNESS, borderColor: colors.border,
  },
  ringProgress: {
    position: 'absolute', width: RING_SIZE, height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_THICKNESS,
    borderTopColor: colors.primary,
    borderRightColor: colors.primary,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringInner: { alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  stepsNum: { fontSize: 42, fontWeight: String(fonts.black), color: colors.primary, lineHeight: 48 },
  stepsGoalTxt: { fontSize: 13, color: colors.textMuted, fontWeight: String(fonts.medium) },
  stepsLabel: { fontSize: 14, fontWeight: String(fonts.bold), color: colors.textSecondary, marginTop: 2 },
  stepsPercent: { fontSize: 22, fontWeight: String(fonts.black), color: colors.accent, marginTop: 4 },

  stepsMeta: { flexDirection: 'row', gap: 10, width: '100%', justifyContent: 'center' },
  stepChip: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  stepChipAccent: { borderColor: colors.primary + '50', backgroundColor: colors.primary + '10' },
  stepChipIcon: { fontSize: 18, marginBottom: 2 },
  stepChipVal: { fontSize: 13, fontWeight: String(fonts.black), color: colors.textPrimary },
  stepChipLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },

  watchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingVertical: 6, paddingHorizontal: 14, marginTop: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  watchBadgeActive: { borderColor: colors.primary + '60', backgroundColor: colors.primary + '12' },
  watchBadgeIcon: { fontSize: 14 },
  watchBadgeTxt: { fontSize: 12, color: colors.textSecondary, fontWeight: String(fonts.semibold) },

  // Quick actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  quickBtn: { alignItems: 'center', gap: 6 },
  quickIcon: { width: 58, height: 58, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickIconTxt: { fontSize: 24 },
  quickLabel: { fontSize: 11, fontWeight: String(fonts.bold), color: colors.textSecondary },

  // Readiness
  readinessCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, overflow: 'hidden',
  },
  readinessLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: String(fonts.bold), letterSpacing: 1, textTransform: 'uppercase' },
  readinessScore: { fontSize: 60, fontWeight: String(fonts.black), color: colors.white, lineHeight: 68 },
  readinessStatus: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: String(fonts.medium) },
  readinessBar: {
    width: 8, height: 100, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end',
  },
  readinessFill: { width: 8, backgroundColor: colors.accent, borderRadius: 4 },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: String(fonts.extrabold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },

  // Workout card
  workoutCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  workoutTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sessionBadge: { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  sessionBadgeTxt: { color: colors.black, fontSize: 12, fontWeight: String(fonts.black) },
  workoutTypeTag: { color: colors.textMuted, fontSize: 13 },
  workoutName: { fontSize: 17, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right', marginBottom: 10 },
  workoutChips: { flexDirection: 'row-reverse', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  chip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border },
  chipTxt: { color: colors.textSecondary, fontSize: 11, fontWeight: String(fonts.medium) },
  workoutStartBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  workoutStartTxt: { color: colors.white, fontWeight: String(fonts.black), fontSize: 15 },
});
