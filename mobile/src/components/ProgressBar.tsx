import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, TOTAL_STEPS } from '../constants/theme';

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = (currentStep / TOTAL_STEPS) * 100;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 3,
    backgroundColor: colors.separator,
    width: '100%',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
});
