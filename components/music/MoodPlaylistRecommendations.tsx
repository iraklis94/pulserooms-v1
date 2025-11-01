import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { searchPlaylistsForMood } from '@/services/spotify';

interface MoodPlaylistRecommendationsProps {
  mood: string;
  color: string;
}

export function MoodPlaylistRecommendations({ mood, color }: MoodPlaylistRecommendationsProps) {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylists = async () => {
      setLoading(true);
      const results = await searchPlaylistsForMood(mood);
      setPlaylists(results);
      setLoading(false);
    };

    loadPlaylists();
  }, [mood]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Finding playlists for your mood...</Text>
      </View>
    );
  }

  if (playlists.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Playlists for your mood</Text>
      <FlatList
        data={playlists.slice(0, 5)}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playlistCard}
            onPress={() => console.log('Open playlist:', item.id)}
            activeOpacity={0.8}
          >
            <Card style={styles.card}>
              {item.images?.[0]?.url && (
                <Image
                  source={{ uri: item.images[0].url }}
                  style={styles.image}
                />
              )}
              <Text style={styles.playlistName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={[styles.spotifyBadge, { backgroundColor: color }]}>
                <Text style={styles.spotifyText}>▶ Spotify</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  playlistCard: {
    marginRight: 12,
  },
  card: {
    width: 150,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: Colors.backgroundTertiary,
  },
  playlistName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    padding: 12,
    paddingBottom: 8,
    lineHeight: 16,
  },
  spotifyBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  spotifyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.text,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

