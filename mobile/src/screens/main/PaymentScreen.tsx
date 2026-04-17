import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../constants/theme';
import { MOCK_CREDIT_BALANCE } from '../../data/mockData';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ Payment: { amount: number } }, 'Payment'>;
};

export function PaymentScreen({ navigation, route }: Props) {
  const { amount } = route.params;
  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const spinValue = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const newBalance = MOCK_CREDIT_BALANCE + amount;

  useEffect(() => {
    // Spin animation for processing
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    // Simulate payment processing
    const timer = setTimeout(() => {
      spin.stop();
      setStatus('success');

      // Animate success state
      Animated.parallel([
        Animated.spring(checkmarkScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    return () => {
      clearTimeout(timer);
      spin.stop();
    };
  }, [spinValue, checkmarkScale, contentOpacity]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBackToHome = () => {
    // Navigate back to Settings tab
    navigation.popToTop();
  };

  if (status === 'processing') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centerContent}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinnerInner} />
          </Animated.View>
          <Text style={styles.processingText}>Processing payment...</Text>
          <Text style={styles.processingSubtext}>Adding ${amount} to your account</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.successContent}>
        {/* Checkmark */}
        <Animated.View
          style={[styles.checkmarkContainer, { transform: [{ scale: checkmarkScale }] }]}
        >
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>{'✓'}</Text>
          </View>
        </Animated.View>

        {/* Success Message */}
        <Animated.View style={[styles.messageContainer, { opacity: contentOpacity }]}>
          <Text style={styles.successTitle}>Credits added</Text>
          <View style={styles.newBalanceCard}>
            <Text style={styles.newBalanceAmount}>${newBalance.toFixed(2)}</Text>
            <Text style={styles.newBalanceLabel}>available</Text>
          </View>
          <Text style={styles.successSubtext}>
            Barker is ready to capture more leads for you
          </Text>
        </Animated.View>

        {/* Button */}
        <Animated.View style={[styles.buttonContainer, { opacity: contentOpacity }]}>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.separator,
    borderTopColor: colors.accent,
    marginBottom: spacing.xl,
  },
  spinnerInner: {
    // Inner element for visual reference if needed
  },
  processingText: {
    fontSize: fontSize.title,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  processingSubtext: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
  },
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
  },
  checkmarkContainer: {
    marginBottom: spacing.xl,
  },
  checkmark: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 40,
    color: colors.textPrimary,
    fontWeight: '300',
  },
  messageContainer: {
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fontSize.headline,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  newBalanceCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xxl * 2,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  newBalanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: -1,
  },
  newBalanceLabel: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  successSubtext: {
    fontSize: fontSize.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.screen,
    right: spacing.screen,
  },
  homeButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.background,
  },
});
