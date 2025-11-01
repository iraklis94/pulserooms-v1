import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';

interface RippleEffectProps {
  color: string;
  size?: number;
  rippleCount?: number;
  duration?: number;
}

function SingleRipple({
  color,
  size,
  delay,
  duration,
}: {
  color: string;
  size: number;
  delay: number;
  duration: number;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    setTimeout(() => {
      scale.value = withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 0 }),
          withTiming(0, { duration, easing: Easing.out(Easing.ease) })
        ),
        -1,
        false
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: color,
    position: 'absolute',
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

export function RippleEffect({
  color,
  size = 200,
  rippleCount = 3,
  duration = 2000,
}: RippleEffectProps) {
  const ripples = Array.from({ length: rippleCount }, (_, i) => i);

  return (
    <View style={styles.container}>
      {ripples.map((index) => (
        <SingleRipple
          key={index}
          color={color}
          size={size}
          delay={index * (duration / rippleCount)}
          duration={duration}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

