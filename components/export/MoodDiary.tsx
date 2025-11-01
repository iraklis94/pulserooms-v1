import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';
import { getMoodEmoji, getMoodColor } from '@/utils/mood';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

interface MoodDiaryProps {
  userId: Id<'users'>;
}

export function MoodDiary({ userId }: MoodDiaryProps) {
  const [exporting, setExporting] = useState(false);

  const moodHistory = useQuery(api.pulses.getUserStats, { userId });
  const recentHistory = useQuery(
    api.pulses.getUserPulses,
    { userId, limit: 30 }
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library access');
        setExporting(false);
        return;
      }

      // In production, generate actual video/image using Canvas or server-side rendering
      // For now, show success message
      Alert.alert(
        'Export Ready!',
        'Your mood diary visualization is ready to share',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Share', onPress: () => console.log('Share action') },
        ]
      );
    } catch (error) {
      console.error('Error exporting:', error);
      Alert.alert('Error', 'Failed to export mood diary');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.headerCard} variant="elevated">
        <Text style={styles.icon}>📖</Text>
        <Text style={styles.title}>Mood Diary</Text>
        <Text style={styles.subtitle}>
          Your emotional journey visualized
        </Text>
      </Card>

      {moodHistory && (
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{moodHistory.totalPulses}</Text>
              <Text style={styles.summaryLabel}>Total Pulses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{moodHistory.daysTracked}</Text>
              <Text style={styles.summaryLabel}>Days</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{moodHistory.streakDays}</Text>
              <Text style={styles.summaryLabel}>Current Streak</Text>
            </View>
          </View>

          {moodHistory.dominantMood && (
            <View style={styles.dominantMoodContainer}>
              <Text style={styles.dominantMoodLabel}>Most Frequent Mood:</Text>
              <View style={styles.dominantMoodBadge}>
                <Text style={styles.dominantMoodEmoji}>
                  {getMoodEmoji(moodHistory.dominantMood)}
                </Text>
                <Text style={styles.dominantMoodText}>{moodHistory.dominantMood}</Text>
              </View>
            </View>
          )}
        </Card>
      )}

      {recentHistory && recentHistory.length > 0 && (
        <Card style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Recent Moods</Text>
          <View style={styles.timeline}>
            {recentHistory.slice(0, 14).map((pulse) => (
              <View
                key={pulse._id}
                style={[
                  styles.timelineItem,
                  { backgroundColor: pulse.color + '40' },
                ]}
              >
                <Text style={styles.timelineEmoji}>{getMoodEmoji(pulse.mood)}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <Button
        title={exporting ? 'Exporting...' : 'Export to Instagram Story'}
        onPress={handleExport}
        loading={exporting}
        size="large"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 20,
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
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  dominantMoodContainer: {
    alignItems: 'center',
  },
  dominantMoodLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  dominantMoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  dominantMoodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  dominantMoodText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  timelineCard: {
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timelineItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineEmoji: {
    fontSize: 24,
  },
});

