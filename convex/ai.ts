import { v } from 'convex/values';
import { action, internalMutation, internalQuery, query } from './_generated/server';
import { internal } from './_generated/api';
import { Doc } from './_generated/dataModel';

// Analyze user's mood patterns and generate insights
export const analyzeMoodPatterns = action({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // Get user's mood history
    const history = await ctx.runQuery(internal.ai.getMoodHistory, {
      userId: args.userId,
    });

    if (history.length === 0) {
      return { insights: [], recommendation: 'Track more moods to get insights' };
    }

    // Count mood frequencies
    const moodCounts: Record<string, number> = {};
    let totalMoods = 0;

    history.forEach((day: Doc<'moodHistory'>) => {
      day.moods.forEach((m: { mood: string; color: string; intensity: number; timestamp: number }) => {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
        totalMoods++;
      });
    });

    // Generate insights based on patterns
    const insights: string[] = [];

    // Find dominant mood
    let dominantMood = '';
    let maxCount = 0;
    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = mood;
      }
    }

    const dominantPercent = Math.round((maxCount / totalMoods) * 100);
    insights.push(
      `You've been feeling ${dominantMood} ${dominantPercent}% of the time`
    );

    // Check for concerning patterns
    const negativeMoods = ['anxious', 'sad', 'melancholic'];
    const negativeCount = Object.entries(moodCounts)
      .filter(([mood]) => negativeMoods.includes(mood))
      .reduce((sum, [, count]) => sum + count, 0);

    const negativePercent = Math.round((negativeCount / totalMoods) * 100);
    
    if (negativePercent > 50) {
      insights.push(
        `You've been experiencing challenging emotions frequently. Consider taking time for self-care.`
      );
    }

    // Diversity check
    const moodDiversity = Object.keys(moodCounts).length;
    if (moodDiversity > 6) {
      insights.push(
        `You experience a wide range of emotions - that's healthy emotional intelligence!`
      );
    }

    // Generate recommendation
    let recommendation = '';
    if (dominantMood === 'calm' || dominantMood === 'content') {
      recommendation = 'Your emotional balance looks great! Keep maintaining this peaceful state.';
    } else if (negativeMoods.includes(dominantMood)) {
      recommendation = 'Try balancing with calming activities like meditation, nature walks, or connecting with friends.';
    } else if (dominantMood === 'hyped' || dominantMood === 'excited') {
      recommendation = 'Your energy levels are high! Channel it into creative projects or physical activity.';
    } else {
      recommendation = 'Your mood patterns are varied. Try to notice what triggers different emotions.';
    }

    // In production, call OpenAI/Anthropic API for deeper analysis
    // const apiKey = process.env.OPENAI_API_KEY;
    // if (apiKey) {
    //   const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${apiKey}`,
    //     },
    //     body: JSON.stringify({
    //       model: 'gpt-4',
    //       messages: [
    //         {
    //           role: 'system',
    //           content: 'You are an empathetic mood analysis AI that provides thoughtful insights...'
    //         },
    //         {
    //           role: 'user',
    //           content: `Analyze these mood patterns and provide 3 insights and a recommendation: ${JSON.stringify(moodCounts)}`
    //         }
    //       ],
    //       max_tokens: 300
    //     })
    //   });
    //   const data = await response.json();
    //   // Parse AI response
    // }

    return { insights, recommendation, moodCounts };
  },
});

