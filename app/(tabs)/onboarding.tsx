import { useState, useEffect } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export default function OnboardingScreen() {
  const router = useRouter();

  const handleComplete = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}

