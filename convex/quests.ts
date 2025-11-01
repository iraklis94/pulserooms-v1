import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

// Create a new quest for a user
export const create = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    description: v.string(),
    target: v.number(),
    reward: v.string(),
    durationHours: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + args.durationHours * 60 * 60 * 1000;

    return await ctx.db.insert('quests', {
      userId: args.userId,
      type: args.type,
      description: args.description,
      progress: 0,
      target: args.target,
      reward: args.reward,
      expiresAt,
    });
  },
});

// Update quest progress
export const updateProgress = mutation({
  args: {
    questId: v.id('quests'),
    increment: v.number(),
  },
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest) return false;

    const newProgress = Math.min(quest.progress + args.increment, quest.target);
    const isComplete = newProgress >= quest.target;

    await ctx.db.patch(args.questId, {
      progress: newProgress,
      completedAt: isComplete ? Date.now() : quest.completedAt,
    });

    // Award badge if completed
    if (isComplete && !quest.completedAt) {
      await ctx.db.insert('badges', {
        userId: quest.userId,
        type: 'quest_completed',
        earnedAt: Date.now(),
        metadata: { questType: quest.type, reward: quest.reward },
      });
    }

    return isComplete;
  },
});

// Get active quests for a user
export const getActive = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allQuests = await ctx.db
      .query('quests')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return allQuests.filter(
      (q) => !q.completedAt && q.expiresAt > now
    );
  },
});

// Get completed quests
export const getCompleted = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('quests')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.neq(q.field('completedAt'), undefined))
      .order('desc')
      .take(20);
  },
});

// Create daily quests (called by cron)
export const createDailyQuests = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Quest 1: Pulse 3 times
    await ctx.db.insert('quests', {
      userId: args.userId,
      type: 'daily_pulses',
      description: 'Create 3 pulses today',
      progress: 0,
      target: 3,
      reward: '1 day premium trial',
      expiresAt: now + oneDayMs,
    });

    // Quest 2: Join a room
    await ctx.db.insert('quests', {
      userId: args.userId,
      type: 'join_room',
      description: 'Join a PulseRoom',
      progress: 0,
      target: 1,
      reward: 'Room Explorer badge',
      expiresAt: now + oneDayMs,
    });

    // Quest 3: Connect with circle
    await ctx.db.insert('quests', {
      userId: args.userId,
      type: 'circle_pulse',
      description: 'Pulse with your circle',
      progress: 0,
      target: 1,
      reward: 'Circle Loyalty badge',
      expiresAt: now + oneDayMs,
    });
  },
});

// Clean up expired quests (called by cron)
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('quests')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    const incompleteExpired = expired.filter((q) => !q.completedAt);

    for (const quest of incompleteExpired) {
      await ctx.db.delete(quest._id);
    }

    return incompleteExpired.length;
  },
});