// Internal query to get mood history
export const getMoodHistory = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('moodHistory')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Generate AI mood avatar
export const generateMoodAvatar = action({
  args: { userId: v.id('users') },
  handler: async (ctx, args): Promise<{ name: string; visualData: string; moodPattern: string[]; evolution: number } | null> => {
    // Get mood patterns
    const history: Doc<'moodHistory'>[] = await ctx.runQuery(internal.ai.getMoodHistory, {
      userId: args.userId,
    });

    if (history.length === 0) {
      return null;
    }

    // Extract mood pattern
    const recentMoods: string[] = history
      .slice(-7)
      .flatMap((day: Doc<'moodHistory'>) => day.moods.map((m: { mood: string; color: string; intensity: number; timestamp: number }) => m.mood));

    // In production, call generative AI service
    // For now, create a simple deterministic avatar
    const moodPattern: string[] = [...new Set(recentMoods)];
    const evolution = history.length;

    const avatarData = {
      name: `MoodSpirit_${Math.floor(Math.random() * 1000)}`,
      visualData: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCI+PC9zdmc+`,
      moodPattern,
      evolution,
    };

    // Save avatar
    await ctx.runMutation(internal.ai.saveAvatar, {
      userId: args.userId,
      ...avatarData,
    });

    return avatarData;
  },
});

// Get user's avatar
export const getUserAvatar = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('aiAvatars')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Save avatar to database
export const saveAvatar = internalMutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    visualData: v.string(),
    moodPattern: v.array(v.string()),
    evolution: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('aiAvatars')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        visualData: args.visualData,
        moodPattern: args.moodPattern,
        evolution: args.evolution,
        lastUpdated: now,
      });
      return existing._id;
    }

    return await ctx.db.insert('aiAvatars', {
      userId: args.userId,
      name: args.name,
      visualData: args.visualData,
      moodPattern: args.moodPattern,
      lastUpdated: now,
      evolution: args.evolution,
    });
  },
});

// Predict mood for a territory
export const predictMoodForTerritory = action({
  args: {
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args): Promise<{ city: string; predictedMood: string; confidence: number; date: string } | null> => {
    // Get historical data for this territory
    const territory: Doc<'territories'> | null = await ctx.runQuery(internal.ai.getTerritoryByCity, {
      city: args.city,
      country: args.country,
    });

    if (!territory) {
      return null;
    }

    // Simple prediction based on current mood
    const predictedMood: string = territory.dominantMood;
    const confidence = 0.75;

    // Save forecast
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    await ctx.runMutation(internal.ai.saveForecast, {
      city: args.city,
      country: args.country,
      date: dateStr,
      predictedMood,
      confidence,
      moodProbabilities: territory.moodBreakdown,
    });

    return {
      city: args.city,
      predictedMood,
      confidence,
      date: dateStr,
    };
  },
});

// Internal query to get territory
export const getTerritoryByCity = internalQuery({
  args: {
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('territories')
      .withIndex('by_city', (q) => q.eq('city', args.city).eq('country', args.country))
      .first();
  },
});

// Save forecast
export const saveForecast = internalMutation({
  args: {
    city: v.string(),
    country: v.string(),
    date: v.string(),
    predictedMood: v.string(),
    confidence: v.number(),
    moodProbabilities: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert('moodForecasts', {
      city: args.city,
      country: args.country,
      date: args.date,
      predictedMood: args.predictedMood,
      confidence: args.confidence,
      moodProbabilities: args.moodProbabilities,
      generatedAt: now,
    });
  },
});

// Get forecast for a city
export const getForecast = query({
  args: {
    city: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('moodForecasts')
      .withIndex('by_city_date', (q) =>
        q.eq('city', args.city).eq('date', args.date)
      )
      .first();
  },
});

// Find users with similar mood patterns for social matching
export const findSimilarUsers = query({
  args: {
    userId: v.id('users'),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;

    // Get user's recent mood history
    const userHistory = await ctx.db
      .query('moodHistory')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(7);

    if (userHistory.length === 0) {
      return [];
    }

    // Extract user's mood pattern
    const userMoods = userHistory.flatMap((day) => day.moods.map((m) => m.mood));
    const userMoodSet = new Set(userMoods);

    // Get all other users and calculate similarity
    const allUsers = await ctx.db.query('users').collect();
    const similarities: Array<{ user: any; score: number }> = [];

    for (const user of allUsers) {
      if (user._id === args.userId) continue;

      const otherHistory = await ctx.db
        .query('moodHistory')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .order('desc')
        .take(7);

      if (otherHistory.length === 0) continue;

      const otherMoods = otherHistory.flatMap((day) => day.moods.map((m) => m.mood));
      const otherMoodSet = new Set(otherMoods);

      // Calculate Jaccard similarity
      const intersection = new Set([...userMoodSet].filter((x) => otherMoodSet.has(x)));
      const union = new Set([...userMoodSet, ...otherMoodSet]);
      const similarity = intersection.size / union.size;

      if (similarity > 0.3) {
        similarities.push({ user, score: similarity });
      }
    }

    // Sort by similarity and return top matches
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => ({ ...s.user, matchScore: Math.round(s.score * 100) }));
  },
});
