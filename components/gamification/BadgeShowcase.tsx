import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface BadgeShowcaseProps {
  userId: Id<'users'>;
}

const BADGE_INFO: Record<string, { emoji: string; name: string; description: string }> = {
  first_pulse: {
    emoji: '🌟',
    name: 'First Pulse',
    description: 'Created your first pulse',
  },
  streak_7: {
    emoji: '🔥',
    name: '7 Day Streak',
    description: 'Pulsed for 7 days straight',
  },
  streak_30: {
    emoji: '💪',
    name: '30 Day Warrior',
    description: 'Pulsed for 30 days straight',
  },
  streak_100: {
    emoji: '👑',
    name: 'Centurion',
    description: 'Achieved 100 day streak',
  },
  synced_souls: {
    emoji: '💫',
    name: 'Synced Souls',
    description: 'Successfully synced with a friend',
  },
  chain_starter: {
    emoji: '⛓️',
    name: 'Chain Starter',
    description: 'Started a chain reaching 50+ people',
  },
  fusion_master: {
    emoji: '✨',
    name: 'Fusion Master',
    description: 'Participated in a mood fusion event',
  },
  territory_champion: {
    emoji: '🏆',
    name: 'Territory Champion',
    description: 'Most active in your city',
  },
  early_bird: {
    emoji: '🌅',
    name: 'Early Bird',
    description: 'First pulse of the day in your area',
  },
  night_owl: {
    emoji: '🌙',
    name: 'Night Owl',
    description: 'Pulsed after midnight',
  },
};

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
  const badges = useQuery(api.users.getUserBadges, { userId });

  const renderBadge = ({ item }: { item: any }) => {
    const badgeInfo = BADGE_INFO[item.type] || {
      emoji: '🏅',
      name: item.type,
      description: 'Achievement unlocked',
    };

    return (
      <Card style={styles.badgeCard} variant="elevated">
        <Text style={styles.badgeEmoji}>{badgeInfo.emoji}</Text>
        <Text style={styles.badgeName}>{badgeInfo.name}</Text>
        <Text style={styles.badgeDescription}>{badgeInfo.description}</Text>
        <Text style={styles.badgeDate}>
          {new Date(item.earnedAt).toLocaleDateString()}
        </Text>
      </Card>
    );
  };

  if (!badges || badges.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🏅</Text>
        <Text style={styles.emptyText}>No badges yet</Text>
        <Text style={styles.emptySubtext}>
          Keep pulsing to earn achievements!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Badges ({badges.length})</Text>
      <FlatList
        data={badges}
        keyExtractor={(item) => item._id}
        renderItem={renderBadge}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  grid: {
    padding: 20,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  badgeCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  badgeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDate: {
    fontSize: 10,
    color: Colors.textTertiary,
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
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

