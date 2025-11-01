import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { Button } from '@/components/ui/Button';
import { PulseCircle } from '@/components/mood/PulseCircle';
import { StreakFlame } from '@/components/mood/StreakFlame';
import { MoodDefinition } from '@/constants/Moods';
import { getCurrentLocation } from '@/services/location';
import { Colors } from '@/constants/Colors';

export default function PulseScreen() {
  const { user } = useUser();
  const [selectedMood, setSelectedMood] = useState<MoodDefinition | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Get current user data
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : 'skip'
  );

  // Mutations
  const createPulse = useMutation(api.pulses.create);
  const decrementPulseCount = useMutation(api.users.decrementPulseCount);
  const updateStreak = useMutation(api.users.updateStreak);

  const handleMoodSelect = (mood: MoodDefinition, newIntensity: number) => {
    setSelectedMood(mood);
    setIntensity(newIntensity);
  };

  const handleSubmit = async () => {
    if (!selectedMood || !currentUser) {
      Alert.alert('Error', 'Please select a mood first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user has pulses remaining
      const canPulse = await decrementPulseCount({ userId: currentUser._id });

      if (!canPulse) {
        Alert.alert(
          'Out of Pulses',
          'You\'ve used all your pulses for today. Upgrade to premium for unlimited pulses!',
          [{ text: 'OK' }]
        );
        setIsSubmitting(false);
        return;
      }

      // Get location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Location Required', 'Please enable location services');
        setIsSubmitting(false);
        return;
      }

      // Create pulse
      await createPulse({
        userId: currentUser._id,
        color: selectedMood.color,
        mood: selectedMood.id,
        moodIntensity: intensity,
        lat: location.latitude,
        lon: location.longitude,
      });

      // Update streak
      await updateStreak({ userId: currentUser._id });

      // Haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedMood(null);
        setIntensity(50);
      }, 2000);
    } catch (error) {
      console.error('Error creating pulse:', error);
      Alert.alert('Error', 'Failed to create pulse. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <LinearGradient 
        colors={[selectedMood?.color || Colors.primary, Colors.background]} 
        style={styles.container}
      >
        <StatusBar style="light" />
        <View style={styles.successContainer}>
          <PulseCircle color={selectedMood?.color || Colors.primary} size={150} />
          <Text style={styles.successTitle}>Pulse Live! 🎉</Text>
          <Text style={styles.successSubtitle}>Your emotions are now visible to the world</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a1a2e', '#16213e']} style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {currentUser && (
            <View style={styles.streakContainer}>
              <StreakFlame streakDays={currentUser.streakDays} size={40} />
              <Text style={styles.pulsesRemaining}>
                {currentUser.pulsesRemaining} pulses remaining today
              </Text>
            </View>
          )}

          <MoodSelector
            onMoodSelect={handleMoodSelect}
            selectedMood={selectedMood?.id}
            intensity={intensity}
          />

          <View style={styles.buttonContainer}>
            <Button
              title={isSubmitting ? 'Creating Pulse...' : 'Create Pulse'}
              onPress={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              loading={isSubmitting}
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  pulsesRemaining: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  buttonContainer: {
    padding: 20,
    marginTop: 20,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 30,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});

