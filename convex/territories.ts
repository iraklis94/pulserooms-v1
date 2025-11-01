import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Update territory data (called by cron every 30 seconds)
export const updateTerritories = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Get all live pulses
    const livePulses = await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    // Group pulses by approximate location (city-level)
    const locationGroups: Record<
      string,
      {
        lat: number;
        lon: number;
        moods: string[];
        colors: string[];
        userIds: Set<string>;
      }
    > = {};

    for (const pulse of livePulses) {
      // Round to nearest 0.5 degrees for city-level grouping
      const roundedLat = Math.round(pulse.lat * 2) / 2;
      const roundedLon = Math.round(pulse.lon * 2) / 2;
      const key = `${roundedLat},${roundedLon}`;

      if (!locationGroups[key]) {
        locationGroups[key] = {
          lat: roundedLat,
          lon: roundedLon,
          moods: [],
          colors: [],
          userIds: new Set(),
        };
      }

      locationGroups[key].moods.push(pulse.mood);
      locationGroups[key].colors.push(pulse.color);
      locationGroups[key].userIds.add(pulse.userId);
    }

    // Update or create territory records
    for (const [locationKey, data] of Object.entries(locationGroups)) {
      const [lat, lon] = locationKey.split(',').map(Number);

      // Calculate dominant mood
      const moodCounts: Record<string, number> = {};
      data.moods.forEach((mood) => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      let dominantMood = '';
      let maxCount = 0;
      for (const [mood, count] of Object.entries(moodCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantMood = mood;
        }
      }

      // Find most common color
      const colorCounts: Record<string, number> = {};
      data.colors.forEach((color) => {
        colorCounts[color] = (colorCounts[color] || 0) + 1;
      });

      let dominantColor = '';
      maxCount = 0;
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantColor = color;
        }
      }

      // Find existing territory or create new one
      const existing = await ctx.db
        .query('territories')
        .withIndex('by_location', (q) => q.eq('lat', lat).eq('lon', lon))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          dominantMood,
          dominantColor,
          userCount: data.userIds.size,
          moodBreakdown: moodCounts,
          lastUpdate: now,
        });
      } else {
        // Simple city/country lookup (in production, use geocoding API)
        await ctx.db.insert('territories', {
          city: `City_${lat.toFixed(1)}_${lon.toFixed(1)}`,
          country: 'Unknown',
          lat,
          lon,
          dominantMood,
          dominantColor,
          userCount: data.userIds.size,
          moodBreakdown: moodCounts,
          lastUpdate: now,
        });
      }
    }

    return Object.keys(locationGroups).length;
  },
});

// Get all active territories
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    return await ctx.db
      .query('territories')
      .withIndex('by_update', (q) => q.gt('lastUpdate', fiveMinutesAgo))
      .collect();
  },
});

// Get territory leaderboard (top cities by user count)
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const territories = await ctx.db
      .query('territories')
      .withIndex('by_user_count')
      .order('desc')
      .take(limit);

    return territories;
  },
});

// Get territory by location
export const getByLocation = query({
  args: {
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args) => {
    const roundedLat = Math.round(args.lat * 2) / 2;
    const roundedLon = Math.round(args.lon * 2) / 2;

    return await ctx.db
      .query('territories')
      .withIndex('by_location', (q) =>
        q.eq('lat', roundedLat).eq('lon', roundedLon)
      )
      .first();
  },
});

// Get territories in a region
export const getInRegion = query({
  args: {
    minLat: v.number(),
    maxLat: v.number(),
    minLon: v.number(),
    maxLon: v.number(),
  },
  handler: async (ctx, args) => {
    const allTerritories = await ctx.db.query('territories').collect();

    return allTerritories.filter(
      (t) =>
        t.lat >= args.minLat &&
        t.lat <= args.maxLat &&
        t.lon >= args.minLon &&
        t.lon <= args.maxLon
    );
  },
});

// Clean up stale territories (called by cron)
export const cleanupStale = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const stale = await ctx.db
      .query('territories')
      .withIndex('by_update', (q) => q.lt('lastUpdate', oneHourAgo))
      .collect();

    for (const territory of stale) {
      await ctx.db.delete(territory._id);
    }

    return stale.length;
  },
});

