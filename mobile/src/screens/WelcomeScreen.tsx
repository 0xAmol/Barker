import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button } from '../components';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper step={1} showProgress={false} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>Get leads{'\n'}while you work</Text>
          <Text style={styles.subheadline}>
            Barker finds customers on social media and texts you their number.
          </Text>

          {/* Phone mockup */}
          <View style={styles.mockup}>
            <View style={styles.phone}>
              <View style={styles.notch} />
              <View style={styles.smsPreview}>
                <View style={styles.smsContent}>
                  <Text style={styles.smsTitle}>New lead from Barker</Text>
                  <Text style={styles.smsBody}>
                    Maria needs a plumber in Katy.{'\n'}
                    Tap to call: (832) 555-0147
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('ServiceType')}
          />
          <Button
            title="Log in"
            variant="ghost"
            onPress={() => {}}
            style={styles.loginButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screen,
  },
  headline: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.section,
  },
  mockup: {
    alignItems: 'center',
  },
  phone: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  notch: {
    width: 60,
    height: 4,
    backgroundColor: colors.separator,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  smsPreview: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
  },
  smsContent: {},
  smsTitle: {
    fontSize: fontSize.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  smsBody: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.xxl,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});
