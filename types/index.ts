import { Id } from '../convex/_generated/dataModel';

export interface Pulse {
  _id: Id<'pulses'>;
  _creationTime: number;
  userId: Id<'users'>;
  color: string;
  mood: string;
  moodIntensity: number;
  lat: number;
  lon: number;
  note?: string;
  soundUrl?: string;
  expiresAt: number;
}

export interface User {
  _id: Id<'users'>;
  _creationTime: number;
  clerkId: string;
  username: string;
  email: string;
  avatar?: string;
  streakDays: number;
  lastPulseAt?: number;
  premiumStatus: boolean;
  totalPulses: number;
  pulsesRemaining: number;
  lastPulseReset?: number;
}

export interface Room {
  _id: Id<'rooms'>;
  _creationTime: number;
  mood: string;
  color: string;
  activeUserIds: Id<'users'>[];
  lat: number;
  lon: number;
  expiresAt: number;
  isFusion: boolean;
}

export interface MoodCircle {
  _id: Id<'moodCircles'>;
  _creationTime: number;
  name: string;
  creatorId: Id<'users'>;
  memberIds: Id<'users'>[];
  pulseHistory: Array<{
    userId: Id<'users'>;
    mood: string;
    timestamp: number;
  }>;
  stabilityScore: number;
  circleStreak: number;
}

export interface Badge {
  _id: Id<'badges'>;
  _creationTime: number;
  userId: Id<'users'>;
  type: BadgeType;
  earnedAt: number;
  metadata?: Record<string, any>;
}

export enum BadgeType {
  FIRST_PULSE = 'first_pulse',
  STREAK_7 = 'streak_7',
  STREAK_30 = 'streak_30',
  STREAK_100 = 'streak_100',
  SYNCED_SOULS = 'synced_souls',
  CHAIN_STARTER = 'chain_starter',
  FUSION_MASTER = 'fusion_master',
  TERRITORY_CHAMPION = 'territory_champion',
  EARLY_BIRD = 'early_bird',
  NIGHT_OWL = 'night_owl',
}

export interface Territory {
  _id: Id<'territories'>;
  _creationTime: number;
  city: string;
  country: string;
  lat: number;
  lon: number;
  dominantMood: string;
  dominantColor: string;
  userCount: number;
  moodBreakdown: Record<string, number>;
  lastUpdate: number;
}

export interface Challenge {
  _id: Id<'challenges'>;
  _creationTime: number;
  title: string;
  description: string;
  sponsor?: string;
  startDate: number;
  endDate: number;
  participantIds: Id<'users'>[];
  targetMood?: string;
  isActive: boolean;
}

export interface Chain {
  _id: Id<'chains'>;
  _creationTime: number;
  starterId: Id<'users'>;
  moodType: string;
  color: string;
  participantIds: Id<'users'>[];
  reachCount: number;
  expiresAt: number;
}

export interface MoodCard {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  moodCombination: string[];
  colorGradient: string[];
  unlocked: boolean;
}

export interface SyncPulseRequest {
  _id: Id<'syncPulseRequests'>;
  _creationTime: number;
  fromUserId: Id<'users'>;
  toUserId: Id<'users'>;
  color: string;
  mood: string;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface Quest {
  _id: Id<'quests'>;
  _creationTime: number;
  userId: Id<'users'>;
  type: QuestType;
  description: string;
  progress: number;
  target: number;
  reward: string;
  completedAt?: number;
  expiresAt: number;
}

export enum QuestType {
  INVITE_FRIENDS = 'invite_friends',
  PULSE_STREAK = 'pulse_streak',
  JOIN_CIRCLES = 'join_circles',
  START_CHAIN = 'start_chain',
  VISIT_TERRITORIES = 'visit_territories',
}

export interface MoodHistory {
  _id: Id<'moodHistory'>;
  _creationTime: number;
  userId: Id<'users'>;
  date: string; // YYYY-MM-DD
  moods: Array<{
    mood: string;
    color: string;
    intensity: number;
    timestamp: number;
  }>;
  aiSummary?: string;
  dominantMood: string;
}

export interface AIAvatar {
  _id: Id<'aiAvatars'>;
  _creationTime: number;
  userId: Id<'users'>;
  name: string;
  visualData: string; // Base64 or URL
  moodPattern: string[];
  lastUpdated: number;
  evolution: number;
}

