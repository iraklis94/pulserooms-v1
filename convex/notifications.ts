import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get user notifications
export const getUserNotifications = query({
  args: {
    userId: v.id('users'),
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.unreadOnly) {
      return await ctx.db
        .query('notifications')
        .withIndex('by_user_read', (q) =>
          q.eq('userId', args.userId).eq('read', false)
        )
        .filter((q) => q.gt(q.field('expiresAt'), now))
        .order('desc')
        .collect();
    }

    return await ctx.db
      .query('notifications')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.gt(q.field('expiresAt'), now))
      .order('desc')
      .take(50);
  },
});

// Mark notification as read
export const markAsRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true,
    });
  },
});

// Mark all notifications as read
export const markAllAsRead = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_read', (q) =>
        q.eq('userId', args.userId).eq('read', false)
      )
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, {
        read: true,
      });
    }

    return unread.length;
  },
});

// Create notification
export const create = mutation({
  args: {
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    expiresInMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + (args.expiresInMs || 24 * 60 * 60 * 1000); // Default: 24 hours

    return await ctx.db.insert('notifications', {
      userId: args.userId,
      type: args.type,
      title: args.title,
      body: args.body,
      data: args.data,
      read: false,
      expiresAt,
    });
  },
});

// Clean up expired notifications (called by cron)
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('notifications')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const notification of expired) {
      await ctx.db.delete(notification._id);
    }

    return expired.length;
  },
});

