// Analytics service using PostHog and Convex
// In production, install: npm install posthog-react-native

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private userId: string | null = null;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async initialize(userId: string) {
    this.userId = userId;

    // In production:
    // import PostHog from 'posthog-react-native';
    // await PostHog.initAsync(POSTHOG_API_KEY, {
    //   host: POSTHOG_HOST,
    // });
    // PostHog.identify(userId);

    console.log('Analytics initialized for user:', userId);
  }

  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: Date.now(),
      },
    };

    // In production:
    // PostHog.capture(eventName, event.properties);

    console.log('Analytics event:', event);
  }

  // Predefined events
  trackPulseCreated(mood: string, intensity: number) {
    this.track('pulse_created', { mood, intensity });
  }

  trackRoomJoined(roomId: string, mood: string) {
    this.track('room_joined', { roomId, mood });
  }

  trackSyncPulseSent(toUserId: string) {
    this.track('sync_pulse_sent', { toUserId });
  }

  trackSyncPulseAccepted(fromUserId: string) {
    this.track('sync_pulse_accepted', { fromUserId });
  }

  trackCircleCreated(circleId: string) {
    this.track('circle_created', { circleId });
  }

  trackChainStarted(chainId: string, mood: string) {
    this.track('chain_started', { chainId, mood });
  }

  trackChallengeJoined(challengeId: string) {
    this.track('challenge_joined', { challengeId });
  }

  trackBadgeEarned(badgeType: string) {
    this.track('badge_earned', { badgeType });
  }

  trackPremiumUpgrade(plan: string) {
    this.track('premium_upgrade', { plan });
  }

  trackScreenView(screenName: string) {
    this.track('screen_view', { screenName });
  }

  // User properties
  setUserProperties(properties: Record<string, any>) {
    // In production:
    // PostHog.group('user', this.userId!, properties);

    console.log('User properties set:', properties);
  }
}

export const analytics = new AnalyticsService();

