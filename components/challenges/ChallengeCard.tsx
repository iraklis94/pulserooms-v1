import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';

interface ChallengeCardProps {
  challenge: any;
  onJoin: () => void;
  isJoined: boolean;
}

export function ChallengeCard({ challenge, onJoin, isJoined }: ChallengeCardProps) {
  const timeRemaining = challenge.endDate - Date.now();
  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
  const isActive = timeRemaining > 0 && challenge.isActive;

  return (
    <Card style={styles.container} variant="elevated">
      {challenge.sponsor && (
        <View style={styles.sponsorBadge}>
          <Text style={styles.sponsorText}>Sponsored by {challenge.sponsor}</Text>
        </View>
      )}

      <LinearGradient
        colors={[Colors.primary + '20', 'transparent']}
        style={styles.gradient}
      >
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.description}>{challenge.description}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{challenge.participantIds.length}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{hoursLeft}h</Text>
            <Text style={styles.statLabel}>Remaining</Text>
          </View>
        </View>

        {isActive && (
          <Button
            title={isJoined ? 'Joined ✓' : 'Join Challenge'}
            onPress={onJoin}
            disabled={isJoined}
            variant={isJoined ? 'outline' : 'primary'}
          />
        )}

        {!isActive && (
          <View style={styles.endedBadge}>
            <Text style={styles.endedText}>Challenge Ended</Text>
          </View>
        )}
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  sponsorBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  sponsorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.background,
    letterSpacing: 0.5,
  },
  gradient: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
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
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  endedBadge: {
    backgroundColor: Colors.textTertiary + '20',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  endedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

