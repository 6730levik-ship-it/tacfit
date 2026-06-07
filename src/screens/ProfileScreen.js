import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Alert, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme';
import CamoBg from '../components/CamoBg';

const PROFILE_KEY = 'tacfit_profile';

const GOALS = [
  { key: 'cut',      label: 'חיטוב',  icon: '🔥', desc: 'שריפת שומן' },
  { key: 'maintain', label: 'שמירה',  icon: '⚖️', desc: 'שמירה על המשקל' },
  { key: 'bulk',     label: 'מסה',    icon: '💪', desc: 'בניית שריר' },
];

const WORKOUT_DAYS = [3, 4, 5];

export default function ProfileScreen({ user, onProfileSave }) {
  const insets = useSafeAreaInsets();
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  const [age, setAge] = useState('20');
  const [goal, setGoal] = useState('cut');
  const [workoutDays, setWorkoutDays] = useState(4);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        const p = JSON.parse(data);
        if (p.photo) setPhoto(p.photo);
        if (p.name) setName(p.name);
        if (p.weight) setWeight(String(p.weight));
        if (p.height) setHeight(String(p.height));
        if (p.age) setAge(String(p.age));
        if (p.goal) setGoal(p.goal);
        if (p.workoutDays) setWorkoutDays(p.workoutDays);
      }
    } catch {}
  };

  const pickPhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('העלאת תמונה', 'בגרסת הדפדפן — בחר קובץ תמונה');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('נדרשת הרשאה', 'אפשר גישה לגלריה כדי לבחור תמונת פרופיל');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const takeSelfie = async () => {
    if (Platform.OS === 'web') return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const saveProfile = async () => {
    if (!name.trim()) { Alert.alert('שם חסר', 'הכנס שם'); return; }
    const profile = {
      photo, name: name.trim(),
      weight: parseFloat(weight) || 75,
      height: parseFloat(height) || 175,
      age: parseInt(age) || 20,
      goal, workoutDays,
    };
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setSaved(true);
    onProfileSave?.(profile);
    setTimeout(() => setSaved(false), 2000);
  };

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : '--';
  const bmiLabel = bmi === '--' ? '' : parseFloat(bmi) < 18.5 ? 'תת-משקל' : parseFloat(bmi) < 25 ? 'תקין ✓' : parseFloat(bmi) < 30 ? 'עודף משקל' : 'השמנה';

  return (
    <CamoBg style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>הפרופיל שלי</Text>

        {/* ── Photo ────────────────────────────────────────────── */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoWrap} onPress={pickPhoto} activeOpacity={0.85}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImg} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>👤</Text>
                <Text style={styles.photoPlaceholderTxt}>הוסף תמונה</Text>
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Text style={styles.photoEditIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoActionBtn} onPress={pickPhoto}>
              <Text style={styles.photoActionTxt}>🖼️  גלריה</Text>
            </TouchableOpacity>
            {Platform.OS !== 'web' && (
              <TouchableOpacity style={styles.photoActionBtn} onPress={takeSelfie}>
                <Text style={styles.photoActionTxt}>🤳  סלפי</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Name ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📛 שם מלא</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="הכנס שם..."
            placeholderTextColor={colors.textMuted}
            textAlign="right"
          />
        </View>

        {/* ── Body Stats ────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📏 נתוני גוף</Text>
          <View style={styles.statsRow}>
            <View style={styles.statInput}>
              <Text style={styles.statInputLabel}>משקל (ק"ג)</Text>
              <TextInput
                style={styles.statInputField}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
            <View style={styles.statInput}>
              <Text style={styles.statInputLabel}>גובה (ס"מ)</Text>
              <TextInput
                style={styles.statInputField}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
            <View style={styles.statInput}>
              <Text style={styles.statInputLabel}>גיל</Text>
              <TextInput
                style={styles.statInputField}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
          </View>

          {/* BMI */}
          <View style={styles.bmiRow}>
            <Text style={styles.bmiLabel}>BMI: </Text>
            <Text style={[styles.bmiValue, {
              color: parseFloat(bmi) < 18.5 ? colors.info :
                     parseFloat(bmi) < 25   ? colors.success :
                     parseFloat(bmi) < 30   ? colors.warning : colors.danger
            }]}>{bmi}</Text>
            <Text style={styles.bmiStatus}> — {bmiLabel}</Text>
          </View>
        </View>

        {/* ── Goal ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>🎯 מטרה</Text>
          <View style={styles.goalRow}>
            {GOALS.map(g => (
              <TouchableOpacity
                key={g.key}
                style={[styles.goalBtn, goal === g.key && styles.goalBtnActive]}
                onPress={() => setGoal(g.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.goalIcon}>{g.icon}</Text>
                <Text style={[styles.goalLabel, goal === g.key && { color: colors.primary }]}>{g.label}</Text>
                <Text style={styles.goalDesc}>{g.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Workout Days ──────────────────────────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>📅 ימי אימון בשבוע</Text>
          <View style={styles.daysRow}>
            {WORKOUT_DAYS.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.dayBtn, workoutDays === d && styles.dayBtnActive]}
                onPress={() => setWorkoutDays(d)}
              >
                <Text style={[styles.dayBtnTxt, workoutDays === d && { color: colors.white }]}>{d}</Text>
                <Text style={[styles.dayBtnSub, workoutDays === d && { color: colors.white + 'cc' }]}>ימים</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Save Button ────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={saveProfile}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnTxt}>
            {saved ? '✓  נשמר בהצלחה!' : '💾  שמור פרופיל'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </CamoBg>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 24, fontWeight: String(fonts.black), color: colors.textPrimary, textAlign: 'right', marginBottom: 24 },

  // Photo
  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoWrap: { position: 'relative', marginBottom: 12 },
  photoImg: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: colors.primary },
  photoPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: colors.surface, borderWidth: 2,
    borderColor: colors.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  photoPlaceholderIcon: { fontSize: 32 },
  photoPlaceholderTxt: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  photoEditBadge: {
    position: 'absolute', bottom: 4, right: 4,
    backgroundColor: colors.primary, width: 30, height: 30,
    borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.white,
  },
  photoEditIcon: { fontSize: 14 },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoActionBtn: {
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  photoActionTxt: { color: colors.textSecondary, fontSize: 13, fontWeight: String(fonts.semibold) },

  // Card
  card: {
    backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardLabel: { fontSize: 13, fontWeight: String(fonts.bold), color: colors.textSecondary, textAlign: 'right', marginBottom: 12 },

  // Input
  input: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 14, fontSize: 16, color: colors.textPrimary,
    borderWidth: 1, borderColor: colors.border, fontWeight: String(fonts.medium),
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statInput: { flex: 1 },
  statInputLabel: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.semibold), textAlign: 'center', marginBottom: 6 },
  statInputField: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 12, fontSize: 20, fontWeight: String(fonts.black),
    color: colors.textPrimary, borderWidth: 1, borderColor: colors.border,
  },
  bmiRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  bmiLabel: { color: colors.textMuted, fontSize: 13 },
  bmiValue: { fontSize: 16, fontWeight: String(fonts.black) },
  bmiStatus: { color: colors.textMuted, fontSize: 13 },

  // Goal
  goalRow: { flexDirection: 'row', gap: 8 },
  goalBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  goalBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  goalIcon: { fontSize: 22, marginBottom: 4 },
  goalLabel: { fontSize: 13, fontWeight: String(fonts.bold), color: colors.textPrimary },
  goalDesc: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },

  // Days
  daysRow: { flexDirection: 'row', gap: 12 },
  dayBtn: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  dayBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayBtnTxt: { fontSize: 26, fontWeight: String(fonts.black), color: colors.textPrimary },
  dayBtnSub: { fontSize: 11, color: colors.textMuted, fontWeight: String(fonts.medium) },

  // Save
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8,
  },
  saveBtnDone: { backgroundColor: colors.success },
  saveBtnTxt: { color: colors.white, fontSize: 17, fontWeight: String(fonts.black) },
});
