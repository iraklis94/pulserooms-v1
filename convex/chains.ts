import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';

// Start a new pulse chain
export const start = mutation({
  args: {
    starterId: v.id('users'),
    moodType: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

    return await ctx.db.insert('chains', {
      starterId: args.starterId,
      moodType: args.moodType,
      color: args.color,
      participantIds: [args.starterId],
      reachCount: 1,
      expiresAt,
    });
  },
});

// Join an existing chain
export const join = mutation({
  args: {
    chainId: v.id('chains'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const chain = await ctx.db.get(args.chainId);
    if (!chain) return false;

    const now = Date.now();
    if (chain.expiresAt < now) {
      return false; // Chain expired
    }

    if (chain.participantIds.includes(args.userId)) {
      return true; // Already in chain
    }

    const updatedParticipants = [...chain.participantIds, args.userId];
    const newReach = updatedParticipants.length;

    await ctx.db.patch(args.chainId, {
      participantIds: updatedParticipants,
      reachCount: newReach,
    });

    // Award chain starter badge when reaching 50 people
    if (newReach === 50) {
      await ctx.db.insert('badges', {
        userId: chain.starterId,
        type: 'chain_starter',
        earnedAt: now,
        metadata: { chainId: args.chainId, reach: newReach },
      });
    }

    return true;
  },
});

// Get active chains
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query('chains')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();
  },
});

// Get chains started by user
export const getByStarter = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('chains')
      .withIndex('by_starter', (q) => q.eq('starterId', args.userId))
      .collect();
  },
});

// Get top chains by reach
export const getTopChains = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query('chains')
      .withIndex('by_reach')
      .order('desc')
      .take(limit);
  },
});

// Clean up expired chains
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('chains')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const chain of expired) {
      await ctx.db.delete(chain._id);
    }

    return expired.length;
  },
});

