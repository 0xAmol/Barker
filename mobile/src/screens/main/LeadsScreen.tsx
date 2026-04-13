import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { Lead } from '../../types/activity';
import { MOCK_LEADS } from '../../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  new: colors.accent,
  contacted: colors.textSecondary,
  won: colors.success,
  lost: colors.error,
  no_answer: colors.textTertiary,
};

function formatTimeAgo(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

interface LeadCardProps {
  lead: Lead;
  onCall: () => void;
  onStatusChange: (status: Lead['status'], revenue?: number) => void;
}

function LeadCard({ lead, onCall, onStatusChange }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenue, setRevenue] = useState('');

  const handleWon = () => {
    setExpanded(false);
    setShowRevenueModal(true);
  };

  const handleSubmitRevenue = () => {
    onStatusChange('won', parseFloat(revenue) || 0);
    setShowRevenueModal(false);
    setRevenue('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.cardMain}>
          <View style={styles.cardContent}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={styles.leadService}>{lead.serviceNeeded}</Text>
            <View style={styles.cardMeta}>
              <Text style={styles.metaText}>{lead.location}</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{formatTimeAgo(lead.createdAt)}</Text>
            </View>
          </View>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[lead.status] }]} />
        </View>

        {lead.status === 'won' && lead.revenue && (
          <Text style={styles.revenue}>${lead.revenue.toLocaleString()}</Text>
        )}

        {expanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity style={styles.callButton} onPress={onCall}>
              <Text style={styles.callButtonText}>Call {lead.name.split(' ')[0]}</Text>
            </TouchableOpacity>

            <View style={styles.statusButtons}>
              {lead.status !== 'won' && (
                <TouchableOpacity style={styles.statusButton} onPress={handleWon}>
                  <Text style={[styles.statusButtonText, { color: colors.success }]}>Won</Text>
                </TouchableOpacity>
              )}
              {lead.status !== 'lost' && (
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => {
                    setExpanded(false);
                    onStatusChange('lost');
                  }}
                >
                  <Text style={[styles.statusButtonText, { color: colors.error }]}>Lost</Text>
                </TouchableOpacity>
              )}
              {lead.status !== 'no_answer' && lead.status !== 'won' && (
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => {
                    setExpanded(false);
                    onStatusChange('no_answer');
                  }}
                >
                  <Text style={styles.statusButtonText}>No answer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <Text style={styles.source}>{lead.source}</Text>
      </TouchableOpacity>

      <Modal visible={showRevenueModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Revenue from this job?</Text>
            <View style={styles.revenueInputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.revenueInput}
                value={revenue}
                onChangeText={setRevenue}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowRevenueModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleSubmitRevenue}
              >
                <Text style={styles.modalButtonPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');

  const filteredLeads = filter === 'all' ? leads : leads.filter((l) => l.status === filter);

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      Linking.openURL(`tel:${lead.phone.replace(/\D/g, '')}`);
    }
  };

  const handleStatusChange = (leadId: string, status: Lead['status'], revenue?: number) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status, revenue: revenue ?? l.revenue } : l
      )
    );
  };

  const stats = {
    new: leads.filter((l) => l.status === 'new').length,
    won: leads.filter((l) => l.status === 'won').length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
        <Text style={styles.subtitle}>
          {stats.new} new · {stats.won} won
        </Text>
      </View>

      <View style={styles.filters}>
        {(['all', 'new', 'contacted', 'won'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredLeads}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onCall={() => handleCall(item)}
            onStatusChange={(status, revenue) => handleStatusChange(item.id, status, revenue)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No leads yet</Text>
            <Text style={styles.emptySubtext}>Barker is scanning for customers</Text>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: 4,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  filterTabActive: {
    backgroundColor: colors.backgroundCard,
  },
  filterText: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  leadName: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  leadService: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
  },
  metaDot: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    marginHorizontal: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  revenue: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.success,
    marginTop: spacing.md,
  },
  source: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  expandedContent: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  callButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.background,
  },
  statusButtons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '500',
    color: colors.textSecondary,
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
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screen,
  },
  modal: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  revenueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dollarSign: {
    fontSize: 32,
    color: colors.textTertiary,
    marginRight: 4,
  },
  revenueInput: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 100,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  modalButtonPrimary: {
    backgroundColor: colors.accent,
  },
  modalButtonPrimaryText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.background,
  },
});
