import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, Chip } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { BusinessAnalysis } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

const API_BASE = 'http://localhost:3001';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type Stage = 'input' | 'analyzing' | 'analysis' | 'error';

export function DemoScreen({ navigation }: Props) {
  const { state, setBusinessAnalysis } = useOnboarding();
  const [stage, setStage] = useState<Stage>('input');
  const [businessName, setBusinessName] = useState('');
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const userCity = state.locations[0] || 'Katy TX';

  const handleSubmit = async () => {
    if (!businessName.trim()) return;

    setStage('analyzing');
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/agent/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          location: userCity,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `Request failed (${response.status})`);
      }

      const data = await response.json();

      const analysisResult: BusinessAnalysis = {
        businessName: data.businessName ?? businessName.trim(),
        services: data.services ?? [],
        serviceArea: data.serviceArea ?? state.locations,
        brandVoice: data.brandVoice ?? '',
        reviews: data.reviews ?? [],
        facebookGroups: data.facebookGroups ?? [],
        quotePageUrl: data.quotePageUrl ?? '',
        sampleReply: data.sampleReply ?? '',
      };

      setAnalysis(analysisResult);
      setBusinessAnalysis(analysisResult);
      setStage('analysis');
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setStage('error');
    }
  };

  const handleContinue = () => {
    navigation.navigate('ValueDelivery');
  };

  // Analyzing stage
  if (stage === 'analyzing') {
    return (
      <ScreenWrapper step={8} scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Learning your business...</Text>
          <Text style={styles.loadingSubtext}>
            Reading reviews, services, and brand voice
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error stage
  if (stage === 'error') {
    return (
      <ScreenWrapper step={8} scrollable={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.loadingText}>Something went wrong</Text>
          <Text style={styles.loadingSubtext}>{errorMessage}</Text>
          <Button
            title="Try again"
            onPress={() => setStage('input')}
            style={styles.retryButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Analysis results stage
  if (stage === 'analysis' && analysis) {
    return (
      <ScreenWrapper
        step={8}
        footer={
          <View>
            <Button title="Looks good — continue →" onPress={handleContinue} />
            <Button
              title="Edit details"
              variant="ghost"
              onPress={() => setStage('input')}
              style={styles.editButton}
            />
          </View>
        }
      >
        <View style={styles.successHeader}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Barker learned your business</Text>
        </View>

        {/* Business Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>
          <Text style={styles.businessNameDisplay}>{analysis.businessName}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Detected</Text>
          <View style={styles.chipContainer}>
            {analysis.services.map((service) => (
              <Chip key={service} label={service} selected />
            ))}
          </View>
        </View>

        {/* Brand Voice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brand Voice</Text>
          <Text style={styles.brandVoice}>{analysis.brandVoice}</Text>
        </View>

        {/* Top Reviews */}
        {analysis.reviews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Reviews</Text>
            {analysis.reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
                <Text style={styles.reviewText}>"{review.text}"</Text>
                <Text style={styles.reviewAuthor}>— {review.author}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Facebook Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Facebook Groups Found</Text>
          {analysis.facebookGroups.map((group, index) => (
            <View key={index} style={styles.groupRow}>
              <Text style={styles.groupIcon}>📍</Text>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupMembers}>{group.members} members</Text>
            </View>
          ))}
        </View>
      </ScreenWrapper>
    );
  }

  // Input stage (default)
  return (
    <ScreenWrapper
      step={8}
      footer={
        <Button
          title="Find My Business"
          onPress={handleSubmit}
          disabled={!businessName.trim()}
        />
      }
    >
      <Text style={styles.headline}>What's your business called?</Text>
      <Text style={styles.subheadline}>
        We'll find your business and learn everything about it automatically.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.businessInput}
          placeholder="e.g. Johnson Roofing"
          placeholderTextColor={colors.textTertiary}
          value={businessName}
          onChangeText={setBusinessName}
          autoCapitalize="words"
          autoCorrect={false}
          autoFocus
        />
      </View>

      <View style={styles.locationHint}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>
          Searching in <Text style={styles.locationHighlight}>{userCity}</Text>
        </Text>
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
  },
  subheadline: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  businessInput: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  locationText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  locationHighlight: {
    color: colors.accent,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  loadingSubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  errorIcon: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.error,
    backgroundColor: colors.backgroundCard,
    width: 48,
    height: 48,
    borderRadius: 24,
    textAlign: 'center',
    lineHeight: 48,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  retryButton: {
    marginTop: spacing.lg,
    minWidth: 160,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    fontSize: 24,
    color: colors.success,
    marginRight: spacing.sm,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  businessNameDisplay: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  brandVoice: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  reviewCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewStars: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewAuthor: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  groupIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  groupName: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  groupMembers: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  editButton: {
    marginTop: spacing.sm,
  },
});
