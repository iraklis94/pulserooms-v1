import {
  getMoodEmoji,
  getMoodColor,
  getMoodLabel,
  calculateMoodDiversity,
  getMostFrequentMood,
  getMoodCategory,
} from '@/utils/mood';

describe('Mood Utilities', () => {
  describe('getMoodEmoji', () => {
    it('returns correct emoji for known mood', () => {
      expect(getMoodEmoji('calm')).toBe('🌊');
      expect(getMoodEmoji('hyped')).toBe('🔥');
    });

    it('returns default emoji for unknown mood', () => {
      expect(getMoodEmoji('unknown')).toBe('😐');
    });
  });

  describe('calculateMoodDiversity', () => {
    it('calculates diversity correctly', () => {
      const moods = ['calm', 'calm', 'excited', 'joyful'];
      const diversity = calculateMoodDiversity(moods);
      expect(diversity).toBe(3 / 10); // 3 unique moods out of 10 total moods
    });

    it('handles empty array', () => {
      const diversity = calculateMoodDiversity([]);
      expect(diversity).toBe(0);
    });
  });

  describe('getMostFrequentMood', () => {
    it('finds most frequent mood', () => {
      const moods = ['calm', 'calm', 'calm', 'excited', 'joyful'];
      expect(getMostFrequentMood(moods)).toBe('calm');
    });

    it('returns empty string for empty array', () => {
      expect(getMostFrequentMood([])).toBe('');
    });
  });

  describe('getMoodCategory', () => {
    it('categorizes positive moods correctly', () => {
      expect(getMoodCategory('joyful')).toBe('positive');
      expect(getMoodCategory('calm')).toBe('positive');
    });

    it('categorizes negative moods correctly', () => {
      expect(getMoodCategory('sad')).toBe('negative');
      expect(getMoodCategory('anxious')).toBe('negative');
    });

    it('categorizes neutral moods', () => {
      expect(getMoodCategory('focused')).toBe('neutral');
    });
  });
});

