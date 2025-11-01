import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';
import { getMoodEmoji } from '@/utils/mood';

export default function CircleModal() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useUser();
  const [circleName, setCircleName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const circleId = params.circleId as Id<'moodCircles'> | undefined;

  // Get current user
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : 'skip'
  );

  // Get user's circles
  const userCircles = useQuery(
    api.circles.getUserCircles,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  // Get circle details if viewing specific circle
  const circleDetails = useQuery(
    api.circles.getDetails,
    circleId ? { circleId } : 'skip'
  );

  const circleAnalytics = useQuery(
    api.circles.getAnalytics,
    circleId ? { circleId } : 'skip'
  );

  // Mutations
  const createCircle = useMutation(api.circles.create);
  const addMember = useMutation(api.circles.addMember);
  const removeMember = useMutation(api.circles.removeMember);

  const handleCreateCircle = async () => {
    if (!circleName.trim() || !currentUser) {
      Alert.alert('Error', 'Please enter a circle name');
      return;
    }

    setIsCreating(true);
    try {
      const newCircleId = await createCircle({
        name: circleName,
        creatorId: currentUser._id,
      });

      Alert.alert('Success', 'Mood circle created!');
      setCircleName('');
      router.setParams({ circleId: newCircleId });
    } catch (error) {
      console.error('Error creating circle:', error);
      Alert.alert('Error', 'Failed to create circle');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLeaveCircle = async () => {
    if (!circleId || !currentUser) return;

    Alert.alert(
      'Leave Circle',
      'Are you sure you want to leave this circle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await removeMember({ circleId, userId: currentUser._id });
            router.back();
          },
        },
      ]
    );
  };

  // If viewing specific circle
  if (circleId && circleDetails) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{circleDetails.name}</Text>
          <TouchableOpacity onPress={handleLeaveCircle}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Circle analytics */}
          {circleAnalytics && (
            <Card style={styles.analyticsCard}>
              <Text style={styles.cardTitle}>Circle Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{circleAnalytics.stabilityScore}%</Text>
                  <Text style={styles.statLabel}>Stability</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{circleAnalytics.circleStreak}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{circleAnalytics.memberCount}</Text>
                  <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{circleAnalytics.totalPulses}</Text>
                  <Text style={styles.statLabel}>Pulses</Text>
                </View>
              </View>

              {circleAnalytics.dominantMood && (
                <View style={styles.dominantMood}>
                  <Text style={styles.dominantMoodEmoji}>
                    {getMoodEmoji(circleAnalytics.dominantMood)}
                  </Text>
                  <Text style={styles.dominantMoodText}>
                    Most common: {circleAnalytics.dominantMood}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {/* Members list */}
          <Card style={styles.membersCard}>
            <Text style={styles.cardTitle}>Members</Text>
            {circleDetails.members?.map((member) => (
              <View key={member._id} style={styles.memberItem}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberEmoji}>👤</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.username}</Text>
                  <Text style={styles.memberStreak}>
                    🔥 {member.streakDays} day streak
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Pulse history timeline */}
          <Card style={styles.historyCard}>
            <Text style={styles.cardTitle}>Recent Activity</Text>
            {circleDetails.pulseHistory.slice(-10).reverse().map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyEmoji}>{getMoodEmoji(entry.mood)}</Text>
                <Text style={styles.historyMood}>{entry.mood}</Text>
                <Text style={styles.historyTime}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      </View>
    );
  }

  // Default: Circle list and creation
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Mood Circles</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Create new circle */}
        <Card style={styles.createCard}>
          <Text style={styles.cardTitle}>Create New Circle</Text>
          <TextInput
            style={styles.input}
            placeholder="Circle name (e.g., My Squad)"
            placeholderTextColor={Colors.textTertiary}
            value={circleName}
            onChangeText={setCircleName}
          />
          <Button
            title="Create Circle"
            onPress={handleCreateCircle}
            disabled={!circleName.trim()}
            loading={isCreating}
          />
        </Card>

        {/* User's circles */}
        <Text style={styles.sectionTitle}>Your Circles</Text>
        {userCircles && userCircles.length > 0 ? (
          userCircles.map((circle) => (
            <TouchableOpacity
              key={circle._id}
              onPress={() => router.setParams({ circleId: circle._id })}
            >
              <Card style={styles.circleItem}>
                <View style={styles.circleHeader}>
                  <Text style={styles.circleName}>{circle.name}</Text>
                  <Text style={styles.circleBadge}>
                    {circle.memberIds.length} members
                  </Text>
                </View>
                <View style={styles.circleStats}>
                  <Text style={styles.circleStatText}>
                    🔥 {circle.circleStreak} streak
                  </Text>
                  <Text style={styles.circleStatText}>
                    📊 {circle.stabilityScore}% stable
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No circles yet. Create one to get started!
            </Text>
          </Card>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  close: {
    fontSize: 24,
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  createCard: {
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  circleItem: {
    marginBottom: 12,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  circleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  circleBadge: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  circleStats: {
    flexDirection: 'row',
    gap: 16,
  },
  circleStatText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  analyticsCard: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dominantMood: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundTertiary,
    padding: 12,
    borderRadius: 12,
  },
  dominantMoodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  dominantMoodText: {
    fontSize: 14,
    color: Colors.text,
  },
  membersCard: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberEmoji: {
    fontSize: 20,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  memberStreak: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyCard: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  historyMood: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  historyTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

