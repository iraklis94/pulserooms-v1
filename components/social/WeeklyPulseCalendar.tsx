import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';
import { format, startOfWeek, addDays, isToday, isPast } from 'date-fns';

const { width } = Dimensions.get('window');

interface WeeklyPulseCalendarProps {
  userId: Id<'users'>;
}

interface DayAssignment {
  dayOfWeek: number;
  partner: {
    _id: Id<'users'>;
    username: string;
    avatar?: string;
  } | null;
  date: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function WeeklyPulseCalendar({ userId }: WeeklyPulseCalendarProps) {
  const assignments = useQuery(api.weeklyPulses.getCurrentWeekAssignments, {
    userId,
  });

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Sunday

  const [dayAssignments, setDayAssignments] = useState<DayAssignment[]>([]);

  useEffect(() => {
    if (assignments) {
      const days: DayAssignment[] = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const assignment = assignments.find((a) => a.dayOfWeek === i);
        days.push({
          dayOfWeek: i,
          partner: assignment
            ? {
                _id: assignment.partnerId,
                username: 'Loading...', // Will be populated when we fetch user data
              }
            : null,
          date,
        });
      }
      setDayAssignments(days);
    }
  }, [assignments, weekStart]);

  // Fetch partner details for each assignment
  const partnerIds = assignments
    ?.map((a) => a.partnerId)
    .filter((id, index, self) => self.indexOf(id) === index) || [];

  const partners = useQuery(
    api.users.getMultipleByIds,
    partnerIds.length > 0 ? { userIds: partnerIds } : 'skip'
  );

  // Update dayAssignments with partner info
  useEffect(() => {
    if (assignments && partners) {
      const partnerMap = new Map(
        partners.map((p) => [p._id, { _id: p._id, username: p.username, avatar: p.avatar }])
      );

      const days: DayAssignment[] = [];
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const assignment = assignments.find((a) => a.dayOfWeek === i);
        days.push({
          dayOfWeek: i,
          partner: assignment?.partnerId
            ? partnerMap.get(assignment.partnerId) || null
            : null,
          date,
        });
      }
      setDayAssignments(days);
    }
  }, [assignments, partners, weekStart]);

  const renderDay = (dayAssignment: DayAssignment, index: number) => {
    const dayDate = dayAssignment.date;
    const isDayToday = isToday(dayDate);
    const isDayPast = isPast(dayDate) && !isDayToday;
    const hasPartner = dayAssignment.partner !== null;

    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    useEffect(() => {
      opacity.value = withDelay(
        index * 100,
        withTiming(1, { duration: 300 })
      );
      translateY.value = withDelay(
        index * 100,
        withTiming(0, { duration: 300 })
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <Animated.View key={dayAssignment.dayOfWeek} style={animatedStyle}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.dayCard,
            isDayToday && styles.dayCardToday,
            isDayPast && styles.dayCardPast,
            !hasPartner && styles.dayCardEmpty,
          ]}
        >
          <LinearGradient
            colors={
              isDayToday
                ? [Colors.primary + '40', Colors.primary + '10']
                : hasPartner
                ? [Colors.secondary + '20', Colors.secondary + '05']
                : [Colors.backgroundTertiary, Colors.backgroundSecondary]
            }
            style={styles.dayGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dayHeader}>
              <Text style={[styles.dayName, isDayToday && styles.dayNameToday]}>
                {DAYS[dayAssignment.dayOfWeek]}
              </Text>
              {isDayToday && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayBadgeText}>TODAY</Text>
                </View>
              )}
            </View>

            <Text style={[styles.dayDate, isDayToday && styles.dayDateToday]}>
              {format(dayDate, 'MMM d')}
            </Text>

            {hasPartner ? (
              <View style={styles.partnerInfo}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerEmoji}>
                    {dayAssignment.partner?.avatar || '👤'}
                  </Text>
                </View>
                <Text style={styles.partnerName} numberOfLines={1}>
                  {dayAssignment.partner?.username || 'Unknown'}
                </Text>
                <View style={styles.syncBadge}>
                  <Text style={styles.syncEmoji}>💫</Text>
                  <Text style={styles.syncText}>Sync Pulse</Text>
                </View>
              </View>
            ) : (
              <View style={styles.noPartnerInfo}>
                <Text style={styles.noPartnerEmoji}>✨</Text>
                <Text style={styles.noPartnerText}>No assignment</Text>
                <Text style={styles.noPartnerSubtext}>
                  Add friends to get matched
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const currentDayAssignment = dayAssignments.find((d) => isToday(d.date));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Pulse Calendar</Text>
          <Text style={styles.subtitle}>
            Your sync pulse matches for this week
          </Text>
        </View>
        {currentDayAssignment?.partner && (
          <View style={styles.todayPartnerBadge}>
            <Text style={styles.todayPartnerLabel}>Today's Partner</Text>
            <Text style={styles.todayPartnerName}>
              {currentDayAssignment.partner.username}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarContent}
        style={styles.calendarScroll}
      >
        {dayAssignments.map((dayAssignment, index) =>
          renderDay(dayAssignment, index)
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Resets every Sunday with new matches
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  todayPartnerBadge: {
    marginTop: 12,
    backgroundColor: Colors.primary + '20',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  todayPartnerLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  todayPartnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  calendarScroll: {
    marginHorizontal: -20,
  },
  calendarContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  dayCard: {
    width: width * 0.4,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dayCardToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayCardPast: {
    opacity: 0.6,
  },
  dayCardEmpty: {
    opacity: 0.5,
  },
  dayGradient: {
    padding: 16,
    minHeight: 180,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  dayNameToday: {
    color: Colors.primary,
    fontSize: 18,
  },
  todayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dayDate: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginBottom: 16,
  },
  dayDateToday: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  partnerInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerEmoji: {
    fontSize: 24,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  syncEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  noPartnerInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  noPartnerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  noPartnerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  noPartnerSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
