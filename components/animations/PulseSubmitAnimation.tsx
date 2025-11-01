import { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ParticleExplosion } from './ParticleExplosion';
import { RippleEffect } from './RippleEffect';

const { width, height } = Dimensions.get('window');

interface PulseSubmitAnimationProps {
  color: string;
  onComplete: () => void;
}

export function PulseSubmitAnimation({ color, onComplete }: PulseSubmitAnimationProps) {
  const [showParticles, setShowParticles] = useState(false);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Initial scale up with spring
    scale.value = withSpring(1, { damping: 10 }, () => {
      // Show particles after scale up
      runOnJS(setShowParticles)(true);
      
      // Then scale down and fade out
      scale.value = withSequence(
        withTiming(1.2, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );
      
      opacity.value = withTiming(0, { duration: 500 }, () => {
        runOnJS(onComplete)();
      });
    });
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <Animated.View style={[styles.circle, circleStyle]}>
          <View style={[styles.innerCircle, { backgroundColor: color }]} />
          <RippleEffect color={color} size={200} />
        </Animated.View>

        {showParticles && (
          <ParticleExplosion
            centerX={width / 2}
            centerY={height / 2}
            color={color}
            particleCount={30}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

