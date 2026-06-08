import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Camo blob — irregular polygon via border-radius trick
function CamoBlob({ style }) {
  return <View style={[styles.blob, style]} />;
}

export default function CamoBg({ children, style }) {
  return (
    <View style={[styles.root, style]}>
      {/* Camo blobs — numeric borderRadius only (React Native Web compatible) */}
      <CamoBlob style={{ top: -30, left: -20, width: 180, height: 140, backgroundColor: colors.camo2, borderRadius: 70, opacity: 0.13, transform: [{ rotate: '-15deg' }] }} />
      <CamoBlob style={{ top: 60, right: -30, width: 140, height: 110, backgroundColor: colors.camo1, borderRadius: 55, opacity: 0.10, transform: [{ rotate: '20deg' }] }} />
      <CamoBlob style={{ top: 180, left: 40, width: 100, height: 80, backgroundColor: colors.camo3, borderRadius: 40, opacity: 0.08 }} />
      <CamoBlob style={{ top: 280, right: 20, width: 160, height: 120, backgroundColor: colors.camo2, borderRadius: 65, opacity: 0.12, transform: [{ rotate: '-8deg' }] }} />
      <CamoBlob style={{ top: 420, left: -10, width: 130, height: 100, backgroundColor: colors.camo1, borderRadius: 50, opacity: 0.09, transform: [{ rotate: '12deg' }] }} />
      <CamoBlob style={{ top: 520, right: 50, width: 90, height: 70, backgroundColor: colors.camo4, borderRadius: 35, opacity: 0.10 }} />
      <CamoBlob style={{ top: 620, left: 80, width: 150, height: 110, backgroundColor: colors.camo2, borderRadius: 60, opacity: 0.11, transform: [{ rotate: '-20deg' }] }} />
      <CamoBlob style={{ top: 750, right: -20, width: 120, height: 95, backgroundColor: colors.camo3, borderRadius: 48, opacity: 0.09, transform: [{ rotate: '5deg' }] }} />

      {/* Content on top */}
      <View style={StyleSheet.absoluteFill}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    position: 'relative',
  },
  blob: {
    position: 'absolute',
  },
});
