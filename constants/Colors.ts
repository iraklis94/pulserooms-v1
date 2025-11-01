export const Colors = {
  // Primary mood colors
  passion: '#FF6B6B',
  joy: '#FFD93D',
  calm: '#6BCF7F',
  focus: '#4D96FF',
  melancholic: '#8B7FD6',
  excited: '#FF8C42',
  peaceful: '#A8E6CF',
  anxious: '#FF6B9D',
  
  // UI colors
  background: '#000000',
  backgroundSecondary: '#1a1a2e',
  backgroundTertiary: '#16213e',
  
  primary: '#8B5CF6',
  secondary: '#6366F1',
  accent: '#3B82F6',
  
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  
  border: '#333333',
  borderLight: '#444444',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
};

export const MoodColors: Record<string, string> = {
  hyped: '#FF6B6B',
  excited: '#FF8C42',
  joyful: '#FFD93D',
  content: '#A8E6CF',
  calm: '#6BCF7F',
  focused: '#4D96FF',
  thoughtful: '#8B7FD6',
  melancholic: '#7B68EE',
  anxious: '#FF6B9D',
  sad: '#6B6B8B',
};

export const getMoodGradient = (mood: string): string[] => {
  const color = MoodColors[mood] || Colors.primary;
  // Create a gradient by lightening and darkening the base color
  return [color, color, Colors.backgroundSecondary];
};

