import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={90} 
        tint="light" 
        style={styles.blurView}
      />
    );
  } else {
    return <View style={styles.backgroundView} />;
  }
}

export function useBottomTabOverflow() {
  return 0;
}

const styles = StyleSheet.create({
  blurView: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Increased opacity to reduce transparency
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  backgroundView: {
    backgroundColor: '#FFFFFF', // Pure white for Android
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});