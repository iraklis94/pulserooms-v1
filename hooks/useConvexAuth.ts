import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-expo';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useConvexAuth() {
  const { user, isLoaded } = useUser();
  const upsertUser = useMutation(api.users.upsertFromClerk);

  useEffect(() => {
    if (isLoaded && user) {
      const syncUser = async () => {
        try {
          await upsertUser({
            clerkId: user.id,
            username: user.username || user.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
            email: user.emailAddresses[0]?.emailAddress || '',
            avatar: user.imageUrl,
          });
        } catch (error) {
          console.error('Error syncing user with Convex:', error);
        }
      };

      syncUser();
    }
  }, [isLoaded, user]);

  return { user, isLoaded };
}

