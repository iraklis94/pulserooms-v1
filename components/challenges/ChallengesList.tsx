import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ChallengeCard } from './ChallengeCard';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface ChallengesListProps {
  userId: Id<'users'>;
}

export function ChallengesList({ userId }: ChallengesListProps) {
  const activeChallenges = useQuery(api.challenges.getActive);
  const joinChallenge = useMutation(api.challenges.join);

  const handleJoin = async (challengeId: Id<'challenges'>) => {
    try {
      await joinChallenge({ challengeId, userId });
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  if (!activeChallenges || activeChallenges.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🎯</Text>
        <Text style={styles.emptyTitle}>No Active Challenges</Text>
        <Text style={styles.emptySubtitle}>Check back soon for new challenges!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={activeChallenges}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <ChallengeCard
          challenge={item}
          onJoin={() => handleJoin(item._id)}
          isJoined={item.participantIds.includes(userId)}
        />
      )}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 20,
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

