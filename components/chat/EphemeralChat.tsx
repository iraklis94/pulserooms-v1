import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Id } from '@/convex/_generated/dataModel';

interface EphemeralChatProps {
  roomId: Id<'chatRooms'>;
  currentUserId: Id<'users'>;
}

function ChatMessage({ message, isOwn }: { message: any; isOwn: boolean }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Calculate fade timing based on expiration
    const timeRemaining = message.expiresAt - Date.now();
    const fadeStartTime = Math.max(0, timeRemaining - 30000); // Start fading 30s before expiration

    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 30000 });
    }, fadeStartTime);
  }, [message._id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const timeSinceCreation = Date.now() - message.timestamp;
  const secondsAgo = Math.floor(timeSinceCreation / 1000);

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        isOwn ? styles.ownMessage : styles.otherMessage,
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.messageTime}>{secondsAgo}s</Text>
      </View>
    </Animated.View>
  );
}

export function EphemeralChat({ roomId, currentUserId }: EphemeralChatProps) {
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const messages = useQuery(api.chat.getMessages, { roomId });
  const sendMessage = useMutation(api.chat.sendMessage);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages?.length]);

  const handleSend = async () => {
    if (!messageText.trim()) return;

    try {
      await sendMessage({
        roomId,
        senderId: currentUserId,
        content: messageText.trim(),
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.warningBanner}>
        <Text style={styles.warningIcon}>⏱️</Text>
        <Text style={styles.warningText}>
          Messages fade after 5 minutes • Room disappears when empty
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ChatMessage
            message={item}
            isOwn={item.senderId === currentUserId}
          />
        )}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textTertiary}
          value={messageText}
          onChangeText={(text) => {
            setMessageText(text);
            setIsTyping(text.length > 0);
          }}
          multiline
          maxLength={200}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warning + '20',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    fontSize: 11,
    color: Colors.warning,
    fontWeight: '600',
  },
  messagesList: {
    padding: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: Colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.textSecondary,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundSecondary,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
  },
});

