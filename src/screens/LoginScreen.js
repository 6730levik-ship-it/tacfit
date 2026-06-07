import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, fonts } from '../theme';

// Google Sign-In — works on native; web uses a different flow
let GoogleSignin;
if (Platform.OS !== 'web') {
  try { GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin; } catch {}
}

export default function LoginScreen({ onLogin }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'web' || !GoogleSignin) {
        // Web demo: simulate login
        await new Promise(r => setTimeout(r, 1000));
        onLogin({
          uid: 'demo-user',
          name: 'לוחם TacFit',
          email: 'demo@tacfit.app',
          photoURL: null,
          isDemo: true,
        });
      } else {
        await GoogleSignin.hasPlayServices();
        const { user } = await GoogleSignin.signIn();
        onLogin({ uid: user.id, name: user.name, email: user.email, photoURL: user.photo });
      }
    } catch (e) {
      Alert.alert('שגיאה', 'הכניסה נכשלה. נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 32 }]}>
      {/* Background pattern */}
      <View style={styles.bgPattern}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.bgLine, { top: i * 80, opacity: 0.04 + i * 0.01 }]} />
        ))}
      </View>

      {/* Logo + Title */}
      <View style={styles.hero}>
        <View style={styles.logoWrap}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.appName}>TacFit</Text>
        <Text style={styles.tagline}>כושר מקצועי לחיילים</Text>

        <View style={styles.badgeRow}>
          <Badge text="תוכניות ABC" />
          <Badge text="GPS ריצה" />
          <Badge text="תזונה" />
        </View>
      </View>

      {/* Features list */}
      <View style={styles.features}>
        <Feature icon="🏋️" text="תוכניות משקולות וקליסטניקס מקצועיות" />
        <Feature icon="🏃" text="מעקב ריצה GPS עם Pace Coach" />
        <Feature icon="🥗" text="תפריטי תזונה מותאמים לחייל" />
        <Feature icon="☁️" text="סנכרון ענן — הנתונים שלך בכל מכשיר" />
      </View>

      {/* CTA */}
      <View style={styles.bottom}>
        <Text style={styles.trial}>7 ימי ניסיון חינם • ללא כרטיס אשראי</Text>

        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.btnDisabled]}
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.black} />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleTxt}>המשך עם Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.terms}>
          בהמשך אתה מסכים ל<Text style={styles.link}>תנאי השימוש</Text> ו<Text style={styles.link}>מדיניות הפרטיות</Text>
        </Text>
      </View>
    </View>
  );
}

function Badge({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeTxt}>{text}</Text>
    </View>
  );
}

function Feature({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTxt}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  bgPattern: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  bgLine: {
    position: 'absolute', left: -50, right: -50, height: 1,
    backgroundColor: colors.accent, transform: [{ rotate: '-12deg' }],
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoWrap: {
    width: 80, height: 80, borderRadius: radius.xl,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.accent, marginBottom: 8,
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 42, fontWeight: String(fonts.black), color: colors.textPrimary, letterSpacing: 2 },
  tagline: { fontSize: 16, color: colors.accent, fontWeight: String(fonts.semibold), letterSpacing: 1 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    backgroundColor: colors.surface, borderRadius: radius.full,
    paddingVertical: 4, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border,
  },
  badgeTxt: { color: colors.textSecondary, fontSize: 12, fontWeight: String(fonts.medium) },
  features: { gap: 14, marginBottom: 32 },
  featureRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 22, width: 32, textAlign: 'center' },
  featureTxt: { flex: 1, color: colors.textSecondary, fontSize: 14, fontWeight: String(fonts.medium), textAlign: 'right' },
  bottom: { gap: 12 },
  trial: { textAlign: 'center', color: colors.success, fontSize: 13, fontWeight: String(fonts.semibold) },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white, borderRadius: radius.lg,
    paddingVertical: 16, gap: 12,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  googleIcon: { fontSize: 20, fontWeight: String(fonts.black), color: '#4285F4' },
  googleTxt: { fontSize: 16, fontWeight: String(fonts.bold), color: colors.black },
  terms: { textAlign: 'center', color: colors.textMuted, fontSize: 11, lineHeight: 18 },
  link: { color: colors.accent, textDecorationLine: 'underline' },
});
