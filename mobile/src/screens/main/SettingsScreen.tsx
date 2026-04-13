import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { MOCK_STATS } from '../../data/mockData';

interface SettingRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  isLast?: boolean;
}

function SettingRow({ label, value, onPress, showChevron = true, rightElement, isLast }: SettingRowProps) {
  const content = (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {rightElement || (
        <View style={styles.rowRight}>
          {value && <Text style={styles.rowValue}>{value}</Text>}
          {onPress && showChevron && <Text style={styles.chevron}>›</Text>}
        </View>
      )}
      {!isLast && <View style={styles.rowSeparator} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export function SettingsScreen() {
  const [isBarkerActive, setIsBarkerActive] = useState(MOCK_STATS.agentStatus === 'active');
  const [notifyNewLeads, setNotifyNewLeads] = useState(true);
  const [notifyDailySummary, setNotifyDailySummary] = useState(true);

  const handleToggleBarker = (value: boolean) => {
    setIsBarkerActive(value);
    Alert.alert(
      value ? 'Barker Resumed' : 'Barker Paused',
      value ? 'Your agent is now scanning for leads.' : 'Your agent has stopped scanning.'
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Agent Control */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.agentRow}>
              <View>
                <Text style={styles.agentTitle}>Barker Agent</Text>
                <Text style={styles.agentSubtitle}>
                  {isBarkerActive ? 'Scanning for leads' : 'Paused'}
                </Text>
              </View>
              <Switch
                value={isBarkerActive}
                onValueChange={handleToggleBarker}
                trackColor={{ false: colors.separator, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
          <View style={styles.card}>
            <SettingRow
              label="New leads"
              showChevron={false}
              rightElement={
                <Switch
                  value={notifyNewLeads}
                  onValueChange={setNotifyNewLeads}
                  trackColor={{ false: colors.separator, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              }
            />
            <SettingRow
              label="Daily summary"
              showChevron={false}
              isLast
              rightElement={
                <Switch
                  value={notifyDailySummary}
                  onValueChange={setNotifyDailySummary}
                  trackColor={{ false: colors.separator, true: colors.accent }}
                  thumbColor={colors.textPrimary}
                />
              }
            />
          </View>
        </View>

        {/* Business */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Business</Text>
          <View style={styles.card}>
            <SettingRow label="Business name" value="Johnson Plumbing" onPress={() => {}} />
            <SettingRow label="Service area" value="Katy, Houston" onPress={() => {}} />
            <SettingRow label="Brand voice" value="Friendly" onPress={() => {}} isLast />
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.card}>
            <SettingRow label="Email" value="dave@johnson.com" onPress={() => {}} />
            <SettingRow label="Phone" value="(832) 555-0147" onPress={() => {}} isLast />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow label="Help & Support" onPress={() => Alert.alert('Support', 'support@barker.app')} />
            <SettingRow label="Terms of Service" onPress={() => {}} />
            <SettingRow label="Privacy Policy" onPress={() => {}} isLast />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => Alert.alert('Log Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive' },
          ])}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>
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
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: spacing.section,
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
  card: {
    marginHorizontal: spacing.screen,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  rowLabel: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  rowSeparator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  agentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  agentTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  agentSubtitle: {
    fontSize: fontSize.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: spacing.screen,
    marginTop: spacing.lg,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontSize.body,
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: fontSize.footnote,
    color: colors.textTertiary,
    marginTop: spacing.xl,
  },
});
