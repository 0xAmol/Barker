import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { Lead } from '../../types/activity';
import { MOCK_LEADS } from '../../data/mockData';

const STATUS_CONFIG = {
  new: { label: 'New', color: '#d4a843', bg: 'rgba(212, 168, 67, 0.15)' },
  contacted: { label: 'Contacted', color: '#3498DB', bg: 'rgba(52, 152, 219, 0.15)' },
  won: { label: 'Won', color: '#2ECC71', bg: 'rgba(46, 204, 113, 0.15)' },
  lost: { label: 'Lost', color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.15)' },
  no_answer: { label: 'No Answer', color: '#95A5A6', bg: 'rgba(149, 165, 166, 0.15)' },
};

const URGENCY_LABELS = {
  today: '🔥 Today',
  this_week: '📅 This week',
  this_month: '📆 This month',
  flexible: '⏳ Flexible',
};

function formatTimeAgo(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

interface LeadCardProps {
  lead: Lead;
  onCall: () => void;
  onStatusChange: (status: Lead['status'], revenue?: number) => void;
}

function LeadCard({ lead, onCall, onStatusChange }: LeadCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenue, setRevenue] = useState('');

  const statusConfig = STATUS_CONFIG[lead.status];

  const handleWon = () => {
    setShowActions(false);
    setShowRevenueModal(true);
  };

  const handleSubmitRevenue = () => {
    const revenueValue = parseFloat(revenue) || 0;
    onStatusChange('won', revenueValue);
    setShowRevenueModal(false);
    setRevenue('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setShowActions(!showActions)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <Text style={styles.leadTime}>{formatTimeAgo(lead.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Service needed */}
        <Text style={styles.serviceNeeded}>{lead.serviceNeeded}</Text>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <Text style={styles.detailItem}>📍 {lead.location}</Text>
          <Text style={styles.detailItem}>{URGENCY_LABELS[lead.urgency]}</Text>
        </View>

        {/* Source */}
        <Text style={styles.source}>via {lead.source}</Text>

        {/* Revenue if won */}
        {lead.status === 'won' && lead.revenue && (
          <View style={styles.revenueRow}>
            <Text style={styles.revenueLabel}>Revenue:</Text>
            <Text style={styles.revenueValue}>${lead.revenue.toLocaleString()}</Text>
          </View>
        )}

        {/* Action buttons */}
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.callButton} onPress={onCall}>
              <Text style={styles.callButtonText}>📞 Call {lead.name.split(' ')[0]}</Text>
            </TouchableOpacity>

            <View style={styles.statusActions}>
              {lead.status !== 'won' && (
                <TouchableOpacity
                  style={[styles.statusButton, styles.wonButton]}
                  onPress={handleWon}
                >
                  <Text style={styles.statusButtonText}>✓ Won</Text>
                </TouchableOpacity>
              )}
              {lead.status !== 'lost' && (
                <TouchableOpacity
                  style={[styles.statusButton, styles.lostButton]}
                  onPress={() => {
                    setShowActions(false);
                    onStatusChange('lost');
                  }}
                >
                  <Text style={styles.statusButtonText}>✗ Lost</Text>
                </TouchableOpacity>
              )}
              {lead.status !== 'no_answer' && lead.status !== 'won' && (
                <TouchableOpacity
                  style={[styles.statusButton, styles.noAnswerButton]}
                  onPress={() => {
                    setShowActions(false);
                    onStatusChange('no_answer');
                  }}
                >
                  <Text style={styles.statusButtonText}>No Answer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Revenue Modal */}
      <Modal visible={showRevenueModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>🎉 Nice! How much did you close?</Text>
            <View style={styles.revenueInputContainer}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.revenueInput}
                value={revenue}
                onChangeText={setRevenue}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRevenueModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmitRevenue}
              >
                <Text style={styles.modalSubmitText}>Log Revenue</Text>
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
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    won: leads.filter((l) => l.status === 'won').length,
    revenue: leads.filter((l) => l.status === 'won').reduce((sum, l) => sum + (l.revenue || 0), 0),
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Leads</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>{stats.new} new</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statItem}>{stats.won} won</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={[styles.statItem, styles.statRevenue]}>${stats.revenue.toLocaleString()}</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filters}>
        {(['all', 'new', 'contacted', 'won', 'lost'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lead list */}
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
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No leads yet</Text>
            <Text style={styles.emptySubtext}>
              Barker is scanning for customers. Check back soon!
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statItem: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statDivider: {
    fontSize: 13,
    color: colors.border,
    marginHorizontal: 8,
  },
  statRevenue: {
    color: colors.accent,
    fontWeight: '600',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
  },
  filterTabActive: {
    backgroundColor: colors.accentSubtle,
  },
  filterText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.accent,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  leadName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  leadTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceNeeded: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  detailItem: {
    fontSize: 13,
    color: colors.textMuted,
  },
  source: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  revenueLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ECC71',
    marginLeft: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  callButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
  statusActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  wonButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  lostButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  noAnswerButton: {
    backgroundColor: 'rgba(149, 165, 166, 0.15)',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  revenueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  dollarSign: {
    fontSize: 24,
    color: colors.textMuted,
    marginRight: spacing.xs,
  },
  revenueInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});
