import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';
import { getMoodEmoji } from '@/utils/mood';

interface ChainVisualizationProps {
  userId: Id<'users'>;
}

export function ChainVisualization({ userId }: ChainVisualizationProps) {
  const userChains = useQuery(api.chains.getByStarter, { userId });
  const topChains = useQuery(api.chains.getTopChains, { limit: 10 });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Your Chains</Text>
      {userChains && userChains.length > 0 ? (
        userChains.map((chain) => (
          <Card key={chain._id} style={styles.chainCard}>
            <View style={styles.chainHeader}>
              <Text style={styles.chainEmoji}>{getMoodEmoji(chain.moodType)}</Text>
              <View style={styles.chainInfo}>
                <Text style={styles.chainMood}>
                  {chain.moodType.charAt(0).toUpperCase() + chain.moodType.slice(1)} Chain
                </Text>
                <Text style={styles.chainReach}>
                  🔗 Reached {chain.reachCount} people
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((chain.reachCount / 50) * 100, 100)}%`,
                    backgroundColor: chain.color,
                  },
                ]}
              />
            </View>

            {chain.reachCount >= 50 && (
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>✅ Badge Earned!</Text>
              </View>
            )}
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Start a pulse chain to connect with more people!</Text>
        </Card>
      )}

      <Text style={[styles.sectionTitle, styles.topChainsTitle]}>Top Global Chains</Text>
      {topChains?.map((chain, index) => (
        <Card key={chain._id} style={styles.topChainCard}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{index + 1}</Text>
          </View>
          <Text style={styles.chainEmoji}>{getMoodEmoji(chain.moodType)}</Text>
          <Text style={styles.topChainMood}>{chain.moodType}</Text>
          <Text style={styles.topChainReach}>{chain.reachCount} people</Text>
        </Card>
      ))}
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
  topChainsTitle: {
    marginTop: 30,
  },
  chainCard: {
    marginBottom: 12,
  },
  chainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chainEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  chainInfo: {
    flex: 1,
  },
  chainMood: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  chainReach: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  completeBadge: {
    backgroundColor: Colors.success + '20',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: 'bold',
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
  topChainCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    color: Colors.text,
    fontSize: 12,
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

