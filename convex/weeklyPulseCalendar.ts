import { v } from 'convex/values';
import { mutation, query, internalMutation } from './_generated/server';
import { Id } from './_generated/dataModel';
import { internal } from './_generated/api';

// Helper to get start of week (Sunday)
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

// Helper to get end of week (Saturday)
function getWeekEnd(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().split('T')[0];
}

// Helper to generate week dates
function generateWeekDates(weekStart: string): Array<{ dayOfWeek: number; date: string }> {
  const dates = [];
  const start = new Date(weekStart);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push({
      dayOfWeek: i,
      date: date.toISOString().split('T')[0],
    });
  }
  
  return dates;
}

// Get current week calendar for user
export const getCurrentWeek = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    
    const calendar = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', weekStart)
      )
      .first();
    
    return calendar;
  },
});

// Get calendar for specific week
export const getWeek = query({
  args: {
    userId: v.id('users'),
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', args.weekStart)
      )
      .first();
  },
});

// Generate new weekly calendar for user
export const generateWeeklyCalendar = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);
    
    // Check if calendar already exists
    const existing = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', weekStart)
      )
      .first();
    
    if (existing) {
      return existing._id;
    }
    
    // Get user's friends
    const friendships = await ctx.db
      .query('friendships')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .filter((q) => q.eq(q.field('status'), 'accepted'))
      .collect();
    
    const friendIds = friendships.map((f) => f.friendId);
    
    // Generate assignments for each day
    const weekDates = generateWeekDates(weekStart);
    const moods = ['hyped', 'excited', 'joyful', 'content', 'calm', 'focused', 'thoughtful', 'melancholic', 'anxious', 'sad'];
    const colors = ['#FF6B6B', '#FF8C42', '#FFD93D', '#A8E6CF', '#6BCF7F', '#4D96FF', '#8B7FD6', '#7B68EE', '#FF6B9D', '#6B6B8B'];
    
    const assignments = weekDates.map((day) => {
      // Randomly select a friend for this day (if user has friends)
      const matchedUserId = friendIds.length > 0 
        ? friendIds[Math.floor(Math.random() * friendIds.length)]
        : undefined;
      
      // Randomly select a mood for this day
      const moodIndex = Math.floor(Math.random() * moods.length);
      
      return {
        dayOfWeek: day.dayOfWeek,
        date: day.date,
        matchedUserId,
        mood: moods[moodIndex],
        color: colors[moodIndex],
        completed: false,
      };
    });
    
    // Create calendar
    return await ctx.db.insert('weeklyPulseCalendar', {
      userId: args.userId,
      weekStart,
      weekEnd,
      assignments,
      isActive: true,
    });
  },
});

// Mark assignment as completed
export const completeAssignment = mutation({
  args: {
    userId: v.id('users'),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const weekStart = getWeekStart(new Date(args.date));
    
    const calendar = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', weekStart)
      )
      .first();
    
    if (!calendar) return false;
    
    const updatedAssignments = calendar.assignments.map((assignment) => {
      if (assignment.date === args.date) {
        return {
          ...assignment,
          completed: true,
          syncedAt: Date.now(),
        };
      }
      return assignment;
    });
    
    await ctx.db.patch(calendar._id, {
      assignments: updatedAssignments,
    });
    
    // Award badge if week is complete
    const allCompleted = updatedAssignments.every((a) => a.completed);
    if (allCompleted) {
      await ctx.db.insert('badges', {
        userId: args.userId,
        type: 'week_completed',
        earnedAt: Date.now(),
        metadata: { weekStart },
      });
    }
    
    return true;
  },
});

// Get matched user for today
export const getTodayMatch = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = getWeekStart(now);
    
    const calendar = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', weekStart)
      )
      .first();
    
    if (!calendar) return null;
    
    const todayAssignment = calendar.assignments.find((a) => a.date === today);
    if (!todayAssignment || !todayAssignment.matchedUserId) return null;
    
    const matchedUser = await ctx.db.get(todayAssignment.matchedUserId);
    
    return {
      user: matchedUser,
      assignment: todayAssignment,
    };
  },
});

// Reset all calendars to inactive (called before generating new week)
export const deactivateCalendars = internalMutation({
  args: {},
  handler: async (ctx) => {
    const activeCalendars = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_active', (q) => q.eq('isActive', true))
      .collect();
    
    for (const calendar of activeCalendars) {
      await ctx.db.patch(calendar._id, {
        isActive: false,
      });
    }
    
    return activeCalendars.length;
  },
});

// Generate calendars for all users (called by cron on Sunday)
export const generateAllCalendars = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Deactivate old calendars
    await ctx.scheduler.runAfter(0, internal.weeklyPulseCalendar.deactivateCalendars);
    
    // Get all users
    const users = await ctx.db.query('users').collect();
    
    let generated = 0;
    for (const user of users) {
      try {
        await ctx.scheduler.runAfter(0, internal.weeklyPulseCalendar.generateWeeklyCalendar, {
          userId: user._id,
        });
        generated++;
      } catch (error) {
        console.error(`Error generating calendar for user ${user._id}:`, error);
      }
    }
    
    return generated;
  },
});

// Get weekly stats
export const getWeeklyStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const now = new Date();
    const weekStart = getWeekStart(now);
    
    const calendar = await ctx.db
      .query('weeklyPulseCalendar')
      .withIndex('by_user_week', (q) =>
        q.eq('userId', args.userId).eq('weekStart', weekStart)
      )
      .first();
    
    if (!calendar) {
      return {
        totalDays: 0,
        completedDays: 0,
        completionRate: 0,
        currentStreak: 0,
      };
    }
    
    const completedDays = calendar.assignments.filter((a) => a.completed).length;
    const totalDays = calendar.assignments.length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedAssignments = [...calendar.assignments].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    for (const assignment of sortedAssignments) {
      if (assignment.completed) {
        currentStreak++;
      } else if (new Date(assignment.date) < now) {
        currentStreak = 0;
      } else {
        break; // Future date
      }
    }
    
    return {
      totalDays,
      completedDays,
      completionRate,
      currentStreak,
    };
  },
});
