import { create } from 'zustand';
import { workoutApi } from '../../../entities/workout';
import type { WorkoutSession } from '../../../entities/workout';

interface WorkoutHistoryState {
  sessions: WorkoutSession[];
  nextCursor: string | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchInitial: () => Promise<void>;
  fetchMore: () => Promise<void>;
  prependSession: (session: WorkoutSession) => void;
  reset: () => void;
}

export const useWorkoutHistoryStore = create<WorkoutHistoryState>((set, get) => ({
  sessions: [],
  nextCursor: null,
  isLoading: false,
  isLoadingMore: false,
  hasLoaded: false,
  error: null,

  fetchInitial: async () => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const res = await workoutApi.list({ limit: 20 });
      set({ sessions: res.data, nextCursor: res.next_cursor, hasLoaded: true });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load workouts' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { nextCursor, isLoadingMore, sessions } = get();
    if (!nextCursor || isLoadingMore) return;
    set({ isLoadingMore: true });
    try {
      const res = await workoutApi.list({ limit: 20, cursor: nextCursor });
      set({ sessions: [...sessions, ...res.data], nextCursor: res.next_cursor });
    } catch {}
    finally { set({ isLoadingMore: false }); }
  },

  prependSession: (session) =>
    set((s) => ({ sessions: [session, ...s.sessions] })),

  reset: () =>
    set({ sessions: [], nextCursor: null, hasLoaded: false, error: null }),
}));
