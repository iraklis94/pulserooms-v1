export interface MoodCardDefinition {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  moodCombination: string[];
  colorGradient: string[];
  emoji: string;
}

export const MOOD_CARD_DEFINITIONS: MoodCardDefinition[] = [
  // Common cards
  {
    id: 'calm_waters',
    name: 'Calm Waters',
    description: 'Pure tranquility',
    rarity: 'common',
    moodCombination: ['calm', 'calm'],
    colorGradient: ['#6BCF7F', '#A8E6CF'],
    emoji: '🌊',
  },
  {
    id: 'joyful_burst',
    name: 'Joyful Burst',
    description: 'Uncontained happiness',
    rarity: 'common',
    moodCombination: ['joyful', 'joyful'],
    colorGradient: ['#FFD93D', '#FFF176'],
    emoji: '😊',
  },
  // Rare cards
  {
    id: 'electric_peace',
    name: 'Electric Peace',
    description: 'High energy meets calm',
    rarity: 'rare',
    moodCombination: ['hyped', 'calm'],
    colorGradient: ['#FF6B6B', '#6BCF7F'],
    emoji: '⚡',
  },
  {
    id: 'melancholic_joy',
    name: 'Melancholic Joy',
    description: 'Bittersweet beauty',
    rarity: 'rare',
    moodCombination: ['melancholic', 'joyful'],
    colorGradient: ['#7B68EE', '#FFD93D'],
    emoji: '🌗',
  },
  {
    id: 'focused_passion',
    name: 'Focused Passion',
    description: 'Intense determination',
    rarity: 'rare',
    moodCombination: ['focused', 'hyped'],
    colorGradient: ['#4D96FF', '#FF6B6B'],
    emoji: '🎯',
  },
  // Epic cards
  {
    id: 'emotional_trinity',
    name: 'Emotional Trinity',
    description: 'Three distinct emotions in harmony',
    rarity: 'epic',
    moodCombination: ['joyful', 'calm', 'focused'],
    colorGradient: ['#FFD93D', '#6BCF7F', '#4D96FF'],
    emoji: '🔱',
  },
  {
    id: 'mood_spectrum',
    name: 'Mood Spectrum',
    description: 'All emotions experienced',
    rarity: 'epic',
    moodCombination: ['hyped', 'calm', 'sad', 'joyful'],
    colorGradient: ['#FF6B6B', '#6BCF7F', '#6B6B8B', '#FFD93D'],
    emoji: '🌈',
  },
  {
    id: 'phoenix_rebirth',
    name: 'Phoenix Rebirth',
    description: 'From sadness to excitement',
    rarity: 'epic',
    moodCombination: ['sad', 'excited'],
    colorGradient: ['#6B6B8B', '#FF8C42'],
    emoji: '🔥',
  },
  // Legendary cards
  {
    id: 'emotional_master',
    name: 'Emotional Master',
    description: 'Mastered all emotions within a week',
    rarity: 'legendary',
    moodCombination: [
      'hyped',
      'excited',
      'joyful',
      'content',
      'calm',
      'focused',
      'thoughtful',
      'melancholic',
    ],
    colorGradient: [
      '#FF6B6B',
      '#FF8C42',
      '#FFD93D',
      '#A8E6CF',
      '#6BCF7F',
      '#4D96FF',
      '#8B7FD6',
      '#7B68EE',
    ],
    emoji: '👑',
  },
  {
    id: 'cosmic_balance',
    name: 'Cosmic Balance',
    description: 'Perfect emotional equilibrium',
    rarity: 'legendary',
    moodCombination: ['calm', 'focused', 'content'],
    colorGradient: ['#6BCF7F', '#4D96FF', '#A8E6CF'],
    emoji: '☯️',
  },
];

export function checkCardUnlock(
  userMoodHistory: string[],
  cardDef: MoodCardDefinition
): boolean {
  // Check if user has the required mood combination
  const userMoodSet = new Set(userMoodHistory);

  return cardDef.moodCombination.every((mood) => userMoodSet.has(mood));
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF';
    case 'rare':
      return '#3B82F6';
    case 'epic':
      return '#8B5CF6';
    case 'legendary':
      return '#F59E0B';
    default:
      return '#9CA3AF';
  }
}

