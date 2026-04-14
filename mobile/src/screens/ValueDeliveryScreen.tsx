import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { colors, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function ValueDeliveryScreen({ navigation }: Props) {
  const { state } = useOnboarding();
  const analysis = state.businessAnalysis;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my business quote page: https://${analysis?.quotePageUrl || 'barker.app/q/my-business'}`,
        url: `https://${analysis?.quotePageUrl || 'barker.app/q/my-business'}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the link');
    }
  };

  const handleContinue = () => {
    navigation.navigate('AccountCreation');
  };

  const totalMembers = analysis?.facebookGroups.reduce((sum, group) => {
    const num = parseInt(group.members.replace('K', '000'));
    return sum + num;
  }, 0) || 361000;

  return (
    <ScreenWrapper
      step={9}
      footer={
        <Button title="Activate Barker →" onPress={handleContinue} />
      }
    >
      <Text style={styles.headline}>Your Barker agent is ready to sell</Text>

      {/* Quote Page Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Quote Page</Text>
        <View style={styles.previewCard}>
          <View style={styles.browserBar}>
            <View style={styles.browserDots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f57' }]} />
              <View style={[styles.dot, { backgroundColor: '#febc2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#28c840' }]} />
            </View>
            <View style={styles.urlBar}>
              <Text style={styles.urlText}>
                {analysis?.quotePageUrl || 'barker.app/q/your-business'}
              </Text>
            </View>
          </View>
          <View style={styles.previewContent}>
            <Text style={styles.previewBusiness}>
              {analysis?.businessName || 'Your Business'}
            </Text>
            <Text style={styles.previewTagline}>
              Get a free quote in minutes
            </Text>
            <View style={styles.previewButton}>
              <Text style={styles.previewButtonText}>Request Quote</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
          <Text style={styles.shareText}>Share your quote page</Text>
        </TouchableOpacity>
      </View>

      {/* Monitoring Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Barker Will Monitor</Text>
        <View style={styles.statsList}>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statText}>
              {analysis?.facebookGroups.length || 5} Facebook groups with{' '}
              {Math.round(totalMembers / 1000)}K total members
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statText}>Scanning every 15 minutes</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statIcon}>✓</Text>
            <Text style={styles.statText}>Replies written in your voice</Text>
          </View>
        </View>
      </View>

      {/* Sample Reply */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sample Reply Preview</Text>
        <View style={styles.replyContext}>
          <Text style={styles.replyContextText}>
            When someone posts "anyone know a good plumber in Katy?"
          </Text>
        </View>
        <View style={styles.replyCard}>
          <Text style={styles.replyLabel}>Barker will reply:</Text>
          <Text style={styles.replyText}>
            {analysis?.sampleReply ||
              "Hey! I'm Dave with Pro Roofing — hail damage is what we do. We can usually get out same day for a free estimate. Here's our page: [link]"}
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
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
  previewCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  browserBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  browserDots: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  urlBar: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  urlText: {
    fontSize: 11,
    color: colors.textTertiary,
  },
  previewContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  previewBusiness: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  previewTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  previewButton: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: borderRadius.sm,
  },
  previewButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.background,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  shareIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  shareText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '500',
  },
  statsList: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 14,
    color: colors.success,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  statText: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  replyContext: {
    backgroundColor: colors.accentDim,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  replyContextText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  replyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  replyText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
  },
});
