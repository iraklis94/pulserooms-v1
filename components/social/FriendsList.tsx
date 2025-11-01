import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SyncPulseButton } from './SyncPulseButton';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface Friend {
  _id: Id<'users'>;
  username: string;
  avatar?: string;
  lastPulseAt?: number;
  streakDays: number;
}

interface FriendsListProps {
  friends: Friend[];
  currentUserId: Id<'users'>;
  currentMood?: string;
  currentColor?: string;
}

export function FriendsList({
  friends,
  currentUserId,
  currentMood,
  currentColor,
}: FriendsListProps) {
  const isOnline = (lastPulseAt?: number) => {
    if (!lastPulseAt) return false;
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    return lastPulseAt > fiveMinutesAgo;
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <Card style={styles.friendCard}>
      <View style={styles.friendHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          {isOnline(item.lastPulseAt) && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.friendInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.streak}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{item.streakDays} day streak</Text>
          </View>
        </View>
      </View>

      <SyncPulseButton
        fromUserId={currentUserId}
        toUserId={item._id}
        currentMood={currentMood}
        currentColor={currentColor}
      />
    </Card>
  );

  if (friends.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>👥</Text>
        <Text style={styles.emptyTitle}>No friends yet</Text>
        <Text style={styles.emptySubtitle}>
          Add friends to sync pulses together
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item._id}
      renderItem={renderFriend}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
  },
  friendCard: {
    marginBottom: 16,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.backgroundSecondary,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    color: Colors.textSecondary,
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

