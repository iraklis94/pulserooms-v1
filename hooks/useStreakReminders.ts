import { useEffect } from 'react';
import { scheduleNotification, cancelAllNotifications } from '@/services/notifications';

export function useStreakReminders(
  userId: string | undefined,
  streakDays: number,
  lastPulseAt: number | undefined
) {
  useEffect(() => {
    if (!userId) return;

    const setupReminder = async () => {
      // Cancel existing notifications
      await cancelAllNotifications();

      // Check if user pulsed today
      const now = Date.now();
      const lastPulse = lastPulseAt || 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      const timeSinceLastPulse = now - lastPulse;

      // If haven't pulsed today and have a streak, send reminder
      if (timeSinceLastPulse > oneDayMs && streakDays > 0) {
        // Schedule reminder for 6 PM today
        const today = new Date();
        const reminderTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          18,
          0,
          0
        );

        if (reminderTime > new Date()) {
          await scheduleNotification(
            '🔥 Keep your streak alive!',
            `You have a ${streakDays} day streak. Don't break it!`,
            { type: 'streak_reminder' },
            { date: reminderTime }
          );
        }
      }

      // Schedule milestone celebration
      if (streakDays === 6 || streakDays === 29 || streakDays === 99) {
        await scheduleNotification(
          '🎯 Milestone approaching!',
          `One more day to reach ${streakDays + 1} days!`,
          { type: 'milestone_reminder' },
          { seconds: 60 * 60 * 12 } // 12 hours from now
        );
      }
    };

    setupReminder();
  }, [userId, streakDays, lastPulseAt]);
}

