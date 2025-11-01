import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface AvatarDisplayProps {
  userId: Id<'users'>;
}

export function AvatarDisplay({ userId }: AvatarDisplayProps) {
  const [avatarName, setAvatarName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get avatar if exists
  const avatars = useQuery(api.ai.getUserAvatar, { userId });
  const avatar = avatars?.[0];

  const generateAvatar = useAction(api.ai.generateMoodAvatar);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateAvatar({ userId });
      Alert.alert('Success', 'Your mood avatar has been generated!');
    } catch (error) {
      console.error('Error generating avatar:', error);
      Alert.alert('Error', 'Failed to generate avatar');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!avatar) {
    return (
      <Card style={styles.container} variant="elevated">
        <Text style={styles.icon}>🎨</Text>
        <Text style={styles.title}>AI Mood Avatar</Text>
        <Text style={styles.subtitle}>
          Generate a unique avatar based on your emotional patterns
        </Text>
        <Button
          title={isGenerating ? 'Generating...' : 'Generate Avatar'}
          onPress={handleGenerate}
          loading={isGenerating}
          disabled={isGenerating}
        />
      </Card>
    );
  }

  return (
    <Card style={styles.container} variant="elevated">
      <View style={styles.avatarContainer}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>✨</Text>
        </View>
        <Text style={styles.avatarName}>{avatar.name}</Text>
        <Text style={styles.evolution}>Evolution: Level {avatar.evolution}</Text>
      </View>

      <View style={styles.patternContainer}>
        <Text style={styles.patternTitle}>Mood Pattern</Text>
        <View style={styles.patternList}>
          {avatar.moodPattern.map((mood, index) => (
            <View key={index} style={styles.patternItem}>
              <Text style={styles.patternText}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Button
        title="Regenerate Avatar"
        onPress={handleGenerate}
        loading={isGenerating}
        variant="outline"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  evolution: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  patternContainer: {
    width: '100%',
    marginBottom: 20,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  patternList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patternItem: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  patternText: {
    fontSize: 12,
    color: Colors.text,
  },
});

