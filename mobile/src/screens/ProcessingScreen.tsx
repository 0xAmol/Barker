import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../components';
import { useOnboarding } from '../context/OnboardingContext';
import { SERVICE_OPTIONS } from '../types';
import { colors, spacing } from '../constants/theme';

// Animated dots component that cycles ...
function AnimatedDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={styles.dots_text}>
      {'.'.repeat(dotCount)}
      <Text style={styles.dots_invisible}>{'.'.repeat(3 - dotCount)}</Text>
    </Text>
  );
}

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export function ProcessingScreen({ navigation }: Props) {
  const { state } = useOnboarding();
  const [messageIndex, setMessageIndex] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  const serviceLabel =
    SERVICE_OPTIONS.find((s) => s.id === state.serviceType)?.label?.toLowerCase() ||
    'your service';

  const locationText =
    state.locations.length > 0
      ? state.locations.slice(0, 2).join(', ')
      : 'your area';

  const messages = [
    `Scanning Facebook groups in ${locationText}...`,
    `Looking for people who need ${serviceLabel} help...`,
    'Found 847 recent posts asking for recommendations...',
    'Preparing your quote page...',
  ];

  // Spin animation
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinValue]);

  // Message rotation
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        // Fade in
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [fadeValue, messages.length]);

  // Auto-advance after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Demo');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScreenWrapper step={7} scrollable={false}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}>
            <Text style={styles.icon}>🔍</Text>
          </Animated.View>

          <Animated.View style={[styles.messageContainer, { opacity: fadeValue }]}>
            <Text style={styles.message}>
              {messages[messageIndex].replace('...', '')}
            </Text>
            <AnimatedDots />
          </Animated.View>

          <View style={styles.dots}>
            {messages.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === messageIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 36,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  message: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 26,
  },
  dots_text: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600',
    width: 24,
  },
  dots_invisible: {
    color: 'transparent',
  },
  dots: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.separator,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
