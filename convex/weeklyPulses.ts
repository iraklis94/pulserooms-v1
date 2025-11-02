import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { Id } from './_generated/dataModel';

// Helper function to get Sunday of a given date
function getSundayOfWeek(date: Date): string {
  const day = date.getDay();
  const diff = date.getDate() - day; // Subtract days to get to Sunday
  const sunday = new Date(date);
  sunday.setDate(diff);
  return sunday.toISOString().split('T')[0]; // YYYY-MM-DD format
}

// Get the current week's assignments for a user
export const getCurrentWeekAssignments = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const today = new Date();
    const weekStart = getSundayOfWeek(new Date(today));

    const assignments = await ctx.db
      .query('weeklyPulseAssignments')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStartDate', weekStart)
      )
      .collect();

    return assignments.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  },
});

// Get assignment for a specific day
export const getAssignmentForDay = query({
  args: {
    userId: v.id('users'),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const date = new Date(args.date);
    const weekStart = getSundayOfWeek(new Date(date));
    const dayOfWeek = date.getDay();

    const assignment = await ctx.db
      .query('weeklyPulseAssignments')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStartDate', weekStart)
      )
      .filter((q) => q.eq(q.field('dayOfWeek'), dayOfWeek))
      .first();

    if (!assignment) return null;

    const partner = await ctx.db.get(assignment.partnerId);
    return {
      ...assignment,
      partner: partner
        ? {
            _id: partner._id,
            username: partner.username,
            avatar: partner.avatar,
          }
        : null,
    };
  },
});

// Assign pulses for the week (called every Sunday)
export const assignWeeklyPulses = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    const weekStart = getSundayOfWeek(new Date(today));
    const weekStartDate = new Date(weekStart);

    // Check if assignments already exist for this week
    const existing = await ctx.db
      .query('weeklyPulseAssignments')
      .withIndex('by_week', (q) => q.eq('weekStartDate', weekStart))
      .first();

    if (existing) {
      // Already assigned this week
      return;
    }

    // Get all users who have friends
    const allUsers = await ctx.db.query('users').collect();

    // Get friendships for each user
    const usersWithFriends: Array<{
      userId: Id<'users'>;
      friendIds: Id<'users'>[];
    }> = [];

    for (const user of allUsers) {
      const friendships = await ctx.db
        .query('friendships')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('status'), 'accepted'))
        .collect();

      const friendIds = friendships.map((f) => f.friendId);
      if (friendIds.length > 0) {
        usersWithFriends.push({
          userId: user._id,
          friendIds,
        });
      }
    }

    // If no users with friends, return early
    if (usersWithFriends.length === 0) {
      return;
    }

    // Create assignments for each day of the week (Sunday = 0 to Saturday = 6)
    const createdAt = Date.now();
    const shuffledUsers = [...usersWithFriends].sort(() => Math.random() - 0.5);

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // For each user, assign a random friend for this day
      for (const userData of shuffledUsers) {
        if (userData.friendIds.length === 0) continue;

        // Pick a random friend
        const randomFriendIndex = Math.floor(
          Math.random() * userData.friendIds.length
        );
        const partnerId = userData.friendIds[randomFriendIndex];

        // Create assignment
        await ctx.db.insert('weeklyPulseAssignments', {
          userId: userData.userId,
          partnerId,
          weekStartDate: weekStart,
          dayOfWeek,
          createdAt,
        });

        // Also create reciprocal assignment if partner has user as friend
        const partnerFriendships = await ctx.db
          .query('friendships')
          .withIndex('by_user', (q) => q.eq('userId', partnerId))
          .filter((q) => q.eq(q.field('status'), 'accepted'))
          .collect();

        const partnerFriendIds = partnerFriendships.map((f) => f.friendId);
        if (partnerFriendIds.includes(userData.userId)) {
          await ctx.db.insert('weeklyPulseAssignments', {
            userId: partnerId,
            partnerId: userData.userId,
            weekStartDate: weekStart,
            dayOfWeek,
            createdAt,
          });
        }
      }
    }
  },
});

// Reset weekly assignments (called every Sunday)
export const resetWeeklyAssignments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date();
    
    // Only reset on Sundays (day 0)
    if (today.getDay() !== 0) {
      return;
    }
    
    const weekStart = getSundayOfWeek(new Date(today));

    // Delete old assignments (older than this week)
    const allAssignments = await ctx.db
      .query('weeklyPulseAssignments')
      .collect();

    for (const assignment of allAssignments) {
      if (assignment.weekStartDate < weekStart) {
        await ctx.db.delete(assignment._id);
      }
    }

    // Create new assignments for this week (inline logic from assignWeeklyPulses)
    const allUsers = await ctx.db.query('users').collect();

    // Get friendships for each user
    const usersWithFriends: Array<{
      userId: Id<'users'>;
      friendIds: Id<'users'>[];
    }> = [];

    for (const user of allUsers) {
      const friendships = await ctx.db
        .query('friendships')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('status'), 'accepted'))
        .collect();

      const friendIds = friendships.map((f) => f.friendId);
      if (friendIds.length > 0) {
        usersWithFriends.push({
          userId: user._id,
          friendIds,
        });
      }
    }

    // If no users with friends, return early
    if (usersWithFriends.length === 0) {
      return;
    }

    // Create assignments for each day of the week (Sunday = 0 to Saturday = 6)
    const createdAt = Date.now();
    const shuffledUsers = [...usersWithFriends].sort(() => Math.random() - 0.5);

    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      // For each user, assign a random friend for this day
      for (const userData of shuffledUsers) {
        if (userData.friendIds.length === 0) continue;

        // Pick a random friend
        const randomFriendIndex = Math.floor(
          Math.random() * userData.friendIds.length
        );
        const partnerId = userData.friendIds[randomFriendIndex];

        // Create assignment
        await ctx.db.insert('weeklyPulseAssignments', {
          userId: userData.userId,
          partnerId,
          weekStartDate: weekStart,
          dayOfWeek,
          createdAt,
        });

        // Also create reciprocal assignment if partner has user as friend
        const partnerFriendships = await ctx.db
          .query('friendships')
          .withIndex('by_user', (q) => q.eq('userId', partnerId))
          .filter((q) => q.eq(q.field('status'), 'accepted'))
          .collect();

        const partnerFriendIds = partnerFriendships.map((f) => f.friendId);
        if (partnerFriendIds.includes(userData.userId)) {
          await ctx.db.insert('weeklyPulseAssignments', {
            userId: partnerId,
            partnerId: userData.userId,
            weekStartDate: weekStart,
            dayOfWeek,
            createdAt,
          });
        }
      }
    }
  },
});

// Get partner info for today's sync pulse
export const getTodayPartner = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const weekStart = getSundayOfWeek(new Date(today));
    const dayOfWeek = today.getDay();

    const assignment = await ctx.db
      .query('weeklyPulseAssignments')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStartDate', weekStart)
      )
      .filter((q) => q.eq(q.field('dayOfWeek'), dayOfWeek))
      .first();

    if (!assignment) return null;

    const partner = await ctx.db.get(assignment.partnerId);
    return partner
      ? {
          _id: partner._id,
          username: partner.username,
          avatar: partner.avatar,
        }
      : null;
  },
});
