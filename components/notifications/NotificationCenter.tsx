import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface NotificationCenterProps {
  userId: Id<'users'>;
}

function NotificationItem({ notification, onPress }: { notification: any; onPress: () => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'sync_pulse_request':
        return '💫';
      case 'sync_pulse_accepted':
        return '✅';
      case 'circle_activity':
        return '👥';
      case 'territory_change':
        return '🏙️';
      case 'streak_reminder':
        return '🔥';
      case 'milestone_reminder':
        return '🎯';
      case 'quest_completed':
        return '🎉';
      default:
        return '📬';
    }
  };

  const timeAgo = () => {
    if (!notification.sentAt) return 'Just now';
    
    const seconds = Math.floor((Date.now() - notification.sentAt) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={[styles.notificationCard, !notification.read && styles.unreadCard]}>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationIcon}>{getIcon(notification.type)}</Text>
          <View style={styles.notificationText}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationBody}>{notification.body}</Text>
            <Text style={styles.notificationTime}>{timeAgo()}</Text>
          </View>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const notifications = useQuery(
    api.notifications.getUserNotifications,
    { userId, unreadOnly: false }
  );

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const handleNotificationPress = async (notification: any) => {
    if (!notification.read) {
      await markAsRead({ notificationId: notification._id });
    }
    // Handle navigation based on notification data
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead({ userId });
  };

  if (!notifications || notifications.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🔔</Text>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptySubtitle}>You're all caught up!</Text>
      </View>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  markAllRead: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  list: {
    padding: 20,
  },
  notificationCard: {
    marginBottom: 12,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

