import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

// Clean up expired pulses every minute
crons.interval(
  'cleanup expired pulses',
  { minutes: 1 },
  internal.pulses.cleanupExpired
);

// Clean up expired rooms every minute
crons.interval(
  'cleanup expired rooms',
  { minutes: 1 },
  internal.rooms.cleanupExpired
);

// Clean up expired sync requests every 30 seconds
crons.interval(
  'cleanup expired sync requests',
  { seconds: 30 },
  internal.sync.cleanupExpired
);

// Clean up expired chains every hour
crons.interval(
  'cleanup expired chains',
  { hours: 1 },
  internal.chains.cleanupExpired
);

// Update territories every 30 seconds
crons.interval(
  'update territories',
  { seconds: 30 },
  internal.territories.updateTerritories
);

// Clean up stale territories every hour
crons.interval(
  'cleanup stale territories',
  { hours: 1 },
  internal.territories.cleanupStale
);

// Reset daily pulse limits at midnight UTC
crons.daily(
  'reset daily pulses',
  { hourUTC: 0, minuteUTC: 0 },
  internal.users.resetDailyPulses
);

// Clean up old challenges every day
crons.daily(
  'cleanup old challenges',
  { hourUTC: 2, minuteUTC: 0 },
  internal.challenges.cleanupOld
);

// Clean up expired chat messages every 5 minutes
crons.interval(
  'cleanup expired chat messages',
  { minutes: 5 },
  internal.chat.cleanupExpiredMessages
);

// Clean up inactive chat rooms every 10 minutes
crons.interval(
  'cleanup inactive chat rooms',
  { minutes: 10 },
  internal.chat.cleanupInactiveRooms
);

// Clean up expired quests every hour
crons.interval(
  'cleanup expired quests',
  { hours: 1 },
  internal.quests.cleanupExpired
);

// Clean up expired notifications daily
crons.daily(
  'cleanup expired notifications',
  { hourUTC: 3, minuteUTC: 0 },
  internal.notifications.cleanupExpired
);

export default crons;

