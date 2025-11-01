export interface MoodDefinition {
  id: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const MOODS: MoodDefinition[] = [
  {
    id: 'hyped',
    label: 'Hyped',
    emoji: '🔥',
    color: '#FF6B6B',
    description: 'Full of energy and excitement',
  },
  {
    id: 'excited',
    label: 'Excited',
    emoji: '✨',
    color: '#FF8C42',
    description: 'Enthusiastic and eager',
  },
  {
    id: 'joyful',
    label: 'Joyful',
    emoji: '😊',
    color: '#FFD93D',
    description: 'Happy and cheerful',
  },
  {
    id: 'content',
    label: 'Content',
    emoji: '🌸',
    color: '#A8E6CF',
    description: 'Satisfied and peaceful',
  },
  {
    id: 'calm',
    label: 'Calm',
    emoji: '🌊',
    color: '#6BCF7F',
    description: 'Relaxed and tranquil',
  },
  {
    id: 'focused',
    label: 'Focused',
    emoji: '🎯',
    color: '#4D96FF',
    description: 'Concentrated and determined',
  },
  {
    id: 'thoughtful',
    label: 'Thoughtful',
    emoji: '💭',
    color: '#8B7FD6',
    description: 'Contemplative and reflective',
  },
  {
    id: 'melancholic',
    label: 'Melancholic',
    emoji: '🌙',
    color: '#7B68EE',
    description: 'Pensive and introspective',
  },
  {
    id: 'anxious',
    label: 'Anxious',
    emoji: '😰',
    color: '#FF6B9D',
    description: 'Worried and unsettled',
  },
  {
    id: 'sad',
    label: 'Sad',
    emoji: '😔',
    color: '#6B6B8B',
    description: 'Down and blue',
  },
];

export const getMoodById = (id: string): MoodDefinition | undefined => {
  return MOODS.find((mood) => mood.id === id);
};

export const getMoodByColor = (color: string): MoodDefinition | undefined => {
  return MOODS.find((mood) => mood.color.toLowerCase() === color.toLowerCase());
};

