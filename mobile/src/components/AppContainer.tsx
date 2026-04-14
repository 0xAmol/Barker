import React, { ReactNode } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/theme';

interface AppContainerProps {
  children: ReactNode;
}

// Wraps the entire app to constrain width on web and center it
export function AppContainer({ children }: AppContainerProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webOuter}>
        <View style={styles.webInner}>{children}</View>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  webInner: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.background,
    // Add subtle shadow on web for depth
    ...(Platform.OS === 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 30,
    }),
  },
});
