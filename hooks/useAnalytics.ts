import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { analytics } from '@/services/analytics';
import { monitoring } from '@/services/monitoring';

export function useAnalytics() {
  const { user } = useUser();
  const trackEvent = useMutation(api.analytics.trackEvent);

  useEffect(() => {
    if (user) {
      // Initialize analytics services
      analytics.initialize(user.id);
      monitoring.setUser(
        user.id,
        user.emailAddresses[0]?.emailAddress,
        user.username || undefined
      );
    }
  }, [user]);

  const track = async (eventType: string, eventData: any = {}) => {
    try {
      // Track in Convex
      if (user) {
        await trackEvent({
          userId: undefined, // Will be set from Convex context
          eventType,
          eventData,
          sessionId: analytics['sessionId'],
        });
      }

      // Track in PostHog
      analytics.track(eventType, eventData);
    } catch (error) {
      console.error('Error tracking event:', error);
      monitoring.captureException(error as Error, { eventType, eventData });
    }
  };

  return {
    track,
    trackPulseCreated: (mood: string, intensity: number) => {
      analytics.trackPulseCreated(mood, intensity);
      track('pulse_created', { mood, intensity });
    },
    trackRoomJoined: (roomId: string, mood: string) => {
      analytics.trackRoomJoined(roomId, mood);
      track('room_joined', { roomId, mood });
    },
    trackScreenView: (screenName: string) => {
      analytics.trackScreenView(screenName);
      track('screen_view', { screenName });
    },
  };
}

