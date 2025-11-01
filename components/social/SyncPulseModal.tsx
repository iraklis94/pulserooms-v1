import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

const { width, height } = Dimensions.get('window');

interface SyncPulseModalProps {
  visible: boolean;
  requestId: Id<'syncPulseRequests'>;
  fromUsername: string;
  color: string;
  onClose: () => void;
}

export function SyncPulseModal({
  visible,
  requestId,
  fromUsername,
  color,
  onClose,
}: SyncPulseModalProps) {
  const [timeLeft, setTimeLeft] = useState(10);
  const [accepted, setAccepted] = useState(false);
  const [showSync, setShowSync] = useState(false);

  const acceptRequest = useMutation(api.sync.acceptRequest);
  const rejectRequest = useMutation(api.sync.rejectRequest);

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // Start countdown
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleReject();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Pulse animation
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );

      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleAccept = async () => {
    try {
      await acceptRequest({ requestId });
      setAccepted(true);
      setShowSync(true);

      // Synchronized haptic pattern
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 200);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 400);

      // Show sync animation for 2 seconds
      setTimeout(() => {
        onClose();
        setShowSync(false);
        setAccepted(false);
        setTimeLeft(10);
      }, 2000);
    } catch (error) {
      console.error('Error accepting sync pulse:', error);
      onClose();
    }
  };

  const handleReject = async () => {
    try {
      await rejectRequest({ requestId });
    } catch (error) {
      console.error('Error rejecting sync pulse:', error);
    } finally {
      onClose();
      setTimeLeft(10);
    }
  };

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  if (showSync) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <LinearGradient
          colors={[color, color + 'CC', Colors.background]}
          style={styles.container}
        >
          <View style={styles.syncContainer}>
            <Animated.View style={[styles.syncPulse, animatedPulseStyle]}>
              <View
                style={[styles.syncCircle, { backgroundColor: color }]}
              />
            </Animated.View>
            <Text style={styles.syncText}>SYNCED! ✨</Text>
            <Text style={styles.syncSubtext}>
              You and {fromUsername} are connected
            </Text>
          </View>
        </LinearGradient>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <LinearGradient
          colors={[color + '40', Colors.backgroundSecondary]}
          style={styles.modalContent}
        >
          <Text style={styles.title}>Sync Pulse Request</Text>
          <Text style={styles.subtitle}>
            {fromUsername} wants to sync with you!
          </Text>

          <Animated.View style={[styles.pulseVisual, animatedPulseStyle]}>
            <View style={[styles.pulseCircle, { backgroundColor: color }]} />
          </Animated.View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <Text style={styles.actionText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton, { backgroundColor: color }]}
              onPress={handleAccept}
            >
              <Text style={styles.actionText}>Accept Sync</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  modalContent: {
    width: width - 60,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  pulseVisual: {
    marginBottom: 20,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  timerContainer: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  timerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rejectButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncPulse: {
    marginBottom: 40,
  },
  syncCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  syncText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  syncSubtext: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

