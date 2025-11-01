import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';

// Create or join a room
export const joinOrCreate = mutation({
  args: {
    userId: v.id('users'),
    mood: v.string(),
    color: v.string(),
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Find existing room nearby with same mood
    const allRooms = await ctx.db
      .query('rooms')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    const nearbyRoom = allRooms.find((room) => {
      const distance = Math.sqrt(
        Math.pow(room.lat - args.lat, 2) + Math.pow(room.lon - args.lon, 2)
      );
      return room.mood === args.mood && distance < 0.1; // ~10km radius
    });

    if (nearbyRoom) {
      // Join existing room
      if (!nearbyRoom.activeUserIds.includes(args.userId)) {
        const updatedUsers = [...nearbyRoom.activeUserIds, args.userId];

        // Check for fusion event (10+ users)
        const isFusion = updatedUsers.length >= 10;

        await ctx.db.patch(nearbyRoom._id, {
          activeUserIds: updatedUsers,
          isFusion,
          expiresAt: now + 120 * 1000, // Extend by 2 minutes
        });

        // Award fusion badge if triggered
        if (isFusion && !nearbyRoom.isFusion) {
          for (const userId of updatedUsers) {
            await ctx.db.insert('badges', {
              userId,
              type: 'fusion_master',
              earnedAt: now,
            });
          }
        }
      }

      return nearbyRoom._id;
    }

    // Create new room
    return await ctx.db.insert('rooms', {
      mood: args.mood,
      color: args.color,
      activeUserIds: [args.userId],
      lat: args.lat,
      lon: args.lon,
      expiresAt: now + 120 * 1000, // 2 minutes TTL
      isFusion: false,
    });
  },
});

// Leave a room
export const leave = mutation({
  args: {
    roomId: v.id('rooms'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return;

    const updatedUsers = room.activeUserIds.filter((id) => id !== args.userId);

    if (updatedUsers.length === 0) {
      // Room is empty, delete it
      await ctx.db.delete(args.roomId);
    } else {
      await ctx.db.patch(args.roomId, {
        activeUserIds: updatedUsers,
        isFusion: updatedUsers.length >= 10,
      });
    }
  },
});

// Get active room details
export const getActive = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const now = Date.now();
    if (room.expiresAt < now) {
      return null; // Room expired
    }

    // Get user details for all participants
    const users = await Promise.all(
      room.activeUserIds.map((userId) => ctx.db.get(userId))
    );

    return {
      ...room,
      users: users.filter((u) => u !== null),
    };
  },
});

// Get all active rooms
export const getAllActive = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db
      .query('rooms')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();
  },
});

// Get rooms by mood
export const getByMood = query({
  args: { mood: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allActive = await ctx.db
      .query('rooms')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    return allActive.filter((r) => r.mood === args.mood);
  },
});

// Calculate fusion color (average of all users' colors)
export const calculateFusionColor = query({
  args: { roomId: v.id('rooms') },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isFusion) return null;

    // Get recent pulses from room participants
    const now = Date.now();
    const recentPulses = await ctx.db
      .query('pulses')
      .withIndex('by_expiration', (q) => q.gt('expiresAt', now))
      .collect();

    const roomUserPulses = recentPulses.filter((p) =>
      room.activeUserIds.includes(p.userId)
    );

    if (roomUserPulses.length === 0) return room.color;

    // Average the RGB values
    let totalR = 0,
      totalG = 0,
      totalB = 0;

    roomUserPulses.forEach((pulse) => {
      const hex = pulse.color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      totalR += r;
      totalG += g;
      totalB += b;
    });

    const avgR = Math.round(totalR / roomUserPulses.length);
    const avgG = Math.round(totalG / roomUserPulses.length);
    const avgB = Math.round(totalB / roomUserPulses.length);

    const fusionColor =
      '#' +
      avgR.toString(16).padStart(2, '0') +
      avgG.toString(16).padStart(2, '0') +
      avgB.toString(16).padStart(2, '0');

    return fusionColor;
  },
});

// Clean up expired rooms (called by cron)
export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('rooms')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const room of expired) {
      await ctx.db.delete(room._id);
    }

    return expired.length;
  },
});

