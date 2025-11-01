import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Track an analytics event
export const trackEvent = mutation({
  args: {
    userId: v.optional(v.id('users')),
    eventType: v.string(),
    eventData: v.any(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert('analyticsEvents', {
      userId: args.userId,
      eventType: args.eventType,
      eventData: args.eventData,
      timestamp: now,
      sessionId: args.sessionId,
    });
  },
});

// Get events by type
export const getEventsByType = query({
  args: {
    eventType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query('analyticsEvents')
      .withIndex('by_type', (q) => q.eq('eventType', args.eventType))
      .order('desc')
      .take(limit);
  },
});

// Get events for a user
export const getUserEvents = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    return await ctx.db
      .query('analyticsEvents')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);
  },
});

// Get analytics summary
export const getSummary = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_timestamp')
      .filter((q) =>
        q.and(
          q.gte(q.field('timestamp'), args.startTime),
          q.lte(q.field('timestamp'), args.endTime)
        )
      )
      .collect();

    // Calculate metrics
    const uniqueUsers = new Set(
      allEvents.filter((e) => e.userId).map((e) => e.userId)
    );

    const eventCounts: Record<string, number> = {};
    allEvents.forEach((event) => {
      eventCounts[event.eventType] = (eventCounts[event.eventType] || 0) + 1;
    });

    return {
      totalEvents: allEvents.length,
      uniqueUsers: uniqueUsers.size,
      eventCounts,
      timeRange: {
        start: args.startTime,
        end: args.endTime,
      },
    };
  },
});

