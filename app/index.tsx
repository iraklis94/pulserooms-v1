import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { View, ActivityIndicator } from 'react-native';

const DISABLE_AUTH = process.env.EXPO_PUBLIC_DISABLE_AUTH === 'true';

export default function Index() {
  // Development mode: bypass auth check
  if (DISABLE_AUTH) {
    return <Redirect href="/(tabs)" />;
  }

  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}

