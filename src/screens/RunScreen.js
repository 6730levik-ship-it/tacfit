import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Dimensions, Platform, Vibration,
} from 'react-native';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme';
import CamoBg from '../components/CamoBg';
import { calcDistance, formatTime, formatPace, calcCalories } from '../utils/runUtils';
import { saveRun } from '../storage/runStorage';

const { width } = Dimensions.get('window');
const PHASE = { SETUP: 'setup', ACTIVE: 'active', PAUSED: 'paused', DONE: 'done' };

export default function RunScreen() {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [runType, setRunType] = useState('free');
  const [withLoad, setWithLoad] = useState(false);
  const [targetKm, setTargetKm] = useState(3);
  const [targetMin, setTargetMin] = useState(14);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [currentPace, setCurrentPace] = useState(0);
  const [avgPace, setAvgPace] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);

  const timerRef = useRef(null);
  const locationRef = useRef(null);
  const elapsedRef = useRef(0);
  const distanceRef = useRef(0);
  const coordsRef = useRef([]);
  const lastKmRef = useRef(0);

  const startRun = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('נדרשת הרשאה', 'אפשר גישה למיקום כדי לעקוב אחר הריצה');
      return;
    }
    elapsedRef.current = 0; distanceRef.current = 0;
    coordsRef.current = []; lastKmRef.current = 0;
    setElapsed(0); setDistance(0); setCalories(0);
    setCurrentPace(0); setAvgPace(0); setSpeedKmh(0);
    setPhase(PHASE.ACTIVE);
    Speech.speak('ריצה התחילה. בהצלחה!', { language: 'he-IL', rate: 1.1 });
    timerRef.current = setInterval(() => { elapsedRef.current += 1; setElapsed(elapsedRef.current); }, 1000);
    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude, speed } = loc.coords;
        if (coordsRef.current.length > 0) {
          const prev = coordsRef.current[coordsRef.current.length - 1];
          const delta = calcDistance(prev.latitude, prev.longitude, latitude, longitude);
          if (delta > 0.003 && delta < 0.5) {
            distanceRef.current += delta;
            setDistance(distanceRef.current);
            setCalories(calcCalories(distanceRef.current));
            if (speed > 0) { setSpeedKmh(speed * 3.6); setCurrentPace(60 / (speed * 3.6)); }
            if (elapsedRef.current > 0) setAvgPace(elapsedRef.current / 60 / distanceRef.current);
            const km = Math.floor(distanceRef.current);
            if (km > lastKmRef.current) {
              lastKmRef.current = km;
              Speech.speak(`ק"מ ${km}. קצב ${formatPace(elapsedRef.current / 60 / distanceRef.current)}.`, { language: 'he-IL', rate: 1.1 });
              if (Platform.OS !== 'web') Vibration.vibrate([100, 100, 100]);
            }
            if ((runType === 'test2k' && distanceRef.current >= 2) ||
                (runType === 'test3k' && distanceRef.current >= 3)) finishRun();
          }
        }
        coordsRef.current = [...coordsRef.current, { latitude, longitude }];
      }
    );
  };

  const pauseRun = () => { clearInterval(timerRef.current); locationRef.current?.remove(); setPhase(PHASE.PAUSED); };

  const resumeRun = async () => {
    setPhase(PHASE.ACTIVE);
    timerRef.current = setInterval(() => { elapsedRef.current += 1; setElapsed(elapsedRef.current); }, 1000);
    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 5 },
      (loc) => { const { speed } = loc.coords; if (speed > 0) { setSpeedKmh(speed * 3.6); setCurrentPace(60 / (speed * 3.6)); } }
    );
  };

  const finishRun = useCallback(async () => {
    clearInterval(timerRef.current); locationRef.current?.remove();
    const run = {
      id: Date.now().toString(), date: new Date().toISOString(),
      distanceKm: Math.round(distanceRef.current * 100) / 100,
      durationSec: elapsedRef.current,
      avgPaceMinKm: distanceRef.current > 0 ? elapsedRef.current / 60 / distanceRef.current : 0,
      calories: calcCalories(distanceRef.current), coords: coordsRef.current, withLoad, runType,
    };
    await saveRun(run);
    Speech.speak(`ריצה הסתיימה! ${run.distanceKm} ק"מ. כל הכבוד!`, { language: 'he-IL', rate: 1.1 });
    setPhase(PHASE.DONE);
  }, [withLoad, runType]);

  useEffect(() => () => { clearInterval(timerRef.current); locationRef.current?.remove(); }, []);

  // ─── SETUP ──────────────────────────────────────────────────────────────────
  if (phase === PHASE.SETUP) {
    const types = [
      { id: 'free', icon: '🏃', label: 'ריצה חופשית', desc: 'ללא יעד מוגדר' },
      { id: 'test2k', icon: '⏱️', label: 'מבחן 2 ק"מ', desc: 'מדידת זמן סיום' },
      { id: 'test3k', icon: '⏱️', label: 'מבחן 3 ק"מ', desc: 'מדידת זמן סיום' },
      { id: 'pace', icon: '🎯', label: 'Pace Coach', desc: 'הנחיה לפי יעד זמן' },
      { id: 'intervals', icon: '⚡', label: 'אינטרוולים', desc: 'ספרינטים + מנוחה' },
    ];
    return (
      <CamoBg style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.setupContent, { paddingTop: insets.top + 20, paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.setupHeader}>
            <Text style={styles.setupTitle}>🏁 הגדרת ריצה</Text>
            <Text style={styles.setupSub}>בחר סוג ריצה וצא לדרך</Text>
          </View>
          <Text style={styles.sectionLabel}>סוג ריצה</Text>
          {types.map(t => (
            <TouchableOpacity key={t.id} style={[styles.typeCard, runType === t.id && styles.typeCardActive]} onPress={() => setRunType(t.id)} activeOpacity={0.8}>
              <Text style={styles.typeCardIcon}>{t.icon}</Text>
              <View style={styles.typeCardText}>
                <Text style={[styles.typeCardLabel, runType === t.id && { color: colors.primary }]}>{t.label}</Text>
                <Text style={styles.typeCardDesc}>{t.desc}</Text>
              </View>
              <View style={[styles.typeCardCheck, runType === t.id && styles.typeCardCheckActive]}>
                {runType === t.id && <Text style={styles.typeCardCheckMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
          {runType === 'pace' && (
            <View style={styles.paceBox}>
              <Text style={styles.sectionLabel}>יעד Pace Coach</Text>
              <View style={styles.stepperRow}>
                <View style={styles.stepperGroup}>
                  <Text style={styles.stepperLabel}>מרחק (ק"מ)</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setTargetKm(k => Math.max(1, k - 0.5))}><Text style={styles.stepBtnTxt}>−</Text></TouchableOpacity>
                    <Text style={styles.stepVal}>{targetKm}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setTargetKm(k => k + 0.5)}><Text style={styles.stepBtnTxt}>+</Text></TouchableOpacity>
                  </View>
                </View>
                <View style={styles.stepperGroup}>
                  <Text style={styles.stepperLabel}>זמן יעד (דק')</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setTargetMin(m => Math.max(1, m - 1))}><Text style={styles.stepBtnTxt}>−</Text></TouchableOpacity>
                    <Text style={styles.stepVal}>{targetMin}</Text>
                    <TouchableOpacity style={styles.stepBtn} onPress={() => setTargetMin(m => m + 1)}><Text style={styles.stepBtnTxt}>+</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
              <Text style={styles.paceTarget}>קצב יעד: {formatPace(targetMin / targetKm)} לק"מ</Text>
            </View>
          )}
          <Text style={styles.sectionLabel}>ציוד</Text>
          <TouchableOpacity style={[styles.typeCard, withLoad && styles.typeCardActive]} onPress={() => setWithLoad(!withLoad)} activeOpacity={0.8}>
            <Text style={styles.typeCardIcon}>🎒</Text>
            <View style={styles.typeCardText}>
              <Text style={[styles.typeCardLabel, withLoad && { color: colors.primary }]}>ריצה עם עומס</Text>
              <Text style={styles.typeCardDesc}>כומתה, אפוד, ציוד מלא</Text>
            </View>
            <View style={[styles.typeCardCheck, withLoad && styles.typeCardCheckActive]}>
              {withLoad && <Text style={styles.typeCardCheckMark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.startBtn} onPress={startRun} activeOpacity={0.85}>
            <Text style={styles.startBtnTxt}>🏁  התחל ריצה</Text>
          </TouchableOpacity>
        </ScrollView>
      </CamoBg>
    );
  }

  // ─── ACTIVE / PAUSED ────────────────────────────────────────────────────────
  if (phase === PHASE.ACTIVE || phase === PHASE.PAUSED) {
    return (
      <CamoBg style={{ flex: 1 }}>
        <View style={[styles.activeWrap, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.activeTopBar}>
            <View style={[styles.liveBadge, phase === PHASE.PAUSED && styles.pausedBadge]}>
              <Text style={styles.liveBadgeTxt}>{phase === PHASE.PAUSED ? '⏸ מושהה' : '● LIVE'}</Text>
            </View>
            <Text style={styles.runTypeLabel}>{runType === 'test2k' ? 'מבחן 2 ק"מ' : runType === 'test3k' ? 'מבחן 3 ק"מ' : runType === 'pace' ? '🎯 Pace Coach' : '🏃 חופשית'}</Text>
          </View>

          <View style={styles.mainTimeWrap}>
            <Text style={styles.mainTimeLabel}>זמן</Text>
            <Text style={styles.mainTime}>{formatTime(elapsed)}</Text>
          </View>

          <View style={styles.bigStatsRow}>
            <View style={styles.bigStat}>
              <Text style={styles.bigStatValue}>{distance.toFixed(2)}</Text>
              <Text style={styles.bigStatUnit}>ק"מ</Text>
              <Text style={styles.bigStatLabel}>מרחק</Text>
            </View>
            <View style={styles.bigStatDivider} />
            <View style={styles.bigStat}>
              <Text style={styles.bigStatValue}>{formatPace(avgPace)}</Text>
              <Text style={styles.bigStatUnit}>/ק"מ</Text>
              <Text style={styles.bigStatLabel}>קצב ממוצע</Text>
            </View>
          </View>

          <View style={styles.smallGrid}>
            {[
              { icon: '⚡', val: `${Math.round(speedKmh * 10) / 10}`, unit: 'קמ"ש' },
              { icon: '🔥', val: `${calories}`, unit: "קל'" },
              { icon: '📍', val: formatPace(currentPace), unit: 'קצב נוכחי' },
              { icon: '📏', val: `${Math.round(distance * 1000)}`, unit: 'מטרים' },
            ].map((s, i) => (
              <View key={i} style={styles.smallStat}>
                <Text style={styles.smallStatIcon}>{s.icon}</Text>
                <Text style={styles.smallStatVal}>{s.val}</Text>
                <Text style={styles.smallStatUnit}>{s.unit}</Text>
              </View>
            ))}
          </View>

          {(runType === 'test2k' || runType === 'test3k') && (
            <View style={styles.testProgress}>
              <View style={styles.testTrack}>
                <View style={[styles.testFill, { width: `${Math.min((distance / (runType === 'test2k' ? 2 : 3)) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.testTxt}>{distance.toFixed(2)} / {runType === 'test2k' ? '2.00' : '3.00'} ק"מ</Text>
            </View>
          )}

          <View style={styles.controlsRow}>
            {phase === PHASE.ACTIVE ? (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, styles.pauseBtn]} onPress={pauseRun}>
                  <Text style={styles.ctrlIcon}>⏸</Text>
                  <Text style={styles.ctrlLabel}>הפסקה</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, styles.stopBtn]} onPress={finishRun}>
                  <Text style={styles.ctrlIcon}>⏹</Text>
                  <Text style={styles.ctrlLabel}>סיים</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={[styles.ctrlBtn, styles.resumeBtn]} onPress={resumeRun}>
                  <Text style={styles.ctrlIcon}>▶</Text>
                  <Text style={styles.ctrlLabel}>המשך</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.ctrlBtn, styles.stopBtn]} onPress={finishRun}>
                  <Text style={styles.ctrlIcon}>⏹</Text>
                  <Text style={styles.ctrlLabel}>סיים</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </CamoBg>
    );
  }

  // ─── DONE ────────────────────────────────────────────────────────────────────
  return (
    <CamoBg style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[styles.doneContent, { paddingTop: insets.top + 32, paddingBottom: 60 }]}>
        <Text style={styles.doneMedal}>🏅</Text>
        <Text style={styles.doneTitle}>ריצה הושלמה!</Text>
        <Text style={styles.doneDateTxt}>{new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        <View style={styles.doneGrid}>
          {[
            { icon: '📏', val: distance.toFixed(2), unit: 'ק"מ', label: 'מרחק', color: colors.primary },
            { icon: '⏱️', val: formatTime(elapsed), unit: '', label: 'זמן', color: colors.info },
            { icon: '⚡', val: formatPace(avgPace), unit: '/ק"מ', label: 'קצב ממוצע', color: colors.warning },
            { icon: '🔥', val: `${calories}`, unit: "קל'", label: 'קלוריות', color: colors.danger },
          ].map((c, i) => (
            <View key={i} style={[styles.doneCard, { borderTopColor: c.color }]}>
              <Text style={styles.doneCardIcon}>{c.icon}</Text>
              <Text style={[styles.doneCardVal, { color: c.color }]}>{c.val}<Text style={styles.doneCardUnit}> {c.unit}</Text></Text>
              <Text style={styles.doneCardLabel}>{c.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.newRunBtn} onPress={() => setPhase(PHASE.SETUP)}>
          <Text style={styles.newRunTxt}>🏃 ריצה חדשה</Text>
        </TouchableOpacity>
      </ScrollView>
    </CamoBg>
  );
}

const styles = StyleSheet.create({
  setupContent: { paddingHorizontal: 20 },
  setupHeader: { marginBottom: 24 },
  setupTitle: { fontSize: 26, fontWeight: String(fonts.black), color: colors.textPrimary, textAlign: 'right' },
  setupSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },
  sectionLabel: { fontSize: 11, fontWeight: String(fonts.bold), color: colors.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'right', marginBottom: 10, marginTop: 20 },
  typeCard: { backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 16, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  typeCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '12' },
  typeCardIcon: { fontSize: 24 },
  typeCardText: { flex: 1 },
  typeCardLabel: { fontSize: 15, fontWeight: String(fonts.bold), color: colors.textPrimary, textAlign: 'right' },
  typeCardDesc: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  typeCardCheck: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  typeCardCheckActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeCardCheckMark: { color: colors.white, fontSize: 12, fontWeight: String(fonts.black) },
  paceBox: { backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.border },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  stepperGroup: { alignItems: 'center' },
  stepperLabel: { fontSize: 12, color: colors.textMuted, fontWeight: String(fonts.semibold), marginBottom: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  stepBtnTxt: { fontSize: 20, color: colors.primary, fontWeight: String(fonts.bold) },
  stepVal: { fontSize: 26, fontWeight: String(fonts.black), color: colors.textPrimary, minWidth: 36, textAlign: 'center' },
  paceTarget: { textAlign: 'center', fontSize: 14, fontWeight: String(fonts.bold), color: colors.primary },
  startBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 20, alignItems: 'center', marginTop: 28, shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  startBtnTxt: { color: colors.white, fontSize: 18, fontWeight: String(fonts.black) },

  activeWrap: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  activeTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveBadge: { backgroundColor: colors.danger, borderRadius: radius.full, paddingVertical: 4, paddingHorizontal: 12 },
  pausedBadge: { backgroundColor: colors.warning },
  liveBadgeTxt: { color: colors.white, fontSize: 12, fontWeight: String(fonts.black) },
  runTypeLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: String(fonts.semibold) },
  mainTimeWrap: { alignItems: 'center' },
  mainTimeLabel: { fontSize: 11, fontWeight: String(fonts.bold), color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase' },
  mainTime: { fontSize: 68, fontWeight: String(fonts.black), color: colors.primary, letterSpacing: -2, lineHeight: 76 },
  bigStatsRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18, justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  bigStat: { alignItems: 'center' },
  bigStatValue: { fontSize: 34, fontWeight: String(fonts.black), color: colors.primary },
  bigStatUnit: { fontSize: 12, color: colors.textMuted },
  bigStatLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: String(fonts.semibold), marginTop: 2 },
  bigStatDivider: { width: 1, height: 55, backgroundColor: colors.border },
  smallGrid: { flexDirection: 'row', gap: 8 },
  smallStat: { flex: 1, backgroundColor: colors.bgCard, borderRadius: radius.lg, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  smallStatIcon: { fontSize: 16, marginBottom: 2 },
  smallStatVal: { fontSize: 15, fontWeight: String(fonts.black), color: colors.textPrimary },
  smallStatUnit: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },
  testProgress: { gap: 6 },
  testTrack: { height: 10, backgroundColor: colors.surface, borderRadius: 5, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  testFill: { height: 10, backgroundColor: colors.primary, borderRadius: 5 },
  testTxt: { textAlign: 'center', fontSize: 12, color: colors.textMuted, fontWeight: String(fonts.semibold) },
  controlsRow: { flexDirection: 'row', gap: 12 },
  ctrlBtn: { flex: 1, borderRadius: radius.xl, paddingVertical: 16, alignItems: 'center', gap: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 },
  pauseBtn: { backgroundColor: colors.accent, shadowColor: colors.accent },
  resumeBtn: { backgroundColor: colors.primary, shadowColor: colors.primary },
  stopBtn: { flex: 0.7, backgroundColor: colors.danger, shadowColor: colors.danger },
  ctrlIcon: { fontSize: 24, color: colors.white },
  ctrlLabel: { fontSize: 11, color: colors.white, fontWeight: String(fonts.bold) },

  doneContent: { paddingHorizontal: 24, alignItems: 'center' },
  doneMedal: { fontSize: 72, marginBottom: 8 },
  doneTitle: { fontSize: 26, fontWeight: String(fonts.black), color: colors.textPrimary, marginBottom: 4 },
  doneDateTxt: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  doneGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, width: '100%', marginBottom: 24 },
  doneCard: { width: (width - 60) / 2, backgroundColor: colors.bgCard, borderRadius: radius.xl, padding: 18, alignItems: 'center', borderTopWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  doneCardIcon: { fontSize: 26, marginBottom: 6 },
  doneCardVal: { fontSize: 20, fontWeight: String(fonts.black) },
  doneCardUnit: { fontSize: 12, fontWeight: String(fonts.medium) },
  doneCardLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  newRunBtn: { backgroundColor: colors.primary, borderRadius: radius.xl, paddingVertical: 18, paddingHorizontal: 40, alignItems: 'center', width: '100%', shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  newRunTxt: { color: colors.white, fontSize: 17, fontWeight: String(fonts.black) },
});
