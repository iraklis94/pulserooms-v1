import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Send friend request
export const sendRequest = mutation({
  args: {
    userId: v.id('users'),
    friendId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if friendship already exists
    const existing = await ctx.db
      .query('friendships')
      .withIndex('by_user_friend', (q) =>
        q.eq('userId', args.userId).eq('friendId', args.friendId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    return await ctx.db.insert('friendships', {
      userId: args.userId,
      friendId: args.friendId,
      status: 'pending',
      createdAt: now,
    });
  },
});

// Accept friend request
export const acceptRequest = mutation({
  args: { friendshipId: v.id('friendships') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.friendshipId, {
      status: 'accepted',
    });

    // Create reciprocal friendship
    const friendship = await ctx.db.get(args.friendshipId);
    if (friendship) {
      const reciprocal = await ctx.db
        .query('friendships')
        .withIndex('by_user_friend', (q) =>
          q.eq('userId', friendship.friendId).eq('friendId', friendship.userId)
        )
        .first();

      if (!reciprocal) {
        await ctx.db.insert('friendships', {
          userId: friendship.friendId,
          friendId: friendship.userId,
          status: 'accepted',
          createdAt: Date.now(),
        });
      }
    }
  },
});

// Get user's friends
export const getFriends = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const friendships = await ctx.db
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect();

    const friends = await Promise.all(
      friendships.map((f) => ctx.db.get(f.friendId))
    );

    return friends.filter((f) => f !== null);
  },
});

// Get pending friend requests
export const getPendingRequests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('friendships')
      .withIndex('by_friend', (q) => q.eq('friendId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect();
  },
});

// Remove friend
export const remove = mutation({
  args: {
    userId: v.id('users'),
    friendId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const friendship = await ctx.db
      .query('friendships')
      .withIndex('by_user_friend', (q) =>
        q.eq('userId', args.userId).eq('friendId', args.friendId)
      )
      .first();

    if (friendship) {
      await ctx.db.delete(friendship._id);
    }

    // Remove reciprocal friendship
    const reciprocal = await ctx.db
      .query('friendships')
      .withIndex('by_user_friend', (q) =>
        q.eq('userId', args.friendId).eq('friendId', args.userId)
      )
      .first();

    if (reciprocal) {
      await ctx.db.delete(reciprocal._id);
    }

    return true;
  },
});

