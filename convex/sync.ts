import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Send sync pulse request
export const sendRequest = mutation({
  args: {
    fromUserId: v.id('users'),
    toUserId: v.id('users'),
    color: v.string(),
    mood: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 10 * 1000; // 10 seconds to accept

    const requestId = await ctx.db.insert('syncPulseRequests', {
      fromUserId: args.fromUserId,
      toUserId: args.toUserId,
      color: args.color,
      mood: args.mood,
      expiresAt,
      status: 'pending',
    });

    // Create notification
    await ctx.db.insert('notifications', {
      userId: args.toUserId,
      type: 'sync_pulse_request',
      title: 'Sync Pulse Request',
      body: 'Someone wants to sync with you!',
      data: { requestId },
      read: false,
      expiresAt: expiresAt,
    });

    return requestId;
  },
});

// Accept sync pulse request
export const acceptRequest = mutation({
  args: { requestId: v.id('syncPulseRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return false;

    const now = Date.now();
    if (request.expiresAt < now || request.status !== 'pending') {
      return false;
    }

    await ctx.db.patch(args.requestId, {
      status: 'accepted',
    });

    // Award badge to both users
    await ctx.db.insert('badges', {
      userId: request.fromUserId,
      type: 'synced_souls',
      earnedAt: now,
      metadata: { syncedWith: request.toUserId },
    });

    await ctx.db.insert('badges', {
      userId: request.toUserId,
      type: 'synced_souls',
      earnedAt: now,
      metadata: { syncedWith: request.fromUserId },
    });

    // Notify sender of acceptance
    await ctx.db.insert('notifications', {
      userId: request.fromUserId,
      type: 'sync_pulse_accepted',
      title: 'Sync Accepted!',
      body: 'Your sync pulse was accepted',
      data: { requestId: args.requestId },
      read: false,
      expiresAt: now + 60 * 1000,
    });

    return true;
  },
});

// Reject sync pulse request
export const rejectRequest = mutation({
  args: { requestId: v.id('syncPulseRequests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return false;

    await ctx.db.patch(args.requestId, {
      status: 'rejected',
    });

    return true;
  },
});

// Get pending requests for a user
export const getPendingRequests = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allRequests = await ctx.db
      .query('syncPulseRequests')
      .withIndex('by_to_user', (q) => q.eq('toUserId', args.userId))
      .collect();

    return allRequests.filter(
      (r) => r.status === 'pending' && r.expiresAt > now
    );
  },
});

// Get sync pulse history
export const getHistory = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const sent = await ctx.db
      .query('syncPulseRequests')
      .withIndex('by_from_user', (q) => q.eq('fromUserId', args.userId))
      .collect();

    const received = await ctx.db
      .query('syncPulseRequests')
      .withIndex('by_to_user', (q) => q.eq('toUserId', args.userId))
      .collect();

    return {
      sent: sent.filter((r) => r.status === 'accepted'),
      received: received.filter((r) => r.status === 'accepted'),
    };
  },
});

// Clean up expired requests (called by cron)
export const cleanupExpired = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('syncPulseRequests')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const request of expired) {
      if (request.status === 'pending') {
        await ctx.db.patch(request._id, {
          status: 'expired',
        });
      }
    }

    return expired.length;
  },
});

