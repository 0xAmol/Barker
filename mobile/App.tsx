import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <NavigationContainer theme={BarkerTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.background },
            }}
          >
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
          </Stack.Navigator>
        </NavigationContainer>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
