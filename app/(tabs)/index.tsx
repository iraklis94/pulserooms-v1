import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@clerk/clerk-expo';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { Button } from '@/components/ui/Button';
import { PulseCircle } from '@/components/mood/PulseCircle';
import { StreakFlame } from '@/components/mood/StreakFlame';
import { SoundRecorder } from '@/components/audio/SoundRecorder';
import { MoodPlaylistRecommendations } from '@/components/music/MoodPlaylistRecommendations';
import { MoodDefinition } from '@/constants/Moods';
import { getCurrentLocation } from '@/services/location';
import { Colors } from '@/constants/Colors';

export default function PulseScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodDefinition | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [note, setNote] = useState('');
  const [soundUrl, setSoundUrl] = useState<string | null>(null);
  const [showSoundRecorder, setShowSoundRecorder] = useState(false);
  const [showMusicRecommendations, setShowMusicRecommendations] = useState(false);

  // Get current user data
  // In dev mode with DISABLE_AUTH, user will be null, so we skip the query
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user && isLoaded ? { clerkId: user.id } : 'skip'
  );

  // Mutations
  const createPulse = useMutation(api.pulses.create);
  const decrementPulseCount = useMutation(api.users.decrementPulseCount);
  const updateStreak = useMutation(api.users.updateStreak);

  // Queries
  const activeChallenges = useQuery(api.challenges.getActive);
  const friends = useQuery(
    api.friendships.getFriends,
    currentUser ? { userId: currentUser._id } : 'skip'
  );
  const pendingSyncRequests = useQuery(
    api.sync.getPendingRequests,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

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
        note: note.trim() || undefined,
        soundUrl: soundUrl || undefined,
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
        setNote('');
        setSoundUrl(null);
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

          {/* Quick Access Buttons */}
          <View style={styles.quickAccessContainer}>
            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/(modals)/friends')}
            >
              <Text style={styles.quickAccessIcon}>👥</Text>
              <Text style={styles.quickAccessText}>
                {friends && friends.length > 0 ? `${friends.length} Friends` : 'Friends'}
              </Text>
              {pendingSyncRequests && pendingSyncRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingSyncRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAccessButton}
              onPress={() => router.push('/(modals)/challenges')}
            >
              <Text style={styles.quickAccessIcon}>🎯</Text>
              <Text style={styles.quickAccessText}>
                {activeChallenges && activeChallenges.length > 0 
                  ? `${activeChallenges.length} Challenges` 
                  : 'Challenges'}
              </Text>
            </TouchableOpacity>
          </View>

          <MoodSelector
            onMoodSelect={handleMoodSelect}
            selectedMood={selectedMood?.id}
            intensity={intensity}
          />

          {/* Note Field */}
          <View style={styles.noteContainer}>
            <Text style={styles.sectionTitle}>Add a thought (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="What's on your mind?"
              placeholderTextColor={Colors.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{note.length}/200</Text>
          </View>

          {/* Sound Recording */}
          <View style={styles.soundContainer}>
            <TouchableOpacity
              style={styles.soundToggleButton}
              onPress={() => setShowSoundRecorder(!showSoundRecorder)}
            >
              <Text style={styles.soundToggleIcon}>{showSoundRecorder ? '🔽' : '🎙️'}</Text>
              <Text style={styles.soundToggleText}>
                {soundUrl ? 'Sound Recorded ✓' : 'Add Sound (optional)'}
              </Text>
            </TouchableOpacity>
            
            {showSoundRecorder && (
              <View style={styles.soundRecorderWrapper}>
                <SoundRecorder
                  onRecordingComplete={(uri) => {
                    setSoundUrl(uri);
                    setShowSoundRecorder(false);
                  }}
                  maxDuration={1000}
                />
                {soundUrl && (
                  <TouchableOpacity
                    style={styles.removeSoundButton}
                    onPress={() => setSoundUrl(null)}
                  >
                    <Text style={styles.removeSoundText}>Remove Sound</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Music Recommendations */}
          {selectedMood && (
            <View style={styles.musicContainer}>
              <TouchableOpacity
                style={styles.musicToggleButton}
                onPress={() => setShowMusicRecommendations(!showMusicRecommendations)}
              >
                <Text style={styles.musicToggleIcon}>🎵</Text>
                <Text style={styles.musicToggleText}>
                  {showMusicRecommendations ? 'Hide' : 'Show'} Music for {selectedMood.name}
                </Text>
              </TouchableOpacity>
              
              {showMusicRecommendations && (
                <MoodPlaylistRecommendations
                  mood={selectedMood.id}
                  color={selectedMood.color}
                />
              )}
            </View>
          )}

          {/* Challenges Preview */}
          {activeChallenges && activeChallenges.length > 0 && (
            <View style={styles.challengesPreview}>
              <Text style={styles.sectionTitle}>Active Challenges</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {activeChallenges.slice(0, 3).map((challenge) => (
                  <TouchableOpacity
                    key={challenge._id}
                    style={styles.challengePreviewCard}
                    onPress={() => router.push('/(modals)/challenges')}
                  >
                    <Text style={styles.challengePreviewTitle}>{challenge.title}</Text>
                    <Text style={styles.challengePreviewParticipants}>
                      {challenge.participantIds.length} participants
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

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
  quickAccessContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickAccessButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickAccessIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  quickAccessText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  noteContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  soundContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  soundToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  soundToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  soundToggleText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  soundRecorderWrapper: {
    marginTop: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  removeSoundButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    alignItems: 'center',
  },
  removeSoundText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  musicContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  musicToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  musicToggleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  musicToggleText: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  challengesPreview: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  challengePreviewCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 200,
  },
  challengePreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  challengePreviewParticipants: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

