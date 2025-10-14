import { useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../../../lib/tauri/commands';
import { useUserProfileStore } from '../store/userProfileStore';

export const useUserProfile = () => {
  const { userProfile, setUserProfile } = useUserProfileStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile();
      setUserProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  }, [setUserProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  return { userProfile, loading, error, refetch: fetchUserProfile };
};
