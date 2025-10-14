import { create } from 'zustand';
import type { UserProfile } from '../../../shared/types/common.types';

interface UserProfileStore {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateLevel: (level: number, totalXp: number, title: string, xpForNextLevel: number, progressPercentage: number) => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  userProfile: null,
  setUserProfile: (userProfile) => set({ userProfile }),
  updateLevel: (level, totalXp, title, xpForNextLevel, progressPercentage) =>
    set((state) =>
      state.userProfile
        ? {
            userProfile: {
              ...state.userProfile,
              level,
              totalXp,
              currentTitle: title,
              xpForNextLevel,
              progressPercentage,
            }
          }
        : state
    ),
}));
