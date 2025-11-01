import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { FriendsList } from '@/components/social/FriendsList';
import { SyncPulseModal } from '@/components/social/SyncPulseModal';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

export default function FriendsModal() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedSyncRequest, setSelectedSyncRequest] = useState<{
    requestId: Id<'syncPulseRequests'>;
    fromUsername: string;
    color: string;
  } | null>(null);

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : 'skip'
  );

  const friends = useQuery(
    api.friendships.getFriends,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const pendingRequests = useQuery(
    api.friendships.getPendingRequests,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const pendingSyncRequests = useQuery(
    api.sync.getPendingRequests,
    currentUser ? { userId: currentUser._id } : 'skip'
  );

  const sendFriendRequest = useMutation(api.friendships.sendRequest);
  const acceptFriendRequest = useMutation(api.friendships.acceptRequest);

  // Get usernames for sync requests
  const syncRequestUsers = useQuery(
    api.users.getMultipleByIds,
    pendingSyncRequests && pendingSyncRequests.length > 0
      ? { userIds: pendingSyncRequests.map((r) => r.fromUserId) }
      : 'skip'
  );

  // Show sync pulse modal if there are pending requests
  useEffect(() => {
    if (pendingSyncRequests && pendingSyncRequests.length > 0 && !selectedSyncRequest && syncRequestUsers) {
      const request = pendingSyncRequests[0];
      const fromUser = syncRequestUsers.find((u) => u._id === request.fromUserId);
      setSelectedSyncRequest({
        requestId: request._id,
        fromUsername: fromUser?.username || 'Friend',
        color: request.color,
      });
    }
  }, [pendingSyncRequests, syncRequestUsers, selectedSyncRequest]);

  const handleAddFriend = async () => {
    Alert.prompt(
      'Add Friend',
      'Enter username to add',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: async (username) => {
            if (!username || !currentUser) return;
            // In production, you'd search for user by username first
            Alert.alert('Info', 'Friend search feature coming soon!');
          },
        },
      ],
      'plain-text'
    );
  };

  const handleAcceptFriendRequest = async (friendshipId: Id<'friendships'>) => {
    try {
      await acceptFriendRequest({ friendshipId });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Friends</Text>
        <TouchableOpacity onPress={handleAddFriend} style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Pending Friend Requests */}
        {pendingRequests && pendingRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            {pendingRequests.map((request) => (
              <Card key={request._id} style={styles.requestCard}>
                <View style={styles.requestContent}>
                  <Text style={styles.requestText}>Friend request</Text>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptFriendRequest(request._id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Friends List */}
        {currentUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Your Friends {friends && friends.length > 0 && `(${friends.length})`}
            </Text>
            {friends && friends.length > 0 ? (
              <FriendsList
                friends={friends.map((f) => ({
                  _id: f._id,
                  username: f.username,
                  avatar: f.avatar,
                  lastPulseAt: f.lastPulseAt,
                  streakDays: f.streakDays,
                }))}
                currentUserId={currentUser._id}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyTitle}>No friends yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add friends to sync pulses together
                </Text>
                <TouchableOpacity
                  style={styles.addFriendButton}
                  onPress={handleAddFriend}
                >
                  <Text style={styles.addFriendButtonText}>Add Friend</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sync Pulse Modal */}
      {selectedSyncRequest && (
        <SyncPulseModal
          visible={!!selectedSyncRequest}
          requestId={selectedSyncRequest.requestId}
          fromUsername={selectedSyncRequest.fromUsername}
          color={selectedSyncRequest.color}
          onClose={() => setSelectedSyncRequest(null)}
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 28,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  requestCard: {
    marginBottom: 12,
  },
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestText: {
    fontSize: 16,
    color: Colors.text,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFriendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFriendButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

