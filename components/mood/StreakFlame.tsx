import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Colors } from '@/constants/Colors';

interface StreakFlameProps {
  streakDays: number;
  size?: number;
}

export function StreakFlame({ streakDays, size = 60 }: StreakFlameProps) {
  const flicker = useSharedValue(0);

  useEffect(() => {
    flicker.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(flicker.value, [0, 1], [0.95, 1.05]);
    const brightness = interpolate(flicker.value, [0, 1], [0.9, 1]);

    return {
      transform: [{ scale }],
      opacity: brightness,
    };
  });

  const getFlameIntensity = () => {
    if (streakDays === 0) return 0.3;
    if (streakDays < 7) return 0.6;
    if (streakDays < 30) return 0.8;
    return 1.0;
  };

  const intensity = getFlameIntensity();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flame, animatedStyle, { opacity: intensity }]}>
        <Text style={[styles.emoji, { fontSize: size }]}>🔥</Text>
      </Animated.View>
      <Text style={styles.count}>{streakDays}</Text>
      <Text style={styles.label}>day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  flame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textShadowColor: '#FF6B00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  count: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

