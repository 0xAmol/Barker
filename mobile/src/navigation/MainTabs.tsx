import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen, LeadsScreen, RepliesScreen, SettingsScreen } from '../screens/main';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevFocused = useRef(focused);

  useEffect(() => {
    // Only animate when becoming focused (not on initial render)
    if (focused && !prevFocused.current) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevFocused.current = focused;
  }, [focused, scaleAnim]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={[
          styles.icon,
          focused && styles.iconActive,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {icon === 'home' && <HomeIcon focused={focused} />}
        {icon === 'leads' && <LeadsIcon focused={focused} />}
        {icon === 'replies' && <RepliesIcon focused={focused} />}
        {icon === 'settings' && <SettingsIcon focused={focused} />}
      </Animated.View>
      {focused && <View style={styles.indicator} />}
    </View>
  );
};

// House icon
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.homeIcon}>
    <View style={[styles.homeRoof, focused && styles.iconPartActive]} />
    <View style={[styles.homeBody, focused && styles.iconPartActive]} />
  </View>
);

// People icon
const LeadsIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.leadsIcon}>
    <View style={[styles.personHead, focused && styles.iconPartActive]} />
    <View style={[styles.personBody, focused && styles.iconPartActive]} />
    <View style={[styles.personHead, styles.person2Head, focused && styles.iconPartActive]} />
    <View style={[styles.personBody, styles.person2Body, focused && styles.iconPartActive]} />
  </View>
);

// Chat bubble icon
const RepliesIcon = ({ focused }: { focused: boolean }) => (
  <View style={styles.repliesIcon}>
    <View style={[styles.chatBubble, focused && styles.chatBubbleActive]} />
    <View style={[styles.chatTail, focused && styles.chatTailActive]} />
  </View>
);

// Gear icon
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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="home" focused={focused} />,
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
        name="Replies"
        component={RepliesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="replies" focused={focused} />,
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
  iconPartActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  // Home icon
  homeIcon: {
    width: 22,
    height: 20,
    alignItems: 'center',
  },
  homeRoof: {
    width: 0,
    height: 0,
    borderLeftWidth: 11,
    borderRightWidth: 11,
    borderBottomWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.textTertiary,
  },
  homeBody: {
    width: 16,
    height: 10,
    backgroundColor: colors.textTertiary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -1,
  },
  // Leads icon (people)
  leadsIcon: {
    width: 26,
    height: 20,
    position: 'relative',
  },
  personHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textTertiary,
    position: 'absolute',
    left: 3,
    top: 0,
  },
  personBody: {
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: colors.textTertiary,
    position: 'absolute',
    left: 0,
    top: 10,
  },
  person2Head: {
    left: 15,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  person2Body: {
    width: 12,
    left: 14,
    top: 11,
    height: 7,
  },
  // Replies icon (chat bubble)
  repliesIcon: {
    width: 24,
    height: 20,
    position: 'relative',
  },
  chatBubble: {
    width: 22,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    backgroundColor: 'transparent',
  },
  chatBubbleActive: {
    borderColor: colors.accent,
  },
  chatTail: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.textTertiary,
  },
  chatTailActive: {
    borderTopColor: colors.accent,
  },
  // Settings icon (gear)
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
