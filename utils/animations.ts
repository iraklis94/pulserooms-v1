import { Easing } from 'react-native-reanimated';

// Standard easing curves for consistent animations
export const easings = {
  smooth: Easing.inOut(Easing.ease),
  bounce: Easing.bounce,
  spring: Easing.elastic(1.2),
  linear: Easing.linear,
};

// Standard animation durations
export const durations = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
};

// Animation configs for common use cases
export const animationConfigs = {
  fadeIn: {
    duration: durations.normal,
    easing: easings.smooth,
  },
  slideIn: {
    duration: durations.normal,
    easing: easings.smooth,
  },
  pulse: {
    duration: durations.slow,
    easing: easings.smooth,
  },
  bounce: {
    duration: durations.normal,
    easing: easings.bounce,
  },
};

// Reduce motion for accessibility
export function shouldReduceMotion(): boolean {
  // In production, check system settings
  // AccessibilityInfo.isReduceMotionEnabled()
  return false;
}

// Get animation duration based on device performance
export function getOptimalDuration(baseDuration: number): number {
  // In production, detect device performance
  // For now, return base duration
  return baseDuration;
}

