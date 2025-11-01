import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';

// Create a new pulse
export const create = mutation({
  args: {
    userId: v.id('users'),
    color: v.string(),
    mood: v.string(),
    moodIntensity: v.number(),
    lat: v.number(),
    lon: v.number(),
    note: v.optional(v.string()),
    soundUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + 60 * 1000; // 60 seconds TTL

    const pulseId = await ctx.db.insert('pulses', {
      userId: args.userId,
      color: args.color,
      mood: args.mood,
      moodIntensity: args.moodIntensity,
      lat: args.lat,
      lon: args.lon,
      note: args.note,
      soundUrl: args.soundUrl,
      expiresAt,
    });

    // Update mood history
    const today = new Date().toISOString().split('T')[0];
    const existingHistory = await ctx.db
      .query('moodHistory')
      .withIndex('by_user_date', (q) =>
        q.eq('userId', args.userId).eq('date', today)
      )
      .first();

    if (existingHistory) {
      const updatedMoods = [
        ...existingHistory.moods,
        {
          mood: args.mood,
          color: args.color,
          intensity: args.moodIntensity,
          timestamp: now,
        },
      ];

      await ctx.db.patch(existingHistory._id, {
        moods: updatedMoods,
        dominantMood: args.mood, // Simplified - should calculate most frequent
      });
    } else {
      await ctx.db.insert('moodHistory', {
        userId: args.userId,
        date: today,
        moods: [
          {
            mood: args.mood,
            color: args.color,
            intensity: args.moodIntensity,
            timestamp: now,
          },
        ],
        dominantMood: args.mood,
      });
    }

    return pulseId;
  },
});

// Get live pulses (last 60 seconds)
export const getLive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();
  },
});

// Get live pulses for specific mood
export const getLiveByMood = query({
  args: { mood: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allLive = await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    return allLive.filter((p) => p.mood === args.mood);
  },
});

// Get pulses in a geographic area (bounding box)
export const getInArea = query({
  args: {
    minLat: v.number(),
    maxLat: v.number(),
    minLon: v.number(),
    maxLon: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allLive = await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    return allLive.filter(
      (p) =>
        p.lat >= args.minLat &&
        p.lat <= args.maxLat &&
        p.lon >= args.minLon &&
        p.lon <= args.maxLon
    );
  },
});

// Get user's recent pulses
export const getUserPulses = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    return await ctx.db
      .query('pulses')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(limit);
  },
});

// Clean up expired pulses (called by cron)
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const pulse of expired) {
      await ctx.db.delete(pulse._id);
    }

    return expired.length;
  },
});

// Get pulse statistics for a user
export const getUserStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const history = await ctx.db
      .query('moodHistory')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const moodCounts: Record<string, number> = {};
    let totalMoods = 0;

    history.forEach((day) => {
      day.moods.forEach((m) => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
        totalMoods++;
      });
    });

    // Find most common mood
    let dominantMood = '';
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    }

    return {
      totalPulses: user.totalPulses,
      streakDays: user.streakDays,
      dominantMood,
      moodCounts,
      daysTracked: history.length,
    };
  },
});

