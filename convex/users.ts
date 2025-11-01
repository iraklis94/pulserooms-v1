import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create or update user from Clerk webhook
export const upsertFromClerk = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        email: args.email,
        avatar: args.avatar,
      });
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert('users', {
      clerkId: args.clerkId,
      username: args.username,
      email: args.email,
      avatar: args.avatar,
      streakDays: 0,
      premiumStatus: false,
      totalPulses: 0,
      pulsesRemaining: 3, // Free tier: 3 pulses/day
      lastPulseReset: now,
    });
  },
});

// Get current user by Clerk ID
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first();
  },
});

// Get user by ID
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update streak (called after successful pulse)
export const updateStreak = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const now = Date.now();
    const lastPulse = user.lastPulseAt || 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSinceLastPulse = now - lastPulse;

    let newStreak = user.streakDays;

    if (timeSinceLastPulse < oneDayMs) {
      // Same day, no streak change
    } else if (timeSinceLastPulse < 2 * oneDayMs) {
      // Next day, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    await ctx.db.patch(args.userId, {
      streakDays: newStreak,
      lastPulseAt: now,
      totalPulses: user.totalPulses + 1,
    });

    // Award streak badges
    if (newStreak === 7) {
      await ctx.db.insert('badges', {
        userId: args.userId,
        type: 'streak_7',
        earnedAt: now,
      });
    } else if (newStreak === 30) {
      await ctx.db.insert('badges', {
        userId: args.userId,
        type: 'streak_30',
        earnedAt: now,
      });
    } else if (newStreak === 100) {
      await ctx.db.insert('badges', {
        userId: args.userId,
        type: 'streak_100',
        earnedAt: now,
      });
    }

    return newStreak;
  },
});

// Reset daily pulse limit (called by cron)
export const resetDailyPulses = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    const now = Date.now();

    for (const user of users) {
      if (user.premiumStatus) {
        // Premium users have unlimited pulses
        continue;
      }

      const resetLimit = 3; // Free tier limit
      await ctx.db.patch(user._id, {
        pulsesRemaining: resetLimit,
        lastPulseReset: now,
      });
    }
  },
});

// Decrement pulse count
export const decrementPulseCount = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return false;

    if (user.premiumStatus) {
      // Premium users never run out
      return true;
    }

    if (user.pulsesRemaining <= 0) {
      return false; // Out of pulses
    }

    await ctx.db.patch(args.userId, {
      pulsesRemaining: user.pulsesRemaining - 1,
    });

    return true;
  },
});

// Get user's badges
export const getUserBadges = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('badges')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Update premium status
export const updatePremiumStatus = mutation({
  args: {
    userId: v.id('users'),
    isPremium: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      premiumStatus: args.isPremium,
    });
  },
});

// Search users by username
export const searchByUsername = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const allUsers = await ctx.db.query('users').collect();
    return allUsers
      .filter((user) =>
        user.username.toLowerCase().includes(args.query.toLowerCase())
      )
      .slice(0, 10);
  },
});

