import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { MoodPlaylistRecommendations } from '@/components/music/MoodPlaylistRecommendations';
import { Colors } from '@/constants/Colors';
import { MOODS } from '@/constants/Moods';

export default function MusicModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const moodId = (params.mood as string) || 'calm';
  const mood = MOODS.find((m) => m.id === moodId) || MOODS[0];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Music for {mood.name}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <MoodPlaylistRecommendations mood={mood.id} color={mood.color} />
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Music Recommendations</Text>
          <Text style={styles.infoText}>
            We curate Spotify playlists based on your current mood. 
            These playlists are designed to match or complement your emotional state.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoContainer: {
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});

