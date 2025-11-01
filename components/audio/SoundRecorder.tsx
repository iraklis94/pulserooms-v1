import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { startRecording, stopRecording } from '@/services/audio';

interface SoundRecorderProps {
  onRecordingComplete: (uri: string) => void;
  maxDuration?: number;
}

export function SoundRecorder({ onRecordingComplete, maxDuration = 1000 }: SoundRecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleStartRecording = async () => {
    try {
      const newRecording = await startRecording();
      if (!newRecording) {
        Alert.alert('Permission Required', 'Please enable microphone access');
        return;
      }

      setRecording(newRecording);
      setIsRecording(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Start timer
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setRecordingTime(elapsed);

        if (elapsed >= maxDuration) {
          clearInterval(interval);
          handleStopRecording();
        }
      }, 100);

      // Store interval to clear it later
      (newRecording as any)._interval = interval;
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    if (!recording) return;

    try {
      // Clear interval
      if ((recording as any)._interval) {
        clearInterval((recording as any)._interval);
      }

      const result = await stopRecording(recording);
      if (result) {
        onRecordingComplete(result.uri);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setIsRecording(false);
      setRecording(null);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Your Vibe Sound</Text>
      <Text style={styles.subtitle}>Record a 1-second sound to add to your pulse</Text>

      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
        ]}
        onPressIn={handleStartRecording}
        onPressOut={handleStopRecording}
        activeOpacity={0.8}
      >
        <View style={[styles.recordDot, isRecording && styles.recordDotActive]}>
          <Text style={styles.recordIcon}>{isRecording ? '⏸' : '🎙️'}</Text>
        </View>
        <Text style={styles.recordText}>
          {isRecording ? 'Recording...' : 'Hold to Record'}
        </Text>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.timerContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(recordingTime / maxDuration) * 100}%` },
            ]}
          />
          <Text style={styles.timerText}>
            {(recordingTime / 1000).toFixed(1)}s / {(maxDuration / 1000).toFixed(1)}s
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    alignItems: 'center',
    padding: 20,
  },
  recordButtonActive: {
    opacity: 1,
  },
  recordDot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  recordDotActive: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
  },
  recordIcon: {
    fontSize: 32,
  },
  recordText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  timerContainer: {
    width: '100%',
    marginTop: 16,
    position: 'relative',
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});

