import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { SERVICE_OPTIONS, PAIN_POINT_OPTIONS } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const SOLUTIONS = [
  {
    painId: 'no_time',
    pain: 'No time to market',
    solution:
      'Scans local Facebook groups 24/7 for people asking "anyone know a good [service]?"',
    icon: '🔍',
  },
  {
    painId: 'bad_leads',
    pain: 'Paid for leads that don\'t answer',
    solution:
      'You only pay when someone fills out a quote request — not for clicks or impressions',
    icon: '💰',
  },
  {
    painId: 'no_social_media',
    pain: "Don't know social media",
    solution:
      'Writes replies in your voice and posts them for you. You never touch Facebook.',
    icon: '✍️',
  },
  {
    painId: 'inconsistent',
    pain: 'Inconsistent work',
    solution:
      'Average user gets 12 qualified leads per month. Enough to fill your calendar.',
    icon: '📈',
  },
];

function SolutionItem({
  pain,
  solution,
  icon,
}: {
  pain: string;
  solution: string;
  icon: string;
}) {
  return (
    <View style={styles.solutionItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.solutionContent}>
        <Text style={styles.painText}>You said: {pain}</Text>
        <Text style={styles.solutionText}>
          <Text style={styles.barkerLabel}>Barker: </Text>
          {solution}
        </Text>
      </View>
    </View>
  );
}

export function SolutionScreen({ navigation }: Props) {
  const { state } = useOnboarding();

  // Get the service label
  const serviceLabel =
    SERVICE_OPTIONS.find((s) => s.id === state.serviceType)?.label || 'your service';

  return (
    <ScreenWrapper
      step={5}
      footer={
        <Button
          title="See it in action →"
          onPress={() => navigation.navigate('Location')}
        />
      }
    >
      <Text style={styles.headline}>Here's how Barker works for you</Text>

      <View style={styles.solutions}>
        {SOLUTIONS.map((item, index) => (
          <SolutionItem
            key={index}
            pain={item.pain}
            solution={item.solution.replace('[service]', serviceLabel.toLowerCase())}
            icon={item.icon}
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
    marginBottom: spacing.lg,
  },
  solutions: {
    gap: spacing.md,
  },
  solutionItem: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 22,
  },
  solutionContent: {
    flex: 1,
  },
  painText: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  solutionText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  barkerLabel: {
    fontWeight: '700',
    color: colors.accent,
  },
});
