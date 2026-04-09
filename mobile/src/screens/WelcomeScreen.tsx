import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper, Button } from '../components';
import { colors, spacing } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper step={1} showProgress={true} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.headline}>Get leads while you work</Text>
          <Text style={styles.subheadline}>
            Barker finds people who need your services on social media and texts
            you their number. You just call them back.
          </Text>

          {/* Phone mockup */}
          <View style={styles.mockup}>
            <View style={styles.phone}>
              <View style={styles.notch} />
              <View style={styles.smsPreview}>
                <Text style={styles.smsIcon}>🔔</Text>
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
            title="Get Started — It's Free"
            onPress={() => navigation.navigate('ServiceType')}
          />
          <Button
            title="Already have an account? Log in"
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  headline: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subheadline: {
    fontSize: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  mockup: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  phone: {
    width: 280,
    height: 180,
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    alignItems: 'center',
  },
  notch: {
    width: 80,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginBottom: 16,
  },
  smsPreview: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    width: '100%',
  },
  smsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  smsContent: {
    flex: 1,
  },
  smsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  smsBody: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});
