import { create } from 'zustand';
import type { TimeSession } from '../../../shared/types/common.types';

interface SubtaskStore {
  activeSubtaskId: string | null;
  activeSession: TimeSession | null;
  setActiveSubtask: (subtaskId: string | null, session: TimeSession | null) => void;
  updateSession: (session: TimeSession) => void;
  updateSessionDuration: (duration: number) => void;
}

export const useSubtaskStore = create<SubtaskStore>((set) => ({
  activeSubtaskId: null,
  activeSession: null,
  setActiveSubtask: (subtaskId, session) =>
    set({ activeSubtaskId: subtaskId, activeSession: session }),
  updateSession: (session) => set({ activeSession: session }),
  updateSessionDuration: (duration) =>
    set((state) => ({
      activeSession: state.activeSession ? { ...state.activeSession, durationSeconds: duration } : null
    })),
}));
