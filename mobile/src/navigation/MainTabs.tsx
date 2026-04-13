import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityFeedScreen, LeadsScreen, StatsScreen, SettingsScreen } from '../screens/main';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.icon, focused && styles.iconActive]}>
      {icon === 'activity' && <ActivityIcon focused={focused} />}
      {icon === 'leads' && <LeadsIcon focused={focused} />}
      {icon === 'stats' && <StatsIcon focused={focused} />}
      {icon === 'settings' && <SettingsIcon focused={focused} />}
    </View>
    {focused && <View style={styles.indicator} />}
  </View>
);

// Minimal SF Symbol-style icons
const ActivityIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.iconShape}>
    <View style={[styles.waveBar, styles.waveBar1, focused && styles.barActive]} />
    <View style={[styles.waveBar, styles.waveBar2, focused && styles.barActive]} />
    <View style={[styles.waveBar, styles.waveBar3, focused && styles.barActive]} />
    <View style={[styles.waveBar, styles.waveBar2, focused && styles.barActive]} />
    <View style={[styles.waveBar, styles.waveBar1, focused && styles.barActive]} />
  </View>
);

const LeadsIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.targetOuter, focused && styles.targetActive]}>
    <View style={[styles.targetInner, focused && styles.targetInnerActive]} />
  </View>
);

const StatsIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.statsContainer}>
    <View style={[styles.statBar, styles.statBar1, focused && styles.barActive]} />
    <View style={[styles.statBar, styles.statBar2, focused && styles.barActive]} />
    <View style={[styles.statBar, styles.statBar3, focused && styles.barActive]} />
  </View>
);

const SettingsIcon = ({ focused }: { focused: boolean }) => (
  <View style={[styles.gearOuter, focused && styles.gearActive]}>
    <View style={[styles.gearInner, focused && styles.gearInnerActive]} />
  </View>
);

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Activity"
        component={ActivityFeedScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="activity" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="leads" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="stats" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopWidth: 0,
    height: 84,
    paddingTop: 12,
    paddingBottom: 28,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  icon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {},
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  iconShape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 20,
  },
  waveBar: {
    width: 3,
    backgroundColor: colors.textTertiary,
    borderRadius: 1.5,
  },
  waveBar1: { height: 8 },
  waveBar2: { height: 14 },
  waveBar3: { height: 20 },
  barActive: {
    backgroundColor: colors.accent,
  },
  targetOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetActive: {
    borderColor: colors.accent,
  },
  targetInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
  },
  targetInnerActive: {
    backgroundColor: colors.accent,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    height: 20,
  },
  statBar: {
    width: 6,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
  },
  statBar1: { height: 10 },
  statBar2: { height: 16 },
  statBar3: { height: 20 },
  gearOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearActive: {
    borderColor: colors.accent,
  },
  gearInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textTertiary,
  },
  gearInnerActive: {
    borderColor: colors.accent,
  },
});
