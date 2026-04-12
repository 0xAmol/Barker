import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../../constants/theme';
import { MOCK_STATS } from '../../data/mockData';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

function SettingRow({ label, value, onPress, rightElement }: SettingRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {rightElement || (
        <View style={styles.settingRight}>
          {value && <Text style={styles.settingValue}>{value}</Text>}
          {onPress && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function SettingsScreen() {
  const [isBarkerActive, setIsBarkerActive] = useState(MOCK_STATS.agentStatus === 'active');
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);
  const [notifyLowCredits, setNotifyLowCredits] = useState(true);
  const [editingServiceArea, setEditingServiceArea] = useState(false);
  const [serviceArea, setServiceArea] = useState('Katy, Sugar Land, Houston Heights');

  const handleToggleBarker = (value: boolean) => {
    setIsBarkerActive(value);
    if (value) {
      Alert.alert('Barker Resumed', 'Your agent is now scanning for leads.');
    } else {
      Alert.alert('Barker Paused', 'Your agent has stopped scanning. You can resume anytime.');
    }
  };

  const handleBuyCredits = () => {
    Alert.alert('Coming Soon', 'Credit purchase will be available in the next update.');
  };

  const handleEditBrandVoice = () => {
    Alert.alert('Brand Voice', 'Edit your brand voice settings to customize how Barker represents your business.');
  };

  const handleEditGroups = () => {
    Alert.alert('Facebook Groups', 'Manage which groups Barker monitors for leads.');
  };

  const handleSupport = () => {
    Alert.alert('Support', 'Email us at support@barker.app');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Agent Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.statusTitle}>Barker Agent</Text>
              <Text style={styles.statusSubtitle}>
                {isBarkerActive ? 'Scanning for leads' : 'Paused'}
              </Text>
            </View>
            <Switch
              value={isBarkerActive}
              onValueChange={handleToggleBarker}
              trackColor={{ false: colors.border, true: 'rgba(46, 204, 113, 0.4)' }}
              thumbColor={isBarkerActive ? '#2ECC71' : colors.textMuted}
            />
          </View>
        </View>

        {/* Credits Section */}
        <View style={styles.section}>
          <SectionHeader title="Credits" />
          <View style={styles.card}>
            <View style={styles.creditsDisplay}>
              <View>
                <Text style={styles.creditsValue}>{MOCK_STATS.creditsRemaining}</Text>
                <Text style={styles.creditsLabel}>leads remaining</Text>
              </View>
              <TouchableOpacity style={styles.buyButton} onPress={handleBuyCredits}>
                <Text style={styles.buyButtonText}>Buy More</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.creditsBar}>
              <View
                style={[
                  styles.creditsBarFill,
                  { width: `${Math.min((MOCK_STATS.creditsRemaining / 50) * 100, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Service Area */}
        <View style={styles.section}>
          <SectionHeader title="Service Area" />
          <View style={styles.card}>
            {editingServiceArea ? (
              <View>
                <TextInput
                  style={styles.textInput}
                  value={serviceArea}
                  onChangeText={setServiceArea}
                  placeholder="Enter cities you serve..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => setEditingServiceArea(false)}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <SettingRow
                label="Cities you serve"
                value={serviceArea}
                onPress={() => setEditingServiceArea(true)}
              />
            )}
          </View>
        </View>

        {/* Agent Settings */}
        <View style={styles.section}>
          <SectionHeader title="Agent Settings" />
          <View style={styles.card}>
            <SettingRow label="Brand Voice" value="Friendly, professional" onPress={handleEditBrandVoice} />
            <View style={styles.divider} />
            <SettingRow label="Facebook Groups" value="5 groups" onPress={handleEditGroups} />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <SectionHeader title="Notifications" />
          <View style={styles.card}>
            <SettingRow
              label="New lead alerts"
              rightElement={
                <Switch
                  value={notifyNewLeads}
                  onValueChange={setNotifyNewLeads}
                  trackColor={{ false: colors.border, true: `${colors.accent}66` }}
                  thumbColor={notifyNewLeads ? colors.accent : colors.textMuted}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              label="Daily summary"
              rightElement={
                <Switch
                  value={notifyDailySummary}
                  onValueChange={setNotifyDailySummary}
                  trackColor={{ false: colors.border, true: `${colors.accent}66` }}
                  thumbColor={notifyDailySummary ? colors.accent : colors.textMuted}
                />
              }
            />
            <View style={styles.divider} />
            <SettingRow
              label="Low credit warning"
              rightElement={
                <Switch
                  value={notifyLowCredits}
                  onValueChange={setNotifyLowCredits}
                  trackColor={{ false: colors.border, true: `${colors.accent}66` }}
                  thumbColor={notifyLowCredits ? colors.accent : colors.textMuted}
                />
              }
            />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={styles.card}>
            <SettingRow label="Business Name" value="Johnson Plumbing" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Email" value="dave@johnsonplumbing.com" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow label="Phone" value="(832) 555-0147" onPress={() => {}} />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.card}>
            <SettingRow label="Help Center" onPress={handleSupport} />
            <View style={styles.divider} />
            <SettingRow label="Contact Support" onPress={handleSupport} />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>Barker v1.0.0</Text>

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
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  statusSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: colors.textMuted,
    maxWidth: 180,
    textAlign: 'right',
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md,
  },
  creditsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  creditsLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  buyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  creditsBar: {
    height: 6,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 3,
    overflow: 'hidden',
  },
  creditsBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  textInput: {
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 60,
  },
  saveButton: {
    backgroundColor: colors.accent,
    margin: spacing.md,
    marginTop: 0,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  logoutButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E74C3C',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xxl,
  },
});
