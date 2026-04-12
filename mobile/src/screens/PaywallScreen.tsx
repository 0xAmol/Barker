import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper, Button } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing, borderRadius } from '../constants/theme';

const ONBOARDING_COMPLETE_KEY = '@barker_onboarding_complete';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const FEATURES = [
  { icon: '✓', text: '5 free leads — real people who want a quote' },
  { icon: '✓', text: 'Your auto-generated quote page (live now)' },
  { icon: '✓', text: '24/7 monitoring of 5 local Facebook groups' },
  { icon: '✓', text: 'AI replies written in your voice' },
  { icon: '✓', text: 'SMS notifications the moment someone submits' },
];

const PRICING = [
  { service: 'Plumbing', price: '$15' },
  { service: 'HVAC', price: '$20' },
  { service: 'Cleaning', price: '$8' },
  { service: 'Electrical', price: '$15' },
];

export function PaywallScreen({ navigation }: Props) {
  const { state } = useOnboarding();
  const [showPricing, setShowPricing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStartTrial = async () => {
    setLoading(true);

    // Simulate API call to create account and start trial
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Save onboarding completion status
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (e) {
      // Handle save error silently
    }

    setLoading(false);

    // Show welcome message and navigate to main app
    Alert.alert(
      'Welcome to Barker!',
      'Your agent is now active and monitoring for leads. You\'ll get a text when someone wants a quote.',
      [
        {
          text: 'Got it!',
          onPress: () => {
            // Navigate to main app with reset to prevent going back
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper
      step={11}
      footer={
        <View>
          <Button
            title="Start My Free Trial →"
            onPress={handleStartTrial}
            loading={loading}
          />
          <TouchableOpacity
            style={styles.pricingToggle}
            onPress={() => setShowPricing(!showPricing)}
          >
            <Text style={styles.pricingToggleText}>
              {showPricing ? 'Hide pricing details' : 'How does pricing work?'}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <Text style={styles.headline}>Your first 5 leads are free</Text>
      <Text style={styles.subheadline}>
        See if Barker works for you. No card required to start.
      </Text>

      {/* Features List */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>What's included:</Text>
        {FEATURES.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      {/* Pricing Info */}
      <View style={styles.pricingSection}>
        <Text style={styles.pricingTitle}>After your trial</Text>
        <Text style={styles.pricingDescription}>
          Pay per lead: <Text style={styles.pricingHighlight}>$8–30</Text> depending
          on service type
        </Text>

        {showPricing && (
          <View style={styles.pricingGrid}>
            {PRICING.map((item, index) => (
              <View key={index} style={styles.pricingItem}>
                <Text style={styles.pricingService}>{item.service}</Text>
                <Text style={styles.pricingPrice}>{item.price}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.noCatch}>
          <Text style={styles.noCatchText}>
            No subscriptions. No contracts. Pause anytime.
          </Text>
        </View>
      </View>

      {/* Testimonial */}
      <View style={styles.testimonialCard}>
        <Text style={styles.testimonialStars}>★★★★★</Text>
        <Text style={styles.testimonialQuote}>
          "I closed $2,400 in jobs from my first 5 free leads. Barker paid for
          itself before I paid a cent."
        </Text>
        <Text style={styles.testimonialAuthor}>
          — Mike D., Electrician, Phoenix
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 30,
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
  featuresCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 14,
    color: colors.success,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  pricingSection: {
    marginBottom: spacing.lg,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pricingDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  pricingHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  pricingItem: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricingService: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  pricingPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  noCatch: {
    marginTop: spacing.md,
  },
  noCatchText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  testimonialCard: {
    backgroundColor: colors.accentSubtle,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentDark,
  },
  testimonialStars: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  testimonialQuote: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  testimonialAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  pricingToggle: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  pricingToggleText: {
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
