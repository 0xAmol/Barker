import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';

type ChannelType = 'google' | 'facebook' | 'instagram' | 'nextdoor';

type ChannelStatus = 'connected' | 'not_connected' | 'manual';

interface ChannelConfig {
  name: string;
  icon: string;
  status: ChannelStatus;
  subtitle: string;
  explanation: string;
  stats?: string;
}

const CHANNEL_CONFIG: Record<ChannelType, ChannelConfig> = {
  google: {
    name: 'Google Business Profile',
    icon: 'G',
    status: 'connected',
    subtitle: 'Auto-responds to reviews, posts updates',
    explanation:
      'Fully automated. Barker responds to every new review in your voice within minutes — this boosts your search ranking. Barker also posts weekly Google Posts about your services.',
    stats: 'Responded to 12 reviews this month · Posted 4 times',
  },
  facebook: {
    name: 'Facebook Groups',
    icon: 'f',
    status: 'not_connected',
    subtitle: 'Spots demand, drafts replies for you',
    explanation:
      "Demand intelligence. Barker monitors local Facebook groups 24/7 for posts where someone needs your service. Barker drafts a reply in your voice as the business owner, then texts it to you to paste into Facebook. You stay authentic — you're the one posting.",
  },
  instagram: {
    name: 'Instagram Business',
    icon: '📸',
    status: 'not_connected',
    subtitle: 'Auto-post content to your feed',
    explanation:
      'Content automation. Barker generates and schedules posts to your Instagram Business account — service tips, customer stories, seasonal reminders. You never touch Instagram.',
  },
  nextdoor: {
    name: 'Nextdoor',
    icon: '🏘️',
    status: 'manual',
    subtitle: 'We find posts, you reply in-app',
    explanation:
      "Manual posting. Nextdoor doesn't allow automated posting, so Barker monitors public Nextdoor recommendations in your neighborhoods and sends you notifications with a suggested reply. You paste it yourself.",
  },
};

const MOCK_FACEBOOK_GROUPS = [
  { id: '1', name: 'Katy TX Homeowners', members: '45K' },
  { id: '2', name: 'Houston Home Owners', members: '128K' },
  { id: '3', name: 'Sugar Land Community', members: '32K' },
  { id: '4', name: 'Cypress TX Neighbors', members: '67K' },
  { id: '5', name: 'Memorial Area Houston', members: '54K' },
];

type RouteParams = {
  ChannelDetail: {
    channel: ChannelType;
  };
};

export function ChannelDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<RouteParams, 'ChannelDetail'>>();
  const { channel } = route.params;

  const config = CHANNEL_CONFIG[channel];

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ChannelStatus>(config.status);
  const [monitoredGroups, setMonitoredGroups] = useState(MOCK_FACEBOOK_GROUPS);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus('connected');
      Alert.alert('Success', `Connected to ${config.name}!`);
    }, 2000);
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Channel',
      `Are you sure you want to disconnect ${config.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            setConnectionStatus('not_connected');
          },
        },
      ]
    );
  };

  const handleRemoveGroup = (groupId: string) => {
    setMonitoredGroups((groups) => groups.filter((g) => g.id !== groupId));
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'manual':
        return 'Manual';
      default:
        return 'Not connected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'‹'}</Text>
          </TouchableOpacity>
          <View style={styles.titleRow}>
            <View style={styles.channelIcon}>
              <Text style={styles.channelIconText}>{config.icon}</Text>
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.title}>{config.name}</Text>
              <Text style={[styles.statusText, { color: getStatusColor() }]}>
                {getStatusText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Explanation Card */}
        <View style={styles.section}>
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>How it works</Text>
            <Text style={styles.explanationText}>{config.explanation}</Text>
          </View>
        </View>

        {/* Connection Action */}
        <View style={styles.section}>
          {connectionStatus === 'connected' ? (
            <>
              {config.stats && (
                <View style={styles.statsCard}>
                  <Text style={styles.statsText}>{config.stats}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            </>
          ) : connectionStatus === 'manual' ? (
            <View style={styles.manualCard}>
              <Text style={styles.manualTitle}>Manual Integration</Text>
              <Text style={styles.manualText}>
                This channel requires you to post manually. Barker will send you notifications with
                suggested replies when we detect relevant posts.
              </Text>
            </View>
          ) : isConnecting ? (
            <View style={styles.connectingCard}>
              <ActivityIndicator color={colors.accent} size="large" />
              <Text style={styles.connectingText}>Connecting to {config.name}...</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
              <Text style={styles.connectButtonText}>Connect {config.name}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Monitored Groups (Facebook only, when connected) */}
        {channel === 'facebook' && connectionStatus === 'connected' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>MONITORED GROUPS</Text>
            <View style={styles.groupsCard}>
              {monitoredGroups.map((group, index) => (
                <View
                  key={group.id}
                  style={[
                    styles.groupRow,
                    index === monitoredGroups.length - 1 && styles.groupRowLast,
                  ]}
                >
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMembers}>{group.members} members</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveGroup(group.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                  {index < monitoredGroups.length - 1 && <View style={styles.groupSeparator} />}
                </View>
              ))}
            </View>
          </View>
        )}
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  backButton: {
    marginLeft: -spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 32,
    color: colors.accent,
    fontWeight: '300',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  channelIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  channelIconText: {
    fontSize: 24,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  statusText: {
    fontSize: fontSize.subhead,
    fontWeight: '500',
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: fontSize.footnote,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.sm,
  },
  explanationCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  explanationTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  statsCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.accentDim,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsText: {
    fontSize: fontSize.subhead,
    color: colors.accent,
    textAlign: 'center',
  },
  connectButton: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.background,
  },
  disconnectButton: {
    marginHorizontal: spacing.screen,
    backgroundColor: 'transparent',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  disconnectButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.error,
  },
  connectingCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  connectingText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  manualCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.textSecondary,
  },
  manualTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  manualText: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  groupsCard: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  groupRowLast: {
    paddingBottom: 14,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  groupMembers: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  removeButtonText: {
    fontSize: fontSize.subhead,
    color: colors.error,
  },
  groupSeparator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
});
