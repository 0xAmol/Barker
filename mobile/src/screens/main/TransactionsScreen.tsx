import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { MOCK_CREDIT_TRANSACTIONS, CreditTransaction } from '../../data/mockData';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

function formatTimeAgo(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TransactionRow({ transaction }: { transaction: CreditTransaction }) {
  const isCharge = transaction.type === 'lead_charge';
  const amountColor = isCharge ? colors.textPrimary : colors.success;
  const amountPrefix = isCharge ? '-' : '+';

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, isCharge ? styles.chargeIcon : styles.topUpIcon]}>
          <Text style={styles.transactionIconText}>{isCharge ? '→' : '+'}</Text>
        </View>
        <View style={styles.transactionDetails}>
          {isCharge ? (
            <>
              <Text style={styles.transactionTitle}>
                Lead: {transaction.leadName}
              </Text>
              <Text style={styles.transactionSubtitle}>{transaction.service}</Text>
            </>
          ) : (
            <>
              <Text style={styles.transactionTitle}>Top up</Text>
              <Text style={styles.transactionSubtitle}>Credits added</Text>
            </>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {amountPrefix}${Math.abs(transaction.amount)}
        </Text>
        <Text style={styles.transactionTime}>{formatTimeAgo(transaction.timestamp)}</Text>
      </View>
    </View>
  );
}

export function TransactionsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>Lead charges and top-ups</Text>
      </View>

      {/* Transactions List */}
      <FlatList
        data={MOCK_CREDIT_TRANSACTIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubtext}>
              Your lead charges and top-ups will appear here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginLeft: -spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 32,
    color: colors.accent,
    fontWeight: '300',
  },
  title: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  chargeIcon: {
    backgroundColor: colors.accentDim,
  },
  topUpIcon: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  transactionIconText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: fontSize.body,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: fontSize.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
  },
  separator: {
    height: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.section * 2,
  },
  emptyText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
