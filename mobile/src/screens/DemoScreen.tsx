import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
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

// Mock search results based on business name
interface SearchResult {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
}

const generateMockResults = (businessName: string, city: string): SearchResult[] => {
  const baseName = businessName.trim() || 'Johnson';
  return [
    {
      id: '1',
      name: `${baseName} Roofing`,
      rating: 4.8,
      reviewCount: 142,
      location: city || 'Katy TX',
      verified: true,
    },
    {
      id: '2',
      name: `${baseName} & Sons Roofing`,
      rating: 3.2,
      reviewCount: 8,
      location: 'Dallas TX',
      verified: false,
    },
    {
      id: 'manual',
      name: "None of these — I'll enter my info manually",
      rating: 0,
      reviewCount: 0,
      location: '',
      verified: false,
    },
  ];
};

// Mock analysis result for selected business
const generateMockAnalysis = (result: SearchResult, serviceType: string | null): BusinessAnalysis => ({
  businessName: result.name,
  services: [
    'Roof repair',
    'Roof replacement',
    'Leak detection',
    'Gutter installation',
    'Storm damage repair',
  ],
  serviceArea: [result.location.split(' ')[0], 'Sugar Land', 'Houston'],
  brandVoice:
    'Friendly and professional. Emphasizes quality workmanship and honest pricing. Customers mention "reliable" and "great communication."',
  reviews: [
    {
      text: 'Fixed our roof leak in one visit. Professional crew, cleaned up everything.',
      author: 'Sarah M.',
      rating: 5,
    },
    {
      text: 'Best price we got and the quality was excellent. Highly recommend!',
      author: 'Mike R.',
      rating: 5,
    },
  ],
  facebookGroups: [
    { name: `${result.location.split(' ')[0]} Community`, members: '45K' },
    { name: 'Houston Home Owners', members: '128K' },
    { name: 'Sugar Land Recommendations', members: '32K' },
    { name: 'West Houston Neighbors', members: '67K' },
    { name: `${result.location.split(' ')[0]} Area Buy/Sell/Trade`, members: '89K' },
  ],
  quotePageUrl: `barker.app/q/${result.name.toLowerCase().replace(/\s+/g, '-')}`,
  sampleReply:
    `Hey! I'm Dave with ${result.name} — we do a lot of work in this area. Happy to come out for a free estimate. Here's our page: [link]`,
});

type Stage = 'input' | 'searching' | 'results' | 'manual' | 'analyzing' | 'analysis';

export function DemoScreen({ navigation }: Props) {
  const { state, setBusinessAnalysis } = useOnboarding();
  const [stage, setStage] = useState<Stage>('input');
  const [businessName, setBusinessName] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);

  // Manual form state
  const [manualName, setManualName] = useState('');
  const [manualServices, setManualServices] = useState('');
  const [manualDifferentiator, setManualDifferentiator] = useState('');

  const userCity = state.locations[0] || 'Katy TX';

  const handleSearch = async () => {
    if (!businessName.trim()) return;

    setStage('searching');

    // Simulate search API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const results = generateMockResults(businessName, userCity);
    setSearchResults(results);
    setStage('results');
  };

  const handleSelectResult = async (result: SearchResult) => {
    if (result.id === 'manual') {
      setManualName(businessName);
      setStage('manual');
      return;
    }

    setSelectedResult(result);
    setStage('analyzing');

    // Simulate analysis API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analysisResult = generateMockAnalysis(result, state.serviceType);
    setAnalysis(analysisResult);
    setBusinessAnalysis(analysisResult);
    setStage('analysis');
  };

  const handleManualSubmit = async () => {
    if (!manualName.trim()) return;

    setStage('analyzing');

    // Simulate analysis API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const manualResult: SearchResult = {
      id: 'manual-entry',
      name: manualName,
      rating: 0,
      reviewCount: 0,
      location: userCity,
      verified: false,
    };

    const analysisResult: BusinessAnalysis = {
      businessName: manualName,
      services: manualServices.split(',').map(s => s.trim()).filter(Boolean),
      serviceArea: state.locations.length > 0 ? state.locations : [userCity],
      brandVoice: manualDifferentiator || 'Professional and reliable service.',
      reviews: [],
      facebookGroups: [
        { name: `${userCity.split(' ')[0]} Community`, members: '45K' },
        { name: 'Houston Home Owners', members: '128K' },
        { name: 'Local Recommendations', members: '32K' },
      ],
      quotePageUrl: `barker.app/q/${manualName.toLowerCase().replace(/\s+/g, '-')}`,
      sampleReply: `Hey! I'm Dave with ${manualName} — we do a lot of work in the area. Happy to come out for a free estimate. Here's our page: [link]`,
    };

    setAnalysis(analysisResult);
    setBusinessAnalysis(analysisResult);
    setStage('analysis');
  };

  const handleContinue = () => {
    navigation.navigate('ValueDelivery');
  };

  // Searching stage
  if (stage === 'searching') {
    return (
      <ScreenWrapper step={8} scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Searching for your business...</Text>
        </View>
      </ScreenWrapper>
    );
  }

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

  // Search results stage
  if (stage === 'results') {
    return (
      <ScreenWrapper step={8}>
        <Text style={styles.headline}>Is this your business?</Text>
        <Text style={styles.subheadline}>
          Select your business from the results below
        </Text>

        <View style={styles.resultsList}>
          {searchResults.map((result) => (
            <TouchableOpacity
              key={result.id}
              style={[
                styles.resultCard,
                result.id === 'manual' && styles.resultCardManual,
              ]}
              onPress={() => handleSelectResult(result)}
              activeOpacity={0.7}
            >
              {result.id !== 'manual' ? (
                <>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    {result.verified && (
                      <Text style={styles.verifiedBadge}>✓</Text>
                    )}
                  </View>
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultRating}>
                      {result.rating}★
                    </Text>
                    <Text style={styles.resultReviews}>
                      {result.reviewCount} reviews
                    </Text>
                    <Text style={styles.resultLocation}>
                      {result.location}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.manualText}>{result.name}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="← Search again"
          variant="ghost"
          onPress={() => setStage('input')}
          style={styles.backButton}
        />
      </ScreenWrapper>
    );
  }

  // Manual entry stage
  if (stage === 'manual') {
    return (
      <ScreenWrapper
        step={8}
        footer={
          <Button
            title="Continue →"
            onPress={handleManualSubmit}
            disabled={!manualName.trim()}
          />
        }
      >
        <Text style={styles.headline}>Tell us about your business</Text>
        <Text style={styles.subheadline}>
          We'll use this to set up your Barker agent
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Business name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Johnson Roofing"
            placeholderTextColor={colors.textTertiary}
            value={manualName}
            onChangeText={setManualName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Services you offer</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="e.g. Roof repair, Roof replacement, Gutter installation"
            placeholderTextColor={colors.textTertiary}
            value={manualServices}
            onChangeText={setManualServices}
            multiline
          />
          <Text style={styles.hint}>Separate with commas</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>What makes you different?</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="e.g. Same-day service, family-owned, 20 years experience"
            placeholderTextColor={colors.textTertiary}
            value={manualDifferentiator}
            onChangeText={setManualDifferentiator}
            multiline
          />
          <Text style={styles.hint}>This helps Barker write replies in your voice</Text>
        </View>

        <Button
          title="← Back to search"
          variant="ghost"
          onPress={() => setStage('input')}
          style={styles.backButton}
        />
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
          onPress={handleSearch}
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
  resultsList: {
    gap: 10,
  },
  resultCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  resultCardManual: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  resultName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultRating: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
  },
  resultReviews: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  resultLocation: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  manualText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
