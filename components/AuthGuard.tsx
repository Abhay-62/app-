import Colors from '@/constants/Colors';
import { useAuth } from '@/hooks/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, admin, isLoading } = useAuth();
  const segments = useSegments();
  const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      const welcomeSeen = await AsyncStorage.getItem('hasSeenWelcome');
      setHasSeenWelcome(welcomeSeen === 'true');
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setHasSeenWelcome(false);
    }
  };

  useEffect(() => {
    if (isLoading || hasSeenWelcome === null) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inAdminRoute = segments[0] === 'admin';
    const inAuthRoute = segments[0] === 'login' || segments[0] === 'register' || segments[0] === 'admin-login';
    const inWelcomeRoute = segments[0] === 'welcome';

    console.log('AuthGuard - segments:', segments);
    console.log('AuthGuard - user:', !!user);
    console.log('AuthGuard - admin:', !!admin);
    console.log('AuthGuard - hasSeenWelcome:', hasSeenWelcome);

    // First time user - show welcome screen
    if (!hasSeenWelcome && !inWelcomeRoute && !user && !admin) {
      router.replace('/welcome');
      return;
    }

    // Mark welcome as seen when user navigates away from welcome
    if (inWelcomeRoute && hasSeenWelcome === false) {
      AsyncStorage.setItem('hasSeenWelcome', 'true');
      setHasSeenWelcome(true);
    }

    if (inAdminRoute && !admin) {
      // Admin route but no admin logged in
      router.replace('/login');
    } else if (inAuthGroup && !user && !admin) {
      // Protected route but no user logged in
      router.replace('/login');
    } else if (inAuthRoute && (user || admin)) {
      // Auth route but user is already logged in
      router.replace('/(tabs)');
    }
  }, [user, admin, isLoading, segments, hasSeenWelcome]);

  if (isLoading || hasSeenWelcome === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});