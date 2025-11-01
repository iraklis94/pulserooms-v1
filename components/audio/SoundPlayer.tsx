import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '@/constants/Colors';
import { playSound, unloadSound } from '@/services/audio';

interface SoundPlayerProps {
  soundUrl: string;
  color?: string;
}

export function SoundPlayer({ soundUrl, color = Colors.primary }: SoundPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (sound) {
        unloadSound(sound);
      }
    };
  }, [sound]);

  const handlePlay = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      } else {
        const newSound = await playSound(soundUrl);
        if (newSound) {
          setSound(newSound);
          
          // Listen for playback completion
          newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          });

          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: color }]}
      onPress={handlePlay}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{isPlaying ? '🔊' : '🔈'}</Text>
      <Text style={styles.text}>{isPlaying ? 'Playing...' : 'Play Vibe'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  text: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

