import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { View, Text, StyleSheet } from 'react-native';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || '';
const DISABLE_AUTH = process.env.EXPO_PUBLIC_DISABLE_AUTH === 'true';

// Only create Convex client if URL is provided
const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
}) : null;

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Error component for missing configuration
function ConfigurationError() {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Configuration Required</Text>
      <Text style={styles.errorText}>
        Please set up your environment variables:
      </Text>
      <Text style={styles.errorCode}>
        EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY{'\n'}
        EXPO_PUBLIC_CONVEX_URL
      </Text>
      <Text style={styles.errorHint}>
        Create a .env file in the root directory with these values.
      </Text>
    </View>
  );
}

export default function RootLayout() {
  // Development mode: bypass auth if DISABLE_AUTH is set
  if (DISABLE_AUTH) {
    const content = (
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(modals)/room"
              options={{
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="(modals)/circle"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="(modals)/friends"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="(modals)/challenges"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="(modals)/music"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    );

    // Wrap with ClerkProvider even in dev mode so hooks work
    // Use a dummy key if CLERK_PUBLISHABLE_KEY is not set
    const clerkKey = CLERK_PUBLISHABLE_KEY || 'pk_test_dummy_key_for_dev_mode';
    
    const wrappedContent = (
      <ClerkProvider publishableKey={clerkKey} tokenCache={tokenCache}>
        {convex ? (
          <ConvexProvider client={convex}>{content}</ConvexProvider>
        ) : (
          content
        )}
      </ClerkProvider>
    );

    return wrappedContent;
  }

  // Show error if critical env vars are missing
  if (!CLERK_PUBLISHABLE_KEY || !CONVEX_URL) {
    return (
      <SafeAreaProvider>
        <ConfigurationError />
      </SafeAreaProvider>
    );
  }

  if (!convex) {
    return (
      <SafeAreaProvider>
        <ConfigurationError />
      </SafeAreaProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ConvexProvider client={convex}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(modals)/room"
                options={{
                  presentation: 'fullScreenModal',
                  animation: 'fade',
                }}
              />
              <Stack.Screen
                name="(modals)/circle"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="(modals)/friends"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="(modals)/challenges"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="(modals)/music"
                options={{
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }}
              />
            </Stack>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorCode: {
    fontSize: 14,
    color: '#8B5CF6',
    fontFamily: 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
  },
});

