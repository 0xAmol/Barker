import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  TextInput,
  Modal,
  Animated,
  Clipboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { Lead, DemandAlert } from '../../types/activity';
import { MOCK_LEADS, MOCK_DEMAND_ALERTS, MOCK_STATS } from '../../data/mockData';

const URGENCY_LABELS: Record<string, string> = {
  today: 'Today',
  this_week: 'This week',
  this_month: 'This month',
  flexible: 'Flexible',
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

interface LeadCardProps {
  lead: Lead;
  onCall: () => void;
  onWon: () => void;
  onLost: () => void;
}

function LeadCard({ lead, onCall, onWon, onLost }: LeadCardProps) {
  const renderRightActions = () => (
    <View style={styles.swipeActions}>
      <TouchableOpacity style={[styles.swipeAction, styles.swipeActionWon]} onPress={onWon}>
        <Text style={styles.swipeActionText}>Won</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.swipeAction, styles.swipeActionLost]} onPress={onLost}>
        <Text style={styles.swipeActionText}>Lost</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.leadCard}>
        <View style={styles.leadCardContent}>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.leadService}>{lead.serviceNeeded}</Text>
          <View style={styles.leadMeta}>
            <Text style={styles.leadLocation}>{lead.location}</Text>
            <View style={styles.urgencyBadge}>
              <Text style={styles.urgencyText}>{URGENCY_LABELS[lead.urgency]}</Text>
            </View>
            <Text style={styles.leadTime}>{formatTimeAgo(lead.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton} onPress={onCall}>
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
}

interface DemandAlertCardProps {
  alert: DemandAlert;
  onViewReply: () => void;
}

function DemandAlertCard({ alert, onViewReply }: DemandAlertCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleCopyReply = () => {
    Clipboard.setString(alert.suggestedReply);
    Alert.alert('Copied!', 'Reply copied to clipboard');
  };

  const handleOpenFacebook = () => {
    // In a real app, this would open the actual Facebook post
    Linking.openURL('https://facebook.com');
  };

  return (
    <View style={styles.alertCard}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.alertHeader}>
          <Text style={styles.alertGroup}>{alert.groupName}</Text>
          <Text style={styles.alertTime}>{formatTimeAgo(alert.timestamp)}</Text>
        </View>
        <Text style={styles.alertPost} numberOfLines={expanded ? undefined : 2}>
          "{alert.postText}"
        </Text>
      </TouchableOpacity>

      {!expanded && (
        <TouchableOpacity style={styles.viewReplyButton} onPress={() => setExpanded(true)}>
          <Text style={styles.viewReplyText}>View & Reply</Text>
        </TouchableOpacity>
      )}

      {expanded && (
        <View style={styles.replySection}>
          <Text style={styles.replySectionTitle}>Barker's suggested reply:</Text>
          <View style={styles.replyBox}>
            <Text style={styles.replyText}>{alert.suggestedReply}</Text>
          </View>
          <View style={styles.replyActions}>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyReply}>
              <Text style={styles.copyButtonText}>Copy Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.facebookButton} onPress={handleOpenFacebook}>
              <Text style={styles.facebookButtonText}>Open in Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

interface StatsBarProps {
  leads: number;
  won: number;
  revenue: number;
  onPress: () => void;
}

function StatsBar({ leads, won, revenue, onPress }: StatsBarProps) {
  return (
    <TouchableOpacity style={styles.statsBar} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.statsText}>
        This week: <Text style={styles.statsHighlight}>{leads} leads</Text> · {won} won · ${revenue.toLocaleString()}
      </Text>
      <Text style={styles.statsChevron}>›</Text>
    </TouchableOpacity>
  );
}

function EmptyLeads() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyDotContainer}>
        <Animated.View style={[styles.emptyDot, { opacity: pulseAnim }]} />
      </View>
      <Text style={styles.emptyTitle}>No new leads yet</Text>
      <Text style={styles.emptySubtitle}>Barker is scanning 5 groups for you.</Text>
    </View>
  );
}

function EmptyAlerts() {
  return (
    <View style={styles.emptyAlerts}>
      <Text style={styles.emptyAlertsText}>
        Scanning groups every 15 min. We'll notify you when someone needs your service.
      </Text>
    </View>
  );
}

export function HomeScreen() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS.filter(l => l.status === 'new'));
  const [alerts, setAlerts] = useState<DemandAlert[]>(MOCK_DEMAND_ALERTS);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [revenue, setRevenue] = useState('');
  const [showStats, setShowStats] = useState(false);

  const newLeads = leads.filter(l => l.status === 'new');

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
      setLeads(prev => prev.filter(l => l.id !== selectedLeadId));
    }
    setShowRevenueModal(false);
    setRevenue('');
    setSelectedLeadId(null);
    Alert.alert('Nice!', 'Lead marked as won');
  };

  const handleLost = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const stats = MOCK_STATS;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* New Leads Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>NEW LEADS</Text>
            {newLeads.length > 0 ? (
              <View style={styles.leadsList}>
                {newLeads.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onCall={() => handleCall(lead)}
                    onWon={() => handleWon(lead.id)}
                    onLost={() => handleLost(lead.id)}
                  />
                ))}
              </View>
            ) : (
              <EmptyLeads />
            )}
          </View>

          {/* Demand Alerts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeaderSecondary}>DEMAND ALERTS</Text>
            {alerts.length > 0 ? (
              <View style={styles.alertsList}>
                {alerts.map(alert => (
                  <DemandAlertCard
                    key={alert.id}
                    alert={alert}
                    onViewReply={() => {}}
                  />
                ))}
              </View>
            ) : (
              <EmptyAlerts />
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Stats Bar */}
        <StatsBar
          leads={stats.leadsThisWeek}
          won={stats.wonThisWeek}
          revenue={stats.revenueThisWeek}
          onPress={() => setShowStats(true)}
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
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    fontSize: fontSize.footnote,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  sectionHeaderSecondary: {
    fontSize: fontSize.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  leadsList: {
    gap: 10,
  },
  leadCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadCardContent: {
    flex: 1,
  },
  leadName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  leadService: {
    fontSize: fontSize.subhead,
    color: colors.accent,
    fontWeight: '500',
    marginBottom: 8,
  },
  leadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leadLocation: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
  },
  urgencyBadge: {
    backgroundColor: colors.accentDim,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  leadTime: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
  },
  callButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.md,
  },
  callButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
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
  alertsList: {
    gap: 10,
  },
  alertCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertGroup: {
    fontSize: fontSize.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  alertTime: {
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
  },
  alertPost: {
    fontSize: fontSize.subhead,
    color: colors.textPrimary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  viewReplyButton: {
    marginTop: spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  viewReplyText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.accent,
  },
  replySection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  replySectionTitle: {
    fontSize: fontSize.footnote,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  replyBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  replyText: {
    fontSize: fontSize.subhead,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 10,
  },
  copyButton: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.background,
  },
  facebookButton: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.separator,
    paddingVertical: 12,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  facebookButtonText: {
    fontSize: fontSize.subhead,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
  },
  emptyDotContainer: {
    marginBottom: spacing.md,
  },
  emptyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.success,
  },
  emptyTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
  },
  emptyAlerts: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
  },
  emptyAlertsText: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    paddingVertical: 14,
    paddingHorizontal: spacing.screen,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
  },
  statsText: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
  },
  statsHighlight: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statsChevron: {
    fontSize: 20,
    color: colors.textTertiary,
  },
  bottomSpacer: {
    height: spacing.xxl,
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
