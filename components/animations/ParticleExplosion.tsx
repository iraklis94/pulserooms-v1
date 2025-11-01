import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface ParticleExplosionProps {
  centerX: number;
  centerY: number;
  color: string;
  particleCount?: number;
  onComplete?: () => void;
}

function ParticleItem({ particle, onComplete }: { particle: Particle; onComplete: () => void }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * 150;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;

    translateX.value = withTiming(targetX, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    });

    translateY.value = withTiming(targetY, {
      duration: 1000,
      easing: Easing.out(Easing.ease),
    }, onComplete);

    scale.value = withSequence(
      withTiming(1.5, { duration: 200 }),
      withTiming(0, { duration: 800 })
    );

    opacity.value = withTiming(0, { duration: 1000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: particle.x,
    top: particle.y,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: particle.color,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} />;
}

export function ParticleExplosion({
  centerX,
  centerY,
  color,
  particleCount = 20,
  onComplete,
}: ParticleExplosionProps) {
  const particles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: centerX,
    y: centerY,
    color,
  }));

  let completedCount = 0;

  const handleParticleComplete = () => {
    completedCount++;
    if (completedCount === particleCount && onComplete) {
      onComplete();
    }
  };

  return (
    <>
      {particles.map((particle) => (
        <ParticleItem
          key={particle.id}
          particle={particle}
          onComplete={handleParticleComplete}
        />
      ))}
    </>
  );
}

