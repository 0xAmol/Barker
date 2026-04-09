import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, SelectableOption } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { PAIN_POINT_OPTIONS, PainPoint } from '../types';
import { colors, spacing } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function PainPointsScreen({ navigation }: Props) {
  const { state, togglePainPoint } = useOnboarding();

  const handleToggle = (point: PainPoint) => {
    togglePainPoint(point);
  };

  const handleContinue = () => {
    navigation.navigate('SocialProof');
  };

  return (
    <ScreenWrapper
      step={3}
      footer={<Button title="Continue" onPress={handleContinue} />}
    >
      <Text style={styles.headline}>What's getting in your way?</Text>
      <Text style={styles.subheadline}>Select all that apply.</Text>

      <View style={styles.options}>
        {PAIN_POINT_OPTIONS.map((option) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            selected={state.painPoints.includes(option.id)}
            onPress={() => handleToggle(option.id)}
            multiSelect
          />
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  subheadline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  options: {
    marginTop: spacing.sm,
  },
});
