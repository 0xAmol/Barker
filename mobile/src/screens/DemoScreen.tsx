import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button, Chip } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { BusinessAnalysis } from '../types';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

// Mock analysis result for demo
const MOCK_ANALYSIS: BusinessAnalysis = {
  businessName: 'Johnson Plumbing Co.',
  services: [
    'Drain cleaning',
    'Water heater repair',
    'Leak detection',
    'Toilet repair',
    'Faucet installation',
  ],
  serviceArea: ['Katy', 'Sugar Land', 'Houston'],
  brandVoice:
    'Friendly and professional. Emphasizes same-day service and transparent pricing. Customers mention "fast response" and "fair prices."',
  reviews: [
    {
      text: 'Dave came out same day and fixed our leak. Honest pricing, no surprises.',
      author: 'Sarah M.',
      rating: 5,
    },
    {
      text: 'Finally a plumber who shows up when they say they will!',
      author: 'Mike R.',
      rating: 5,
    },
  ],
  facebookGroups: [
    { name: 'Katy Texas Community', members: '45K' },
    { name: 'Houston Home Owners', members: '128K' },
    { name: 'Sugar Land Recommendations', members: '32K' },
    { name: 'West Houston Neighbors', members: '67K' },
    { name: 'Katy Area Buy/Sell/Trade', members: '89K' },
  ],
  quotePageUrl: 'barker.app/q/johnson-plumbing-co',
  sampleReply:
    'Hey! I\'d recommend Johnson Plumbing — they\'ve done work for a few folks in this group. Same-day service and they don\'t charge a call-out fee. Here\'s their quote page if you want a quick estimate: [link]',
};

type Stage = 'input' | 'analyzing' | 'results';

export function DemoScreen({ navigation }: Props) {
  const { setBusinessAnalysis } = useOnboarding();
  const [stage, setStage] = useState<Stage>('input');
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setStage('analyzing');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // In production, this would call the actual API
    setAnalysis(MOCK_ANALYSIS);
    setBusinessAnalysis(MOCK_ANALYSIS);
    setStage('results');
  };

  const handleContinue = () => {
    navigation.navigate('ValueDelivery');
  };

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

  if (stage === 'results' && analysis) {
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
          <Text style={styles.businessName}>{analysis.businessName}</Text>
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

  // Input stage
  return (
    <ScreenWrapper
      step={8}
      footer={
        <Button
          title="Analyze My Business"
          onPress={handleAnalyze}
          disabled={!url.trim()}
        />
      }
    >
      <Text style={styles.headline}>Let's set up your Barker agent</Text>
      <Text style={styles.subheadline}>
        Paste your Google Business link and Barker will learn everything about
        your business.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.urlInput}
          placeholder="https://maps.google.com/maps/place/..."
          placeholderTextColor={colors.textMuted}
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          multiline
        />
      </View>

      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>How to find it:</Text>
        <Text style={styles.helpText}>
          1. Search your business name on Google{'\n'}
          2. Click your business listing{'\n'}
          3. Copy the URL from your browser
        </Text>
      </View>

      {/* For demo purposes */}
      <Button
        title="Use demo business (for testing)"
        variant="ghost"
        onPress={() => {
          setUrl('https://maps.google.com/maps/place/Johnson+Plumbing');
        }}
        style={styles.demoButton}
      />
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
  urlInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpBox: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  demoButton: {
    marginTop: spacing.lg,
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
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
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
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  businessName: {
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
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.textMuted,
  },
  editButton: {
    marginTop: spacing.sm,
  },
});
