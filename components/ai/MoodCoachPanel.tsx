import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface MoodCoachPanelProps {
  userId: Id<'users'>;
}

export function MoodCoachPanel({ userId }: MoodCoachPanelProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const analyzeMoods = useAction(api.ai.analyzeMoodPatterns);
  const userStats = useQuery(api.pulses.getUserStats, { userId });

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeMoods({ userId });
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing moods:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.headerCard} variant="elevated">
        <Text style={styles.icon}>🤖</Text>
        <Text style={styles.title}>AI Mood Coach</Text>
        <Text style={styles.subtitle}>
          Get personalized insights about your emotional patterns
        </Text>

        {userStats && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userStats.totalPulses}</Text>
              <Text style={styles.statLabel}>Total Pulses</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{userStats.daysTracked}</Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
          </View>
        )}

        <Button
          title={loading ? 'Analyzing...' : 'Get AI Insights'}
          onPress={handleAnalyze}
          disabled={loading || !userStats || userStats.totalPulses < 5}
          loading={loading}
        />
      </Card>

      {analysis && (
        <>
          <Card style={styles.insightCard}>
            <Text style={styles.insightTitle}>Your Insights</Text>
            {analysis.insights.map((insight: string, index: number) => (
              <View key={index} style={styles.insightItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </Card>

          <Card style={styles.recommendationCard}>
            <Text style={styles.recommendationIcon}>💡</Text>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>{analysis.recommendation}</Text>
          </Card>

          {analysis.moodCounts && (
            <Card style={styles.moodBreakdownCard}>
              <Text style={styles.breakdownTitle}>Mood Breakdown</Text>
              {Object.entries(analysis.moodCounts).map(([mood, count]) => (
                <View key={mood} style={styles.moodRow}>
                  <Text style={styles.moodLabel}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </Text>
                  <View style={styles.moodBar}>
                    <View
                      style={[
                        styles.moodBarFill,
                        {
                          width: `${(Number(count) / userStats.totalPulses) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.moodCount}>{count as number}</Text>
                </View>
              ))}
            </Card>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  insightCard: {
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bullet: {
    color: Colors.primary,
    marginRight: 8,
    fontSize: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  recommendationCard: {
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
  },
  recommendationIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  moodBreakdownCard: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodLabel: {
    width: 100,
    fontSize: 14,
    color: Colors.text,
  },
  moodBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  moodBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  moodCount: {
    width: 30,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});

