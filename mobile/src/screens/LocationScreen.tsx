import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, Chip } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// Suggested locations based on common Texas cities (demo data)
const SUGGESTED_LOCATIONS = [
  'Houston',
  'Katy',
  'Sugar Land',
  'The Woodlands',
  'Cypress',
  'Spring',
  'Pearland',
  'League City',
  'Missouri City',
  'Pasadena',
];

export function LocationScreen({ navigation }: Props) {
  const { state, addLocation, removeLocation } = useOnboarding();
  const [inputValue, setInputValue] = useState('');

  const handleAddLocation = () => {
    if (inputValue.trim()) {
      addLocation(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionPress = (location: string) => {
    if (state.locations.includes(location)) {
      removeLocation(location);
    } else {
      addLocation(location);
    }
  };

  const handleContinue = () => {
    navigation.navigate('Processing');
  };

  return (
    <ScreenWrapper
      step={6}
      footer={
        <Button
          title="Find my customers →"
          onPress={handleContinue}
          disabled={state.locations.length === 0}
        />
      }
    >
      <Text style={styles.headline}>Where do you work?</Text>
      <Text style={styles.subheadline}>
        Barker will find Facebook groups in your area.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your city or zip code"
          placeholderTextColor={colors.textMuted}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleAddLocation}
          returnKeyType="done"
        />
      </View>

      <Text style={styles.sectionLabel}>Tap to add areas you serve:</Text>
      <View style={styles.suggestions}>
        {SUGGESTED_LOCATIONS.map((location) => (
          <Chip
            key={location}
            label={location}
            selected={state.locations.includes(location)}
            onPress={() => handleSuggestionPress(location)}
          />
        ))}
      </View>

      {state.locations.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Selected areas:</Text>
          <View style={styles.selectedLocations}>
            {state.locations.map((location) => (
              <Chip
                key={location}
                label={location}
                selected
                removable
                onRemove={() => removeLocation(location)}
              />
            ))}
          </View>
        </>
      )}

      <Text style={styles.helperText}>
        You can always change this later.
      </Text>
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
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  selectedLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
