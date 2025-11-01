import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

// Get user's mood cards
export const getUserCards = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('moodCards')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
  },
});

// Unlock a new card
export const unlock = mutation({
  args: {
    userId: v.id('users'),
    cardId: v.string(),
    name: v.string(),
    description: v.string(),
    rarity: v.string(),
    moodCombination: v.array(v.string()),
    colorGradient: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already unlocked
    const existing = await ctx.db
      .query('moodCards')
      .withIndex('by_user_card', (q) =>
        q.eq('userId', args.userId).eq('cardId', args.cardId)
      )
      .first();

    if (existing) {
      return existing._id; // Already unlocked
    }

    const now = Date.now();
    return await ctx.db.insert('moodCards', {
      userId: args.userId,
      cardId: args.cardId,
      name: args.name,
      description: args.description,
      rarity: args.rarity,
      moodCombination: args.moodCombination,
      colorGradient: args.colorGradient,
      unlockedAt: now,
    });
  },
});

// Get cards by rarity
export const getByRarity = query({
  args: {
    userId: v.id('users'),
    rarity: v.string(),
  },
  handler: async (ctx, args) => {
    const allUserCards = await ctx.db
      .query('moodCards')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return allUserCards.filter((card) => card.rarity === args.rarity);
  },
});

// Get collection stats
export const getCollectionStats = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query('moodCards')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const rarityCounts: Record<string, number> = {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };

    cards.forEach((card) => {
      if (rarityCounts[card.rarity] !== undefined) {
        rarityCounts[card.rarity]++;
      }
    });

    return {
      totalCards: cards.length,
      rarityCounts,
      recentlyUnlocked: cards
        .sort((a, b) => b.unlockedAt - a.unlockedAt)
        .slice(0, 5),
    };
  },
});

