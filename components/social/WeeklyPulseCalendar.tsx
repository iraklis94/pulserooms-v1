import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';
import { LinearGradient } from 'expo-linear-gradient';
import { getMoodById } from '@/constants/Moods';
import * as Haptics from 'expo-haptics';

interface WeeklyPulseCalendarProps {
  userId: Id<'users'>;
}

export function WeeklyPulseCalendar({ userId }: WeeklyPulseCalendarProps) {
  const calendar = useQuery(api.weeklyPulseCalendar.getCurrentWeek, { userId });
  const weeklyStats = useQuery(api.weeklyPulseCalendar.getWeeklyStats, { userId });
  const completeAssignment = useMutation(api.weeklyPulseCalendar.completeAssignment);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayPress = async (date: string, completed: boolean) => {
    if (completed) return;
    
    const today = new Date().toISOString().split('T')[0];
    if (date !== today) {
      // Can only complete today's assignment
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await completeAssignment({ userId, date });
    } catch (error) {
      console.error('Error completing assignment:', error);
    }
  };

  if (!calendar) {
    return (
      <Card style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📅</Text>
          <Text style={styles.emptyTitle}>No calendar yet</Text>
          <Text style={styles.emptySubtitle}>
            Your weekly pulse calendar will be generated on Sunday
          </Text>
        </View>
      </Card>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>This Week's Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeklyStats?.completedDays || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weeklyStats?.currentStreak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(weeklyStats?.completionRate || 0)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </Card>

      {/* Calendar */}
      <Card style={styles.calendarCard}>
        <Text style={styles.calendarTitle}>📅 Weekly Sync Calendar</Text>
        <Text style={styles.calendarSubtitle}>
          Match with friends each day to build your streak
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {calendar.assignments.map((assignment) => {
            const mood = getMoodById(assignment.mood);
            const isToday = assignment.date === today;
            const isPast = new Date(assignment.date) < new Date(today);
            const isFuture = new Date(assignment.date) > new Date(today);
            
            return (
              <TouchableOpacity
                key={assignment.date}
                style={[
                  styles.dayCard,
                  isToday && styles.dayCardToday,
                ]}
                onPress={() => handleDayPress(assignment.date, assignment.completed)}
                disabled={!isToday || assignment.completed}
              >
                <LinearGradient
                  colors={
                    assignment.completed
                      ? [assignment.color, assignment.color + 'CC']
                      : isFuture
                      ? [Colors.backgroundTertiary, Colors.backgroundSecondary]
                      : [Colors.backgroundSecondary, Colors.backgroundTertiary]
                  }
                  style={styles.dayGradient}
                >
                  <Text style={styles.dayName}>
                    {dayNames[assignment.dayOfWeek]}
                  </Text>
                  
                  <Text style={styles.dayDate}>
                    {new Date(assignment.date).getDate()}
                  </Text>

                  <View style={styles.moodContainer}>
                    <Text style={styles.moodEmoji}>
                      {mood?.emoji || '🎭'}
                    </Text>
                  </View>

                  {assignment.completed && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedText}>✓</Text>
                    </View>
                  )}

                  {isToday && !assignment.completed && (
                    <View style={styles.todayIndicator}>
                      <Text style={styles.todayText}>Today</Text>
                    </View>
                  )}

                  {isPast && !assignment.completed && (
                    <View style={styles.missedIndicator}>
                      <Text style={styles.missedText}>Missed</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Today's Match */}
        {calendar.assignments.find((a) => a.date === today) && (
          <View style={styles.todaySection}>
            <Text style={styles.todaySectionTitle}>Today's Sync Match</Text>
            {calendar.assignments.find((a) => a.date === today)?.matchedUserId ? (
              <View style={styles.matchCard}>
                <View style={styles.matchAvatar}>
                  <Text style={styles.matchAvatarEmoji}>👤</Text>
                </View>
                <View style={styles.matchInfo}>
                  <Text style={styles.matchText}>You're matched!</Text>
                  <Text style={styles.matchSubtext}>
                    Sync with your friend today
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.noMatchCard}>
                <Text style={styles.noMatchEmoji}>💫</Text>
                <Text style={styles.noMatchText}>Solo sync day</Text>
                <Text style={styles.noMatchSubtext}>
                  Complete your pulse to stay on track
                </Text>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>💡 How it works</Text>
        <View style={styles.infoList}>
          <Text style={styles.infoItem}>• New matches every Sunday</Text>
          <Text style={styles.infoItem}>• Sync with matched friends daily</Text>
          <Text style={styles.infoItem}>• Complete 7 days for rewards</Text>
          <Text style={styles.infoItem}>• Build streaks together</Text>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
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
  calendarCard: {
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  calendarSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  daysScroll: {
    paddingVertical: 8,
  },
  dayCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayGradient: {
    width: 80,
    height: 110,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    opacity: 0.7,
  },
  dayDate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  moodContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundTertiary + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  completedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 2,
  },
  todayText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  missedIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: Colors.error + '80',
    borderRadius: 8,
    paddingVertical: 2,
  },
  missedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  todaySection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  todaySectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
  },
  matchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  matchAvatarEmoji: {
    fontSize: 24,
  },
  matchInfo: {
    flex: 1,
  },
  matchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  matchSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noMatchCard: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    padding: 20,
    borderRadius: 12,
  },
  noMatchEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  noMatchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  noMatchSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
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
  },
});
