import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  // Core user data
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    avatar: v.optional(v.string()),
    streakDays: v.number(),
    lastPulseAt: v.optional(v.number()),
    premiumStatus: v.boolean(),
    totalPulses: v.number(),
    pulsesRemaining: v.number(),
    lastPulseReset: v.optional(v.number()),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_username', ['username'])
    .index('by_streak', ['streakDays']),

  // Mood pulses
  pulses: defineTable({
    userId: v.id('users'),
    color: v.string(),
    mood: v.string(),
    moodIntensity: v.number(),
    lat: v.number(),
    lon: v.number(),
    note: v.optional(v.string()),
    soundUrl: v.optional(v.string()),
    expiresAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_expiration', ['expiresAt'])
    .index('by_location', ['lat', 'lon'])
    .index('by_mood', ['mood']),

  // Real-time ephemeral rooms
  rooms: defineTable({
    mood: v.string(),
    color: v.string(),
    activeUserIds: v.array(v.id('users')),
    lat: v.number(),
    lon: v.number(),
    expiresAt: v.number(),
    isFusion: v.boolean(),
  })
    .index('by_expiration', ['expiresAt'])
    .index('by_mood', ['mood'])
    .index('by_location', ['lat', 'lon']),

  // Private mood circles
  moodCircles: defineTable({
    name: v.string(),
    creatorId: v.id('users'),
    memberIds: v.array(v.id('users')),
    pulseHistory: v.array(
      v.object({
        userId: v.id('users'),
        mood: v.string(),
        timestamp: v.number(),
      })
    ),
    stabilityScore: v.number(),
    circleStreak: v.number(),
  })
    .index('by_creator', ['creatorId'])
    .index('by_member', ['memberIds']),

  // Pulse chains
  chains: defineTable({
    starterId: v.id('users'),
    moodType: v.string(),
    color: v.string(),
    participantIds: v.array(v.id('users')),
    reachCount: v.number(),
    expiresAt: v.number(),
  })
    .index('by_starter', ['starterId'])
    .index('by_expiration', ['expiresAt'])
    .index('by_reach', ['reachCount']),

  // Global challenges
  challenges: defineTable({
    title: v.string(),
    description: v.string(),
    sponsor: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.number(),
    participantIds: v.array(v.id('users')),
    targetMood: v.optional(v.string()),
    isActive: v.boolean(),
  })
    .index('by_active', ['isActive'])
    .index('by_date', ['startDate', 'endDate']),

  // Badges and achievements
  badges: defineTable({
    userId: v.id('users'),
    type: v.string(),
    earnedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type'])
    .index('by_user_type', ['userId', 'type']),

  // Territory data (cities/regions)
  territories: defineTable({
    city: v.string(),
    country: v.string(),
    lat: v.number(),
    lon: v.number(),
    dominantMood: v.string(),
    dominantColor: v.string(),
    userCount: v.number(),
    moodBreakdown: v.any(), // Record<string, number>
    lastUpdate: v.number(),
  })
    .index('by_city', ['city', 'country'])
    .index('by_location', ['lat', 'lon'])
    .index('by_user_count', ['userCount'])
    .index('by_update', ['lastUpdate']),

  // Mood history for AI analysis
  moodHistory: defineTable({
    userId: v.id('users'),
    date: v.string(), // YYYY-MM-DD
    moods: v.array(
      v.object({
        mood: v.string(),
        color: v.string(),
        intensity: v.number(),
        timestamp: v.number(),
      })
    ),
    aiSummary: v.optional(v.string()),
    dominantMood: v.string(),
  })
    .index('by_user', ['userId'])
    .index('by_user_date', ['userId', 'date'])
    .index('by_date', ['date']),

  // AI-generated avatars
  aiAvatars: defineTable({
    userId: v.id('users'),
    name: v.string(),
    visualData: v.string(), // Base64 or URL
    moodPattern: v.array(v.string()),
    lastUpdated: v.number(),
    evolution: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_evolution', ['evolution']),

  // Sync pulse requests
  syncPulseRequests: defineTable({
    fromUserId: v.id('users'),
    toUserId: v.id('users'),
    color: v.string(),
    mood: v.string(),
    expiresAt: v.number(),
    status: v.string(), // 'pending' | 'accepted' | 'rejected' | 'expired'
  })
    .index('by_from_user', ['fromUserId'])
    .index('by_to_user', ['toUserId'])
    .index('by_status', ['status'])
    .index('by_expiration', ['expiresAt']),

  // User quests
  quests: defineTable({
    userId: v.id('users'),
    type: v.string(),
    description: v.string(),
    progress: v.number(),
    target: v.number(),
    reward: v.string(),
    completedAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type'])
    .index('by_completion', ['completedAt'])
    .index('by_expiration', ['expiresAt']),

  // Collectible mood cards
  moodCards: defineTable({
    userId: v.id('users'),
    cardId: v.string(),
    name: v.string(),
    description: v.string(),
    rarity: v.string(), // 'common' | 'rare' | 'epic' | 'legendary'
    moodCombination: v.array(v.string()),
    colorGradient: v.array(v.string()),
    unlockedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_card_id', ['cardId'])
    .index('by_rarity', ['rarity'])
    .index('by_user_card', ['userId', 'cardId']),

  // Ephemeral DMs/chat rooms
  chatRooms: defineTable({
    participantIds: v.array(v.id('users')),
    lastMessageAt: v.number(),
    expiresAt: v.number(),
    isActive: v.boolean(),
  })
    .index('by_participants', ['participantIds'])
    .index('by_expiration', ['expiresAt'])
    .index('by_active', ['isActive']),

  // Chat messages
  chatMessages: defineTable({
    roomId: v.id('chatRooms'),
    senderId: v.id('users'),
    content: v.string(),
    timestamp: v.number(),
    expiresAt: v.number(),
  })
    .index('by_room', ['roomId'])
    .index('by_sender', ['senderId'])
    .index('by_expiration', ['expiresAt'])
    .index('by_room_time', ['roomId', 'timestamp']),

  // Friends/connections
  friendships: defineTable({
    userId: v.id('users'),
    friendId: v.id('users'),
    status: v.string(), // 'pending' | 'accepted' | 'blocked'
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_friend', ['friendId'])
    .index('by_status', ['status'])
    .index('by_user_friend', ['userId', 'friendId']),

  // Mood forecasts (AI predictions)
  moodForecasts: defineTable({
    city: v.string(),
    country: v.string(),
    date: v.string(), // YYYY-MM-DD
    predictedMood: v.string(),
    confidence: v.number(),
    moodProbabilities: v.any(), // Record<string, number>
    generatedAt: v.number(),
  })
    .index('by_city', ['city', 'country'])
    .index('by_date', ['date'])
    .index('by_city_date', ['city', 'date']),

  // Notification queue
  notifications: defineTable({
    userId: v.id('users'),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    read: v.boolean(),
    sentAt: v.optional(v.number()),
    expiresAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type'])
    .index('by_read', ['read'])
    .index('by_user_read', ['userId', 'read'])
    .index('by_expiration', ['expiresAt']),

  // Analytics events
  analyticsEvents: defineTable({
    userId: v.optional(v.id('users')),
    eventType: v.string(),
    eventData: v.any(),
    timestamp: v.number(),
    sessionId: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['eventType'])
    .index('by_timestamp', ['timestamp'])
    .index('by_user_time', ['userId', 'timestamp']),

  // Weekly pulse assignments (matches users to sync pulse together)
  weeklyPulseAssignments: defineTable({
    userId: v.id('users'),
    partnerId: v.id('users'), // The user they're matched with for this day
    weekStartDate: v.string(), // YYYY-MM-DD format for Sunday of the week
    dayOfWeek: v.number(), // 0-6 (Sunday-Saturday)
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_week', ['userId', 'weekStartDate'])
    .index('by_week', ['weekStartDate'])
    .index('by_partner', ['partnerId']),
});

