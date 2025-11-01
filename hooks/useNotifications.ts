import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
} from '@/services/notifications';
import { Id } from '@/convex/_generated/dataModel';

export function useNotifications(userId: Id<'users'> | undefined) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);

  const unreadNotifications = useQuery(
    api.notifications.getUserNotifications,
    userId ? { userId, unreadOnly: true } : 'skip'
  );

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });

    // Listen for notifications while app is open
    const receivedSubscription = addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for notification taps
    const responseSubscription = addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification type
      const data = response.notification.request.content.data;
      
      // Route to appropriate screen based on notification type
      if (data?.type === 'sync_pulse_request') {
        // Navigate to sync pulse modal
      } else if (data?.type === 'circle_activity') {
        // Navigate to circle
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return {
    expoPushToken,
    unreadCount: unreadNotifications?.length || 0,
    latestNotification: notification,
  };
}

