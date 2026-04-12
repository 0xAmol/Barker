import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { OnboardingProvider } from './src/context/OnboardingContext';
import { colors } from './src/constants/theme';

import {
  WelcomeScreen,
  ServiceTypeScreen,
  PainPointsScreen,
  SocialProofScreen,
  SolutionScreen,
  LocationScreen,
  ProcessingScreen,
  DemoScreen,
  ValueDeliveryScreen,
  AccountCreationScreen,
  PaywallScreen,
} from './src/screens';
import { MainTabs } from './src/navigation/MainTabs';

// Define navigation param list
export type RootStackParamList = {
  Welcome: undefined;
  ServiceType: undefined;
  PainPoints: undefined;
  SocialProof: undefined;
  Solution: undefined;
  Location: undefined;
  Processing: undefined;
  Demo: undefined;
  ValueDelivery: undefined;
  AccountCreation: undefined;
  Paywall: undefined;
  MainApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom dark theme matching Barker brand
const BarkerTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.backgroundCard,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.accent,
  },
};

const ONBOARDING_COMPLETE_KEY = '@barker_onboarding_complete';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      setHasCompletedOnboarding(value === 'true');
    } catch (e) {
      // If error, default to showing onboarding
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <NavigationContainer theme={BarkerTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName={hasCompletedOnboarding ? 'MainApp' : 'Welcome'}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            {/* Onboarding Screens */}
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ServiceType" component={ServiceTypeScreen} />
            <Stack.Screen name="PainPoints" component={PainPointsScreen} />
            <Stack.Screen name="SocialProof" component={SocialProofScreen} />
            <Stack.Screen name="Solution" component={SolutionScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen
              name="Processing"
              component={ProcessingScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen name="Demo" component={DemoScreen} />
            <Stack.Screen name="ValueDelivery" component={ValueDeliveryScreen} />
            <Stack.Screen name="AccountCreation" component={AccountCreationScreen} />
            <Stack.Screen name="Paywall" component={PaywallScreen} />

            {/* Main App (after onboarding) */}
            <Stack.Screen
              name="MainApp"
              component={MainTabs}
              options={{
                animation: 'fade',
                gestureEnabled: false, // Prevent swipe back to onboarding
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
