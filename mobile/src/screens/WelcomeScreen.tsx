import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

function NotificationCard() {
  return (
    <View style={styles.notificationCard}>
      <View style={styles.notificationGoldBar} />
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <View style={styles.notificationIcon}>
            <Text style={styles.notificationIconText}>B</Text>
          </View>
          <View style={styles.notificationMeta}>
            <Text style={styles.notificationApp}>BARKER</Text>
            <Text style={styles.notificationTime}>now</Text>
          </View>
        </View>
        <Text style={styles.notificationTitle}>New lead from Barker</Text>
        <Text style={styles.notificationBody}>
          Maria needs a plumber in Katy.{'\n'}
          Tap to call: (832) 555-0147
        </Text>
      </View>
    </View>
  );
}

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Barker</Text>
          <Text style={styles.logoTag}>AI Salesman</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          Get leads{'\n'}
          <Text style={styles.headlineAccent}>while you work</Text>
        </Text>
        <Text style={styles.subheadline}>
          Barker finds customers on social media and texts you their number.
        </Text>

        {/* Notification mockup */}
        <NotificationCard />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('ServiceType')}
        />
        <Text style={styles.footerSubtitle}>
          Free · No credit card · 30 seconds to set up
        </Text>
        <Button
          title="Log in"
          variant="ghost"
          onPress={() => {}}
          style={styles.loginButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'Georgia',
    letterSpacing: -0.5,
  },
  logoTag: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: spacing.md,
  },
  headlineAccent: {
    color: colors.accent,
  },
  subheadline: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  notificationCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  notificationGoldBar: {
    width: 4,
    backgroundColor: colors.accent,
  },
  notificationContent: {
    flex: 1,
    padding: spacing.lg,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  notificationIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
    fontFamily: 'Georgia',
  },
  notificationMeta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  notificationApp: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  notificationTitle: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.lg,
  },
  footerSubtitle: {
    fontSize: fontSize.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.xs,
  },
});
