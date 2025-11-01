import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { getMoodEmoji, getMoodLabel } from '@/utils/mood';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

interface PulseItemProps {
  pulse: any;
  index: number;
}

function PulseItem({ pulse, index }: PulseItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withTiming(0, { duration: 300 });

    // Calculate time remaining until expiration
    const timeRemaining = pulse.expiresAt - Date.now();
    
    // Start fade out 5 seconds before expiration
    if (timeRemaining > 5000) {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 5000 });
      }, timeRemaining - 5000);
    } else {
      // Already close to expiring, fade out immediately
      opacity.value = withTiming(0, { duration: timeRemaining });
    }
  }, [pulse._id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const timeAgo = () => {
    const seconds = Math.floor((Date.now() - pulse._creationTime) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    return '1m ago';
  };

  return (
    <Animated.View style={[styles.pulseItem, animatedStyle]}>
      <LinearGradient
        colors={[pulse.color + '40', pulse.color + '10']}
        style={styles.pulseGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.pulseHeader}>
          <Text style={styles.pulseEmoji}>{getMoodEmoji(pulse.mood)}</Text>
          <View style={styles.pulseInfo}>
            <Text style={styles.pulseMood}>{getMoodLabel(pulse.mood)}</Text>
            <Text style={styles.pulseTime}>{timeAgo()}</Text>
          </View>
          <View style={[styles.intensityIndicator, { width: `${pulse.moodIntensity}%` }]} />
        </View>

        {pulse.note && (
          <Text style={styles.pulseNote}>"{pulse.note}"</Text>
        )}

        <View style={styles.pulseActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>✨</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionEmoji}>👋</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

export default function FeedScreen() {
  const livePulses = useQuery(api.pulses.getLive);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to top when new pulses arrive
  useEffect(() => {
    if (livePulses && livePulses.length > 0) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [livePulses?.length]);

  const sortedPulses = livePulses
    ? [...livePulses].sort((a, b) => b._creationTime - a._creationTime)
    : [];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Pulse Timeline</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {sortedPulses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💭</Text>
          <Text style={styles.emptyTitle}>No pulses yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to share your emotions!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={sortedPulses}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <PulseItem pulse={item} index={index} />
          )}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: 6,
  },
  liveText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  feedContent: {
    padding: 20,
  },
  pulseItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  pulseGradient: {
    padding: 16,
  },
  pulseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pulseEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  pulseInfo: {
    flex: 1,
  },
  pulseMood: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  pulseTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  intensityIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  pulseNote: {
    fontSize: 14,
    color: Colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 20,
  },
  pulseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

