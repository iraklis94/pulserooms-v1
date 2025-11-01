import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create or get existing chat room
export const createOrGetRoom = mutation({
  args: {
    participantIds: v.array(v.id('users')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Sort participant IDs for consistent lookup
    const sortedIds = [...args.participantIds].sort();

    // Check for existing active room
    const allRooms = await ctx.db
      .query('chatRooms')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    const existingRoom = allRooms.find((room) => {
      const roomSorted = [...room.participantIds].sort();
      return JSON.stringify(roomSorted) === JSON.stringify(sortedIds);
    });

    if (existingRoom) {
      return existingRoom._id;
    }

    // Create new room
    return await ctx.db.insert('chatRooms', {
      participantIds: args.participantIds,
      lastMessageAt: now,
      expiresAt: now + 60 * 60 * 1000, // 1 hour default
      isActive: true,
    });
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    roomId: v.id('chatRooms'),
    senderId: v.id('users'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room || !room.isActive) {
      throw new Error('Room not active');
    }

    const now = Date.now();
    const messageExpiresAt = now + 5 * 60 * 1000; // Messages expire in 5 minutes

    await ctx.db.insert('chatMessages', {
      roomId: args.roomId,
      senderId: args.senderId,
      content: args.content,
      timestamp: now,
      expiresAt: messageExpiresAt,
    });

    // Update room last message time
    await ctx.db.patch(args.roomId, {
      lastMessageAt: now,
      expiresAt: now + 60 * 60 * 1000, // Extend room expiration
    });
  },
});

// Get messages for a room
export const getMessages = query({
  args: { roomId: v.id('chatRooms') },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db
      .query('chatMessages')
      .withIndex('by_room_time', (q) => q.eq('roomId', args.roomId))
      .filter((q) => q.gt(q.field('expiresAt'), now))
      .order('asc')
      .collect();
  },
});

// Get active rooms for a user
export const getUserRooms = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = Date.now();

    const allRooms = await ctx.db
      .query('chatRooms')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();

    return allRooms.filter(
      (room) =>
        room.participantIds.includes(args.userId) && room.expiresAt > now
    );
  },
});

// Leave chat room
export const leaveRoom = mutation({
  args: { roomId: v.id('chatRooms') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.roomId, {
      isActive: false,
    });
  },
});

// Clean up expired messages (called by cron)
export const cleanupExpiredMessages = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query('chatMessages')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const message of expired) {
      await ctx.db.delete(message._id);
    }

    return expired.length;
  },
});

// Clean up inactive rooms (called by cron)
export const cleanupInactiveRooms = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const inactive = await ctx.db
      .query('chatRooms')
      .withIndex('by_expiration', (q) => q.lt('expiresAt', now))
      .collect();

    for (const room of inactive) {
      await ctx.db.patch(room._id, {
        isActive: false,
      });

      // Delete all messages in the room
      const messages = await ctx.db
        .query('chatMessages')
        .withIndex('by_room', (q) => q.eq('roomId', room._id))
        .collect();

      for (const message of messages) {
        await ctx.db.delete(message._id);
      }
    }

    return inactive.length;
  },
});

