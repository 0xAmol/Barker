import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { MOCK_STATS } from '../../data/mockData';

interface StatCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  icon: string;
  color?: string;
  large?: boolean;
}

function StatCard({ label, value, subvalue, icon, color = colors.accent, large }: StatCardProps) {
  return (
    <View style={[styles.statCard, large && styles.statCardLarge]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subvalue && <Text style={styles.statSubvalue}>{subvalue}</Text>}
    </View>
  );
}

function formatTimeAgo(date?: Date): string {
  if (!date) return 'Never';
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function StatsScreen() {
  const stats = MOCK_STATS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Stats</Text>
          <Text style={styles.headerSubtitle}>Your Barker performance</Text>
        </View>

        {/* Agent Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View
                style={[
                  styles.statusDot,
                  stats.agentStatus === 'active' && styles.statusDotActive,
                  stats.agentStatus === 'paused' && styles.statusDotPaused,
                  stats.agentStatus === 'error' && styles.statusDotError,
                ]}
              />
              <Text style={styles.statusLabel}>
                {stats.agentStatus === 'active'
                  ? 'Barker is Active'
                  : stats.agentStatus === 'paused'
                    ? 'Barker is Paused'
                    : 'Barker Error'}
              </Text>
            </View>
            <Text style={styles.lastRun}>Last scan: {formatTimeAgo(stats.lastRunAt)}</Text>
          </View>
          <View style={styles.statusStats}>
            <View style={styles.statusStatItem}>
              <Text style={styles.statusStatValue}>{stats.postsScanned}</Text>
              <Text style={styles.statusStatLabel}>Posts scanned</Text>
            </View>
            <View style={styles.statusStatDivider} />
            <View style={styles.statusStatItem}>
              <Text style={styles.statusStatValue}>{stats.repliesPosted}</Text>
              <Text style={styles.statusStatLabel}>Replies posted</Text>
            </View>
            <View style={styles.statusStatDivider} />
            <View style={styles.statusStatItem}>
              <Text style={styles.statusStatValue}>{Math.round(stats.conversionRate * 100)}%</Text>
              <Text style={styles.statusStatLabel}>Conversion</Text>
            </View>
          </View>
        </View>

        {/* Main stats grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Leads"
              value={stats.leadsThisWeek}
              icon="🎯"
              color="#d4a843"
              large
            />
            <StatCard
              label="Revenue"
              value={`$${stats.revenueThisWeek.toLocaleString()}`}
              icon="💰"
              color="#2ECC71"
              large
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Leads"
              value={stats.leadsThisMonth}
              icon="📊"
              color="#3498DB"
            />
            <StatCard
              label="Revenue"
              value={`$${stats.revenueThisMonth.toLocaleString()}`}
              icon="📈"
              color="#2ECC71"
            />
          </View>
        </View>

        {/* Top source */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Lead Source</Text>
          <View style={styles.topSourceCard}>
            <Text style={styles.topSourceIcon}>🏆</Text>
            <View style={styles.topSourceInfo}>
              <Text style={styles.topSourceName}>{stats.topSource}</Text>
              <Text style={styles.topSourceSubtext}>Most leads from this group</Text>
            </View>
          </View>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <View style={styles.creditsCard}>
            <View style={styles.creditsInfo}>
              <Text style={styles.creditsValue}>{stats.creditsRemaining}</Text>
              <Text style={styles.creditsLabel}>leads remaining</Text>
            </View>
            <View style={styles.creditsBar}>
              <View
                style={[
                  styles.creditsBarFill,
                  { width: `${Math.min((stats.creditsRemaining / 50) * 100, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.creditsHint}>
              {stats.creditsRemaining < 10
                ? '⚠️ Running low! Add more credits to keep Barker running.'
                : `At current pace, credits will last ~${Math.round(stats.creditsRemaining / (stats.leadsThisWeek / 7))} days`}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusCard: {
    margin: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  statusDotActive: {
    backgroundColor: '#2ECC71',
  },
  statusDotPaused: {
    backgroundColor: '#F39C12',
  },
  statusDotError: {
    backgroundColor: '#E74C3C',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  lastRun: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  statusStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statusStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusStatDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statCardLarge: {
    paddingVertical: spacing.lg,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  statSubvalue: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  topSourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topSourceIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  topSourceInfo: {
    flex: 1,
  },
  topSourceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  topSourceSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  creditsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  creditsLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  creditsBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  creditsBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  creditsHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
