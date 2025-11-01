import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export function useSyncPulseListener(userId: Id<'users'> | undefined) {
  const [activeRequest, setActiveRequest] = useState<any | null>(null);

  const pendingRequests = useQuery(
    api.sync.getPendingRequests,
    userId ? { userId } : 'skip'
  );

  useEffect(() => {
    if (pendingRequests && pendingRequests.length > 0) {
      // Show modal for the most recent request
      setActiveRequest(pendingRequests[0]);
    } else {
      setActiveRequest(null);
    }
  }, [pendingRequests?.length]);

  const clearActiveRequest = () => {
    setActiveRequest(null);
  };

  return {
    activeRequest,
    clearActiveRequest,
  };
}

