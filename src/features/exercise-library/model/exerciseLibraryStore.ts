import { create } from 'zustand';
import { exerciseApi } from '../../../entities/exercise';
import type { Exercise } from '../../../entities/exercise';
import type { MuscleGroup } from '../../../shared/config/constants';

interface ExerciseLibraryState {
  exercises: Exercise[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addCustom: (name: string, muscleGroup: MuscleGroup) => Promise<void>;
  deleteCustom: (id: string) => Promise<void>;
}

export const useExerciseLibraryStore = create<ExerciseLibraryState>((set, get) => ({
  exercises: [],
  isLoading: false,
  hasLoaded: false,
  error: null,

  fetchAll: async () => {
    if (get().hasLoaded) return;
    set({ isLoading: true, error: null });
    try {
      const data = await exerciseApi.list({ limit: 200 });
      set({ exercises: data, hasLoaded: true });
    } catch (e: any) {
      set({ error: e?.message ?? 'Failed to load exercises' });
    } finally {
      set({ isLoading: false });
    }
  },

  addCustom: async (name, muscleGroup) => {
    const created = await exerciseApi.create({ name, muscle_group: muscleGroup });
    set((s) => ({ exercises: [...s.exercises, created] }));
  },

  deleteCustom: async (id) => {
    await exerciseApi.remove(id);
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }));
  },
}));
