import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts, spacing } from '../theme';
import { getWorkoutSession } from '../data/workouts';

export default function DashboardScreen({ user, navigation }) {
  const insets = useSafeAreaInsets();
  const [steps, setSteps] = useState(0);
  const [sessionIndex, setSessionIndex] = useState(0);
  const stepGoal = 10000;
  const stepProgress = Math.min(steps / stepGoal, 1);

  useEffect(() => {
    // Simulate step count (replace with Google Fit / Apple Health integration)
    const simulate = Math.floor(Math.random() * 8000 + 2000);
    setSteps(simulate);
  }, []);

  const nextWorkout = getWorkoutSession('gym', sessionIndex);
  const today = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'בוקר טוב' : hour < 17 ? 'צהריים טובים' : 'ערב טוב';

  const readinessScore = Math.min(99, Math.round(60 + (steps / stepGoal) * 25 + 10));

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 8 }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {user?.name?.split(' ')[0] || 'לוחם'} 👊</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.avatarTxt}>
            {user?.name?.[0]?.toUpperCase() || '⚡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Readiness Card */}
      <View style={styles.readinessCard}>
        <View style={styles.readinessLeft}>
          <Text style={styles.readinessLabel}>מוכנות מבצעית</Text>
          <Text style={styles.readinessScore}>{readinessScore}</Text>
          <View style={styles.readinessBar}>
            <View style={[styles.readinessFill, { width: `${readinessScore}%` }]} />
          </View>
          <Text style={styles.readinessStatus}>
            {readinessScore >= 80 ? '🟢 מצוין — מוכן לאימון קשה' :
             readinessScore >= 60 ? '🟡 בינוני — אימון מתון מומלץ' :
             '🔴 נמוך — שקול מנוחה'}
          </Text>
        </View>
      </View>

      {/* Steps Card */}
      <View style={styles.stepsCard}>
        <View style={styles.stepsTop}>
          <Text style={styles.stepsLabel}>🦶 צעדים היום</Text>
          <Text style={styles.stepsCount}>
            <Text style={styles.stepsNum}>{steps.toLocaleString()}</Text>
            <Text style={styles.stepsGoal}> / {stepGoal.toLocaleString()}</Text>
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stepProgress * 100}%` }]} />
        </View>
        <Text style={styles.stepsKm}>{(steps * 0.0007).toFixed(1)} ק"מ • {Math.round(steps * 0.04)} קל'</Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickRow}>
        <QuickAction icon="🏃" label="ריצה" color={colors.info} onPress={() => navigation.navigate('Run')} />
        <QuickAction icon="🏋️" label="אימון" color={colors.accent} onPress={() => navigation.navigate('Workout')} />
        <QuickAction icon="🥗" label="תזונה" color={colors.success} onPress={() => navigation.navigate('Nutrition')} />
        <QuickAction icon="📊" label="היסטוריה" color={colors.warning} onPress={() => navigation.navigate('History')} />
      </View>

      {/* Today's Workout */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>האימון הבא שלך</Text>
        <TouchableOpacity onPress={() => setSessionIndex(i => i + 1)}>
          <Text style={styles.sectionLink}>שנה סשן</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.workoutCard}
        onPress={() => navigation.navigate('Workout')}
        activeOpacity={0.85}
      >
        <View style={styles.workoutCardTop}>
          <View style={styles.workoutBadge}>
            <Text style={styles.workoutBadgeTxt}>סשן {nextWorkout.key}</Text>
          </View>
          <Text style={styles.workoutType}>
            {nextWorkout.workoutType === 'gym' ? '🏋️ משקולות' : '💪 קליסטניקס'}
          </Text>
        </View>
        <Text style={styles.workoutName}>{nextWorkout.name}</Text>
        <View style={styles.workoutMeta}>
          <MetaChip icon="🔥" text={`${nextWorkout.exercises.length} תרגילים`} />
          <MetaChip icon="⏱" text={`${nextWorkout.exercises.length * 8}-${nextWorkout.exercises.length * 10} דקות`} />
          <MetaChip icon="💪" text={nextWorkout.muscleGroups.join(', ')} />
        </View>
        <View style={styles.startBtn}>
          <Text style={styles.startBtnTxt}>▶  התחל אימון</Text>
        </View>
      </TouchableOpacity>

      {/* Stats Row */}
      <Text style={styles.sectionTitle}>סטטיסטיקות שבועיות</Text>
      <View style={styles.statsRow}>
        <StatCard icon="🏃" value="12.4" unit="ק״מ" label="ריצה" />
        <StatCard icon="🏋️" value="3" unit="אימונים" label="השבוע" />
        <StatCard icon="🔥" value="2,840" unit="קל׳" label="נשרפו" />
      </View>
    </ScrollView>
  );
}

function QuickAction({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.quickIcon, { backgroundColor: color + '22', borderColor: color + '44' }]}>
        <Text style={styles.quickIconTxt}>{icon}</Text>
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetaChip({ icon, text }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipTxt}>{icon} {text}</Text>
    </View>
  );
}

function StatCard({ icon, value, unit, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: String(fonts.black), color: colors.textPrimary },
  date: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTxt: { color: colors.white, fontWeight: String(fonts.black), fontSize: 18 },

  // Readiness
  readinessCard: {
    backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20,
    marginBottom: 12, borderWidth: 1, borderColor: colors.accent + '40',
  },
  readinessLeft: {},
  readinessLabel: { color: colors.accent, fontSize: 12, fontWeight: String(fonts.bold), letterSpacing: 1, textTransform: 'uppercase' },
  readinessScore: { fontSize: 56, fontWeight: String(fonts.black), color: colors.white, lineHeight: 64 },
  readinessBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginVertical: 8 },
  readinessFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  readinessStatus: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: String(fonts.medium) },

  // Steps
  stepsCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18,
    marginBottom: 16, borderWidth: 1, borderColor: colors.border,
  },
  stepsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stepsLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: String(fonts.semibold) },
  stepsCount: {},
  stepsNum: { fontSize: 24, fontWeight: String(fonts.black), color: colors.textPrimary },
  stepsGoal: { fontSize: 14, color: colors.textMuted },
  progressTrack: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  stepsKm: { color: colors.textMuted, fontSize: 12, fontWeight: String(fonts.medium) },

  // Quick actions
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickAction: { alignItems: 'center', gap: 6 },
  quickIcon: {
    width: 60, height: 60, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  quickIconTxt: { fontSize: 26 },
  quickLabel: { fontSize: 11, fontWeight: String(fonts.bold), color: colors.textSecondary },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: String(fonts.extrabold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  sectionLink: { fontSize: 13, color: colors.accent, fontWeight: String(fonts.semibold) },

  // Workout card
  workoutCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18,
    marginBottom: 24, borderWidth: 1, borderColor: colors.border,
  },
  workoutCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  workoutBadge: { backgroundColor: colors.accent, borderRadius: radius.full, paddingVertical: 3, paddingHorizontal: 10 },
  workoutBadgeTxt: { color: colors.black, fontSize: 12, fontWeight: String(fonts.black) },
  workoutType: { color: colors.textMuted, fontSize: 13, fontWeight: String(fonts.medium) },
  workoutName: { fontSize: 18, fontWeight: String(fonts.bold), color: colors.textPrimary, marginBottom: 12, textAlign: 'right' },
  workoutMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  metaChip: { backgroundColor: colors.surface, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 10 },
  metaChipTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: String(fonts.medium) },
  startBtn: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center',
  },
  startBtnTxt: { color: colors.black, fontWeight: String(fonts.black), fontSize: 15 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: String(fonts.black), color: colors.textPrimary },
  statUnit: { fontSize: 10, color: colors.textMuted, fontWeight: String(fonts.medium) },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
