import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, SelectableOption } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { SERVICE_OPTIONS, ServiceType } from '../types';
import { colors, spacing } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function ServiceTypeScreen({ navigation }: Props) {
  const { state, setServiceType } = useOnboarding();

  const handleSelect = (type: ServiceType) => {
    setServiceType(type);
  };

  const handleContinue = () => {
    if (state.serviceType) {
      navigation.navigate('PainPoints');
    }
  };

  return (
    <ScreenWrapper
      step={2}
      footer={
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!state.serviceType}
        />
      }
    >
      <Text style={styles.headline}>What kind of work do you do?</Text>
      <Text style={styles.subheadline}>
        Pick your trade so Barker knows what to look for.
      </Text>

      <View style={styles.options}>
        {SERVICE_OPTIONS.map((option) => (
          <SelectableOption
            key={option.id}
            label={option.label}
            emoji={option.emoji}
            selected={state.serviceType === option.id}
            onPress={() => handleSelect(option.id)}
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
