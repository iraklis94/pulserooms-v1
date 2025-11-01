import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/Button';
import { PulseCircle } from '@/components/mood/PulseCircle';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  title: string;
  description: string;
  emoji: string;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to PulseRooms',
    description: 'See what the world feels — and act together in 30 seconds',
    emoji: '👋',
    color: Colors.primary,
  },
  {
    title: 'Express Your Emotions',
    description: 'Share your mood through color, sound, and emotion in real-time',
    emoji: '🎨',
    color: '#FF6B6B',
  },
  {
    title: 'Connect Globally',
    description: 'Join PulseRooms and sync emotions with people feeling the same way',
    emoji: '🌍',
    color: '#6BCF7F',
  },
  {
    title: 'Build Your Streak',
    description: 'Pulse daily to maintain your streak and unlock special rewards',
    emoji: '🔥',
    color: '#FFD93D',
  },
  {
    title: 'Ready to Start?',
    description: 'Create your first pulse and join the global emotional map',
    emoji: '✨',
    color: Colors.secondary,
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      translateX.value = withSpring(-width);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        translateX.value = 0;
      }, 300);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <LinearGradient colors={[step.color, Colors.background]} style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.visualContainer}>
          {currentStep === 1 && (
            <PulseCircle color={step.color} size={150} />
          )}
          {currentStep !== 1 && (
            <Text style={styles.bigEmoji}>{step.emoji}</Text>
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        <View style={styles.pagination}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
                index === currentStep && { backgroundColor: step.color },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isLastStep ? "Let's Go!" : 'Next'}
            onPress={handleNext}
            size="large"
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 100,
    paddingHorizontal: 30,
  },
  visualContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bigEmoji: {
    fontSize: 120,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
  },
});

