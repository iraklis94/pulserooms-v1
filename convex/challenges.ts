import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

// Create a new challenge
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    sponsor: v.optional(v.string()),
    durationHours: v.number(),
    targetMood: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startDate = now;
    const endDate = now + args.durationHours * 60 * 60 * 1000;

    return await ctx.db.insert('challenges', {
      title: args.title,
      description: args.description,
      sponsor: args.sponsor,
      startDate,
      endDate,
      participantIds: [],
      targetMood: args.targetMood,
      isActive: true,
    });
  },
});

// Join a challenge
export const join = mutation({
  args: {
    challengeId: v.id('challenges'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return false;

    const now = Date.now();
    if (!challenge.isActive || now > challenge.endDate) {
      return false;
    }

    if (challenge.participantIds.includes(args.userId)) {
      return true; // Already joined
    }

    await ctx.db.patch(args.challengeId, {
      participantIds: [...challenge.participantIds, args.userId],
    });

    return true;
  },
});

// Get active challenges
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db
      .query('challenges')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    return all.filter((c) => c.endDate > now);
  },
});

// Get challenge details
export const getDetails = query({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return null;

    return {
      ...challenge,
      participantCount: challenge.participantIds.length,
      timeRemaining: Math.max(0, challenge.endDate - Date.now()),
    };
  },
});

// End a challenge (called by cron or admin)
export const end = mutation({
  args: { challengeId: v.id('challenges') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.challengeId, {
      isActive: false,
    });

    const challenge = await ctx.db.get(args.challengeId);
    if (!challenge) return;

    // Award badges to all participants
    const now = Date.now();
    for (const userId of challenge.participantIds) {
      await ctx.db.insert('badges', {
        userId,
        type: 'challenge_completed',
        earnedAt: now,
        metadata: {
          challengeId: args.challengeId,
          title: challenge.title,
        },
      });
    }
  },
});

// Clean up old challenges (called by cron)
export const cleanupOld = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const old = await ctx.db
      .query('challenges')
      .withIndex('by_date')
      .collect();

    const toDelete = old.filter((c) => c.endDate < oneWeekAgo);

    for (const challenge of toDelete) {
      await ctx.db.delete(challenge._id);
    }

    return toDelete.length;
  },
});

