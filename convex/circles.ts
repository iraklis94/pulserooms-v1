import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Create a new mood circle
export const create = mutation({
  args: {
    name: v.string(),
    creatorId: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('moodCircles', {
      name: args.name,
      creatorId: args.creatorId,
      memberIds: [args.creatorId],
      pulseHistory: [],
      stabilityScore: 0,
      circleStreak: 0,
    });
  },
});

// Add member to circle
export const addMember = mutation({
  args: {
    circleId: v.id('moodCircles'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle) return false;

    if (circle.memberIds.includes(args.userId)) {
      return true; // Already a member
    }

    await ctx.db.patch(args.circleId, {
      memberIds: [...circle.memberIds, args.userId],
    });

    return true;
  },
});

// Remove member from circle
export const removeMember = mutation({
  args: {
    circleId: v.id('moodCircles'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle) return false;

    const updatedMembers = circle.memberIds.filter((id) => id !== args.userId);

    if (updatedMembers.length === 0) {
      // Delete circle if empty
      await ctx.db.delete(args.circleId);
    } else {
      await ctx.db.patch(args.circleId, {
        memberIds: updatedMembers,
      });
    }

    return true;
  },
});

// Record a pulse in circle history
export const recordPulse = mutation({
  args: {
    circleId: v.id('moodCircles'),
    userId: v.id('users'),
    mood: v.string(),
  },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle || !circle.memberIds.includes(args.userId)) {
      return false;
    }

    const now = Date.now();
    const newHistory = [
      ...circle.pulseHistory,
      {
        userId: args.userId,
        mood: args.mood,
        timestamp: now,
      },
    ];

    // Keep only last 100 pulses
    const trimmedHistory = newHistory.slice(-100);

    await ctx.db.patch(args.circleId, {
      pulseHistory: trimmedHistory,
    });

    return true;
  },
});

// Calculate circle stability score
export const calculateStability = mutation({
  args: { circleId: v.id('moodCircles') },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle) return 0;

    if (circle.pulseHistory.length < 2) {
      return 0;
    }

    // Calculate variance in mood types
    const moodCounts: Record<string, number> = {};
    circle.pulseHistory.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    });

    const totalPulses = circle.pulseHistory.length;
    const moodTypes = Object.keys(moodCounts).length;

    // Higher stability = more consistent moods (lower variance)
    // Score from 0-100, where 100 is perfect consistency
    const consistencyScore = Math.round((1 - moodTypes / 10) * 100);
    const stabilityScore = Math.max(0, Math.min(100, consistencyScore));

    await ctx.db.patch(args.circleId, {
      stabilityScore,
    });

    return stabilityScore;
  },
});

// Get user's circles
export const getUserCircles = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const allCircles = await ctx.db.query('moodCircles').collect();
    return allCircles.filter((circle) =>
      circle.memberIds.includes(args.userId)
    );
  },
});

// Get circle details with member info
export const getDetails = query({
  args: { circleId: v.id('moodCircles') },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle) return null;

    const members = await Promise.all(
      circle.memberIds.map((userId) => ctx.db.get(userId))
    );

    return {
      ...circle,
      members: members.filter((m) => m !== null),
    };
  },
});

// Get circle analytics
export const getAnalytics = query({
  args: { circleId: v.id('moodCircles') },
  handler: async (ctx, args) => {
    const circle = await ctx.db.get(args.circleId);
    if (!circle) return null;

    // Calculate mood breakdown
    const moodCounts: Record<string, number> = {};
    circle.pulseHistory.forEach((entry) => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
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

    // Calculate streak (consecutive days all members pulsed)
    const today = new Date().toISOString().split('T')[0];
    const oneDayMs = 24 * 60 * 60 * 1000;

    let currentStreak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const startOfDay = new Date(dateStr).getTime();
      const endOfDay = startOfDay + oneDayMs;

      const pulsesOnDay = circle.pulseHistory.filter(
        (p) => p.timestamp >= startOfDay && p.timestamp < endOfDay
      );

      const uniqueUsers = new Set(pulsesOnDay.map((p) => p.userId));

      if (uniqueUsers.size === circle.memberIds.length) {
        currentStreak++;
      } else {
        break;
      }

      checkDate.setDate(checkDate.getDate() - 1);
    }

    await ctx.db.patch(args.circleId, {
      circleStreak: currentStreak,
    });

    return {
      stabilityScore: circle.stabilityScore,
      circleStreak: currentStreak,
      dominantMood,
      moodBreakdown: moodCounts,
      totalPulses: circle.pulseHistory.length,
      memberCount: circle.memberIds.length,
    };
  },
});

