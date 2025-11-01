import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface QuestBoardProps {
  userId: Id<'users'>;
}

export function QuestBoard({ userId }: QuestBoardProps) {
  const activeQuests = useQuery(api.quests.getActive, { userId });
  const completedQuests = useQuery(api.quests.getCompleted, { userId });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Active Quests</Text>
      {activeQuests && activeQuests.length > 0 ? (
        activeQuests.map((quest) => (
          <Card key={quest._id} style={styles.questCard}>
            <View style={styles.questHeader}>
              <Text style={styles.questType}>
                {quest.type.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <View style={styles.timeRemaining}>
                <Text style={styles.timeText}>
                  {Math.floor((quest.expiresAt - Date.now()) / (1000 * 60 * 60))}h left
                </Text>
              </View>
            </View>

            <Text style={styles.questDescription}>{quest.description}</Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(quest.progress / quest.target) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {quest.progress} / {quest.target}
              </Text>
            </View>

            <View style={styles.rewardContainer}>
              <Text style={styles.rewardLabel}>Reward:</Text>
              <Text style={styles.rewardText}>{quest.reward}</Text>
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active quests. Check back tomorrow!</Text>
        </Card>
      )}

      {completedQuests && completedQuests.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.completedTitle]}>
            Completed ({completedQuests.length})
          </Text>
          {completedQuests.slice(0, 5).map((quest) => (
            <Card key={quest._id} style={styles.completedCard}>
              <View style={styles.completedHeader}>
                <Text style={styles.completedEmoji}>✅</Text>
                <Text style={styles.completedDescription}>{quest.description}</Text>
              </View>
              <Text style={styles.completedReward}>Earned: {quest.reward}</Text>
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  completedTitle: {
    marginTop: 30,
  },
  questCard: {
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 1,
  },
  timeRemaining: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: 'bold',
  },
  questDescription: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    padding: 10,
    borderRadius: 8,
  },
  rewardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.warning,
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
  completedCard: {
    marginBottom: 12,
    opacity: 0.7,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  completedDescription: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  completedReward: {
    fontSize: 12,
    color: Colors.success,
  },
  topChainCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  topChainMood: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  topChainReach: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

