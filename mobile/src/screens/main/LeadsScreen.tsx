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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
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

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  won: 'Won',
  lost: 'Lost',
  no_answer: 'No Answer',
};

const URGENCY_LABELS: Record<string, string> = {
  today: 'Today',
  this_week: 'This week',
  this_month: 'This month',
  flexible: 'Flexible',
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
  onWon: () => void;
  onLost: () => void;
}

function LeadCard({ lead, onCall, onWon, onLost }: LeadCardProps) {
  const statusColor = STATUS_COLORS[lead.status];
  const isActionable = lead.status !== 'won' && lead.status !== 'lost';

  const renderRightActions = () => {
    if (!isActionable) return null;
    return (
      <View style={styles.swipeActions}>
        <TouchableOpacity style={[styles.swipeAction, styles.swipeActionWon]} onPress={onWon}>
          <Text style={styles.swipeActionText}>Won</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.swipeAction, styles.swipeActionLost]} onPress={onLost}>
          <Text style={styles.swipeActionText}>Lost</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const CardContent = (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.leadName}>{lead.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {STATUS_LABELS[lead.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.leadService}>{lead.serviceNeeded}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>{lead.location}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{URGENCY_LABELS[lead.urgency]}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatTimeAgo(lead.createdAt)}</Text>
          </View>
        </View>
        {lead.phone && isActionable && (
          <TouchableOpacity style={styles.callButton} onPress={onCall}>
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        )}
      </View>

      {lead.status === 'won' && lead.revenue && (
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Revenue:</Text>
          <Text style={styles.revenueValue}>${lead.revenue.toLocaleString()}</Text>
        </View>
      )}

      <Text style={styles.source}>via {lead.source}</Text>
    </View>
  );

  if (isActionable) {
    return (
      <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
        {CardContent}
      </Swipeable>
    );
  }

  return CardContent;
}

export function LeadsScreen() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [filter, setFilter] = useState<Lead['status'] | 'all'>('all');
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [revenue, setRevenue] = useState('');

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const handleCall = (lead: Lead) => {
    if (lead.phone) {
      Linking.openURL(`tel:${lead.phone.replace(/\D/g, '')}`);
    }
  };

  const handleWon = (leadId: string) => {
    setSelectedLeadId(leadId);
    setShowRevenueModal(true);
  };

  const handleSubmitRevenue = () => {
    if (selectedLeadId) {
      setLeads(prev =>
        prev.map(l =>
          l.id === selectedLeadId ? { ...l, status: 'won' as const, revenue: parseFloat(revenue) || 0 } : l
        )
      );
    }
    setShowRevenueModal(false);
    setRevenue('');
    setSelectedLeadId(null);
  };

  const handleLost = (leadId: string) => {
    setLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, status: 'lost' as const } : l))
    );
  };

  const stats = {
    new: leads.filter(l => l.status === 'new').length,
    won: leads.filter(l => l.status === 'won').length,
    totalRevenue: leads.filter(l => l.status === 'won').reduce((sum, l) => sum + (l.revenue || 0), 0),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Leads</Text>
          <Text style={styles.subtitle}>
            {stats.new} new · {stats.won} won · ${stats.totalRevenue.toLocaleString()}
          </Text>
        </View>

        <View style={styles.filters}>
          {(['all', 'new', 'contacted', 'won', 'lost'] as const).map(f => (
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
              onWon={() => handleWon(item.id)}
              onLost={() => handleLost(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No leads found</Text>
              <Text style={styles.emptySubtext}>
                {filter === 'all'
                  ? 'Barker is scanning for customers'
                  : `No ${filter} leads yet`}
              </Text>
            </View>
          }
        />

        {/* Revenue Modal */}
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
                  onPress={() => {
                    setShowRevenueModal(false);
                    setRevenue('');
                    setSelectedLeadId(null);
                  }}
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
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingBottom: spacing.md,
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
    paddingHorizontal: 12,
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
    marginBottom: 10,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  leadName: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  leadService: {
    fontSize: fontSize.subhead,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
  callButton: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.md,
  },
  callButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  revenueLabel: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginRight: 8,
  },
  revenueValue: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.success,
  },
  source: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  swipeActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: borderRadius.md,
  },
  swipeActionWon: {
    backgroundColor: colors.success,
    marginRight: 8,
  },
  swipeActionLost: {
    backgroundColor: colors.error,
  },
  swipeActionText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
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
