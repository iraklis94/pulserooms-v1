import { MOODS, MoodDefinition } from '@/constants/Moods';

export function getMoodEmoji(moodId: string): string {
  const mood = MOODS.find((m) => m.id === moodId);
  return mood?.emoji || '😐';
}

export function getMoodColor(moodId: string): string {
  const mood = MOODS.find((m) => m.id === moodId);
  return mood?.color || '#8B5CF6';
}

export function getMoodLabel(moodId: string): string {
  const mood = MOODS.find((m) => m.id === moodId);
  return mood?.label || 'Unknown';
}

export function calculateMoodDiversity(moods: string[]): number {
  const uniqueMoods = new Set(moods);
  return uniqueMoods.size / MOODS.length;
}

export function getMostFrequentMood(moods: string[]): string {
  if (moods.length === 0) return '';

  const counts: Record<string, number> = {};
  moods.forEach((mood) => {
    counts[mood] = (counts[mood] || 0) + 1;
  });

  let maxCount = 0;
  let mostFrequent = '';

  for (const [mood, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = mood;
    }
  }

  return mostFrequent;
}

export function getMoodCategory(moodId: string): 'positive' | 'neutral' | 'negative' {
  const positiveMoods = ['hyped', 'excited', 'joyful', 'content', 'calm'];
  const negativeMoods = ['anxious', 'sad', 'melancholic'];

  if (positiveMoods.includes(moodId)) return 'positive';
  if (negativeMoods.includes(moodId)) return 'negative';
  return 'neutral';
}

export function getSimilarMoods(moodId: string, limit: number = 3): MoodDefinition[] {
  const currentMood = MOODS.find((m) => m.id === moodId);
  if (!currentMood) return [];

  const category = getMoodCategory(moodId);
  
  return MOODS
    .filter((m) => m.id !== moodId && getMoodCategory(m.id) === category)
    .slice(0, limit);
}

