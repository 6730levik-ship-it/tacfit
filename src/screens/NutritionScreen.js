import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme';
import { nutritionPlans, calcDailyCalories } from '../data/workouts';

export default function NutritionScreen({ user }) {
  const insets = useSafeAreaInsets();
  const [selectedGoal, setSelectedGoal] = useState('cut');
  const plan = nutritionPlans[selectedGoal];

  const goals = [
    { key: 'cut', label: 'חיטוב', icon: '🔥', color: colors.danger },
    { key: 'maintain', label: 'שמירה', icon: '⚖️', color: colors.info },
    { key: 'bulk', label: 'מסה', icon: '💪', color: colors.success },
  ];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 8 }]}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>🥗 תזונה ותפריטים</Text>

      {/* Goal selector */}
      <View style={styles.goalRow}>
        {goals.map(g => (
          <TouchableOpacity
            key={g.key}
            style={[styles.goalBtn, selectedGoal === g.key && { borderColor: g.color, backgroundColor: g.color + '22' }]}
            onPress={() => setSelectedGoal(g.key)}
          >
            <Text style={styles.goalIcon}>{g.icon}</Text>
            <Text style={[styles.goalLabel, selectedGoal === g.key && { color: g.color }]}>{g.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Macros summary */}
      <View style={styles.macroCard}>
        <Text style={styles.macroTitle}>{plan.name} — יעד יומי</Text>
        <Text style={styles.macroDesc}>{plan.description}</Text>
        <View style={styles.macroRow}>
          <MacroBox label="קלוריות" value={plan.totalCalories} unit="קל׳" color={colors.warning} />
          <MacroBox label="חלבון" value={`${plan.totalProtein}g`} unit="" color={colors.info} />
          <MacroBox label="פחמימות" value={`${plan.totalCarbs}g`} unit="" color={colors.success} />
          <MacroBox label="שומן" value={`${plan.totalFat}g`} unit="" color={colors.danger} />
        </View>
      </View>

      {/* Meals */}
      <Text style={styles.mealsTitle}>תפריט יומי מלא</Text>
      {plan.meals.map((meal, i) => (
        <View key={i} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{meal.meal}</Text>
            <Text style={styles.mealCals}>{meal.calories} קל׳</Text>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.mealMacroTxt}>🥩 {meal.protein}g</Text>
            <Text style={styles.mealMacroTxt}>🌾 {meal.carbs}g</Text>
            <Text style={styles.mealMacroTxt}>🥑 {meal.fat}g</Text>
          </View>
          <View style={styles.foodList}>
            {meal.foods.map((f, j) => (
              <View key={j} style={styles.foodRow}>
                <Text style={styles.foodDot}>•</Text>
                <Text style={styles.foodTxt}>{f}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Calculator hint */}
      <View style={styles.calcHint}>
        <Text style={styles.calcHintTxt}>
          💡 הקלוריות מחושבות על בסיס חייל ממוצע (75 ק"ג, 175 ס"מ, גיל 20, פעילות גבוהה).
          ניתן להתאים אישית בהגדרות הפרופיל.
        </Text>
      </View>
    </ScrollView>
  );
}

function MacroBox({ label, value, unit, color }) {
  return (
    <View style={[styles.macroBox, { borderColor: color + '40', backgroundColor: color + '15' }]}>
      <Text style={[styles.macroVal, { color }]}>{value}</Text>
      {unit ? <Text style={styles.macroUnit}>{unit}</Text> : null}
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: String(fonts.black), color: colors.textPrimary, marginBottom: 20 },
  goalRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  goalBtn: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: 12, alignItems: 'center', borderWidth: 2, borderColor: colors.border,
  },
  goalIcon: { fontSize: 22, marginBottom: 4 },
  goalLabel: { fontSize: 13, fontWeight: String(fonts.bold), color: colors.textSecondary },
  macroCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18,
    marginBottom: 20, borderWidth: 1, borderColor: colors.border,
  },
  macroTitle: { fontSize: 16, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right', marginBottom: 4 },
  macroDesc: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginBottom: 14 },
  macroRow: { flexDirection: 'row', gap: 8 },
  macroBox: { flex: 1, borderRadius: radius.lg, padding: 10, alignItems: 'center', borderWidth: 1 },
  macroVal: { fontSize: 16, fontWeight: String(fonts.black) },
  macroUnit: { fontSize: 10, color: colors.textMuted },
  macroLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  mealsTitle: { fontSize: 14, fontWeight: String(fonts.extrabold), color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  mealCard: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: colors.border,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealName: { fontSize: 15, fontWeight: String(fonts.bold), color: colors.textPrimary },
  mealCals: { fontSize: 14, fontWeight: String(fonts.bold), color: colors.accent },
  mealMacros: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  mealMacroTxt: { fontSize: 12, color: colors.textMuted, fontWeight: String(fonts.medium) },
  foodList: { gap: 4 },
  foodRow: { flexDirection: 'row-reverse', gap: 6, alignItems: 'flex-start' },
  foodDot: { color: colors.accent, fontSize: 14 },
  foodTxt: { flex: 1, color: colors.textSecondary, fontSize: 13, textAlign: 'right' },
  calcHint: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginTop: 4,
  },
  calcHintTxt: { color: colors.textMuted, fontSize: 12, textAlign: 'right', lineHeight: 18 },
});
