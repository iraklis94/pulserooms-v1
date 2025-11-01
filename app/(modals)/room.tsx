import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';
import { PulseCircle } from '@/components/mood/PulseCircle';
import { ParticleExplosion } from '@/components/animations/ParticleExplosion';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

const { width, height } = Dimensions.get('window');

export default function RoomModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();
  const [showFusion, setShowFusion] = useState(false);
  const [fusionColor, setFusionColor] = useState<string | null>(null);

  // Get room details
  const roomId = params.roomId as Id<'rooms'> | undefined;
  const room = useQuery(
    api.rooms.getActive,
    roomId ? { roomId } : 'skip'
  );

  const fusionColorCalc = useQuery(
    api.rooms.calculateFusionColor,
    roomId && room?.isFusion ? { roomId } : 'skip'
  );

  const leaveRoom = useMutation(api.rooms.leave);

  // Get current user
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : 'skip'
  );

  useEffect(() => {
    if (room?.isFusion && !showFusion) {
      // Trigger fusion animation
      setShowFusion(true);
      setFusionColor(fusionColorCalc || room.color);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Hide fusion animation after 3 seconds
      setTimeout(() => {
        setShowFusion(false);
      }, 3000);
    }
  }, [room?.isFusion]);

  const handleLeave = async () => {
    if (roomId && currentUser) {
      await leaveRoom({ roomId, userId: currentUser._id });
    }
    router.back();
  };

  if (!room) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading room...</Text>
      </View>
    );
  }

  const backgroundColor = fusionColor || room.color;

  return (
    <LinearGradient
      colors={[backgroundColor, backgroundColor + 'CC', Colors.background]}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Fusion animation overlay */}
      {showFusion && fusionColor && (
        <View style={StyleSheet.absoluteFill}>
          <ParticleExplosion
            centerX={width / 2}
            centerY={height / 2}
            color={fusionColor}
            particleCount={50}
          />
          <View style={styles.fusionOverlay}>
            <Text style={styles.fusionText}>FUSION! ✨</Text>
            <Text style={styles.fusionSubtext}>
              10+ people synced their emotions
            </Text>
          </View>
        </View>
      )}

      {/* Main content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleLeave} style={styles.backButton}>
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Central pulse visualization */}
          <View style={styles.pulseContainer}>
            <PulseCircle color={backgroundColor} size={200} duration={1500} />
            
            {room.isFusion && (
              <View style={styles.fusionBadge}>
                <Text style={styles.fusionBadgeText}>FUSION</Text>
              </View>
            )}
          </View>

          {/* Room info */}
          <Text style={styles.roomTitle}>
            {room.mood.charAt(0).toUpperCase() + room.mood.slice(1)} Room
          </Text>
          <Text style={styles.roomSubtitle}>
            {room.activeUserIds.length} {room.activeUserIds.length === 1 ? 'person' : 'people'} feeling this with you
          </Text>

          {/* Participant avatars */}
          <View style={styles.participantsContainer}>
            {room.activeUserIds.slice(0, 8).map((userId, index) => (
              <View
                key={userId}
                style={[
                  styles.participantAvatar,
                  {
                    backgroundColor: backgroundColor + '80',
                    transform: [{ scale: 1 - index * 0.05 }],
                    zIndex: 8 - index,
                  },
                ]}
              >
                <Text style={styles.participantEmoji}>👤</Text>
              </View>
            ))}
            {room.activeUserIds.length > 8 && (
              <View style={styles.moreParticipants}>
                <Text style={styles.moreText}>+{room.activeUserIds.length - 8}</Text>
              </View>
            )}
          </View>

          {/* Room stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor((room.expiresAt - Date.now()) / 1000)}s</Text>
              <Text style={styles.statLabel}>remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{room.activeUserIds.length}</Text>
              <Text style={styles.statLabel}>active</Text>
            </View>
          </View>
        </View>

        {/* Leave button */}
        <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
          <Text style={styles.leaveText}>Leave Room</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text,
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pulseContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  fusionBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fusionBadgeText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  roomTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  roomSubtitle: {
    fontSize: 18,
    color: Colors.text,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 30,
  },
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -8,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  participantEmoji: {
    fontSize: 24,
  },
  moreParticipants: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: Colors.text,
  },
  moreText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.7,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 20,
  },
  leaveButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  leaveText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  fusionOverlay: {
    position: 'absolute',
    top: height / 3,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fusionText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  fusionSubtext: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 10,
    textAlign: 'center',
  },
});


