import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { MOCK_STATS } from '../../data/mockData';

export function StatsScreen() {
  const stats = MOCK_STATS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats</Text>
        </View>

        {/* Hero Stat */}
        <View style={styles.heroSection}>
          <Text style={styles.heroValue}>${stats.revenueThisMonth.toLocaleString()}</Text>
          <Text style={styles.heroLabel}>Revenue this month</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.leadsThisMonth}</Text>
            <Text style={styles.statLabel}>Leads</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.round(stats.conversionRate * 100)}%</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.repliesPosted}</Text>
            <Text style={styles.statLabel}>Replies</Text>
          </View>
        </View>

        {/* This Week */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>This Week</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Leads</Text>
              <Text style={styles.cardValue}>{stats.leadsThisWeek}</Text>
            </View>
            <View style={styles.cardSeparator} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Revenue</Text>
              <Text style={[styles.cardValue, styles.cardValueAccent]}>
                ${stats.revenueThisWeek.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Agent */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Agent</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot,
                  stats.agentStatus === 'active' && styles.statusDotActive,
                  stats.agentStatus === 'paused' && styles.statusDotPaused,
                ]} />
                <Text style={styles.statusText}>
                  {stats.agentStatus === 'active' ? 'Active' : 'Paused'}
                </Text>
              </View>
            </View>
            <View style={styles.cardSeparator} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Posts scanned</Text>
              <Text style={styles.cardValue}>{stats.postsScanned}</Text>
            </View>
            <View style={styles.cardSeparator} />
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Top source</Text>
              <Text style={styles.cardValue} numberOfLines={1}>{stats.topSource}</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Credits</Text>
          <View style={styles.card}>
            <View style={styles.creditsRow}>
              <Text style={styles.creditsValue}>{stats.creditsRemaining}</Text>
              <Text style={styles.creditsLabel}>remaining</Text>
            </View>
            <View style={styles.creditsBar}>
              <View
                style={[
                  styles.creditsBarFill,
                  { width: `${Math.min((stats.creditsRemaining / 50) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroSection: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.section,
    paddingBottom: spacing.section,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -2,
  },
  heroLabel: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  section: {
    marginTop: spacing.section,
    paddingHorizontal: spacing.screen,
  },
  sectionLabel: {
    fontSize: fontSize.footnote,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  cardSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  cardLabel: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  cardValue: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
  },
  cardValueAccent: {
    color: colors.accent,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusDotPaused: {
    backgroundColor: colors.warning,
  },
  statusText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  creditsValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  creditsLabel: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  creditsBar: {
    height: 4,
    backgroundColor: colors.separator,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  creditsBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
});
