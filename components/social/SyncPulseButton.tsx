import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface SyncPulseButtonProps {
  fromUserId: Id<'users'>;
  toUserId: Id<'users'>;
  currentMood?: string;
  currentColor?: string;
}

export function SyncPulseButton({
  fromUserId,
  toUserId,
  currentMood = 'calm',
  currentColor = Colors.primary,
}: SyncPulseButtonProps) {
  const [sending, setSending] = useState(false);
  const sendSyncRequest = useMutation(api.sync.sendRequest);

  const handleSend = async () => {
    setSending(true);

    try {
      await sendSyncRequest({
        fromUserId,
        toUserId,
        mood: currentMood,
        color: currentColor,
      });

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Sync Pulse Sent!', 'Waiting for response...');
    } catch (error) {
      console.error('Error sending sync pulse:', error);
      Alert.alert('Error', 'Failed to send sync pulse');
    } finally {
      setSending(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: currentColor }]}
      onPress={handleSend}
      disabled={sending}
    >
      <Text style={styles.icon}>💫</Text>
      <Text style={styles.text}>{sending ? 'Sending...' : 'Sync Pulse'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

