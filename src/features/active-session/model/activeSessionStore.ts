import { create } from 'zustand';
import { workoutApi } from '../../../entities/workout';
import type { LocalSession, LocalWorkoutExercise, LocalSet } from '../../../entities/workout';
import type { Exercise } from '../../../entities/exercise';
import type { Unit } from '../../../shared/config/constants';

function genLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface ActiveSessionState {
  session: LocalSession | null;
  isSaving: boolean;
  restTimer: { endsAt: number; total: number } | null;

  start: (name: string, startedAt: string) => Promise<void>;
  updateName: (name: string) => void;
  addExercise: (exercise: Exercise, defaultUnit: Unit) => Promise<void>;
  removeExercise: (localId: string) => Promise<void>;
  setSupersetGroup: (localId: string, groupId: string | null) => Promise<void>;
  addSet: (exerciseLocalId: string, defaultUnit: Unit) => Promise<void>;
  updateSet: (exerciseLocalId: string, setLocalId: string, data: Partial<LocalSet>) => Promise<void>;
  deleteSet: (exerciseLocalId: string, setLocalId: string) => Promise<void>;
  startRestTimer: (seconds: number) => void;
  adjustRestTimer: (delta: number) => void;
  clearRestTimer: () => void;
  discard: () => Promise<void>;
}

export const useActiveSessionStore = create<ActiveSessionState>((set, get) => ({
  session: null,
  isSaving: false,
  restTimer: null,

  start: async (name, startedAt) => {
    // Try to create on server; fall back to local-only if auth isn't wired up yet
    let serverId: string | null = null;
    try {
      const serverSession = await workoutApi.create({ name, started_at: startedAt });
      serverId = serverSession.id;
    } catch {}
    set({
      session: {
        serverId,
        name,
        started_at: startedAt,
        exercises: [],
      },
    });
  },

  updateName: (name) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, name } });
    if (session.serverId) {
      workoutApi.update(session.serverId, { name }).catch(() => {});
    }
  },

  addExercise: async (exercise, defaultUnit) => {
    const { session } = get();
    if (!session?.serverId) return;
    const serverEx = await workoutApi.addExercise(session.serverId, {
      exercise_id: exercise.id,
    });
    const local: LocalWorkoutExercise = {
      localId: genLocalId(),
      serverId: serverEx.id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      superset_group_id: null,
      sets: [],
    };
    set({ session: { ...session, exercises: [...session.exercises, local] } });
  },

  removeExercise: async (localId) => {
    const { session } = get();
    if (!session?.serverId) return;
    const ex = session.exercises.find((e) => e.localId === localId);
    if (!ex) return;
    set({
      session: {
        ...session,
        exercises: session.exercises.filter((e) => e.localId !== localId),
      },
    });
    if (ex.serverId) {
      workoutApi.removeExercise(session.serverId, ex.serverId).catch(() => {});
    }
  },

  setSupersetGroup: async (localId, groupId) => {
    const { session } = get();
    if (!session?.serverId) return;
    const updated = session.exercises.map((e) =>
      e.localId === localId ? { ...e, superset_group_id: groupId } : e,
    );
    set({ session: { ...session, exercises: updated } });
    const ex = updated.find((e) => e.localId === localId);
    if (ex?.serverId) {
      // Re-add exercise with the updated superset_group_id
      workoutApi
        .addExercise(session.serverId, {
          exercise_id: ex.exercise_id,
          superset_group_id: groupId ?? undefined,
        })
        .catch(() => {});
    }
  },

  addSet: async (exerciseLocalId, defaultUnit) => {
    const { session } = get();
    if (!session?.serverId) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex?.serverId) return;
    const last = ex.sets[ex.sets.length - 1];
    const newWeight = last?.weight ?? (defaultUnit === 'kg' ? 20 : 45);
    const newUnit = last?.unit ?? defaultUnit;
    const newReps = last?.reps ?? 10;

    const serverSet = await workoutApi.createSet(session.serverId, ex.serverId, {
      weight: newWeight,
      unit: newUnit,
      reps: newReps,
    });
    const localSet: LocalSet = {
      localId: genLocalId(),
      serverId: serverSet.id,
      weight: serverSet.weight,
      unit: serverSet.unit,
      reps: serverSet.reps,
      dropset_group_id: null,
    };
    const updatedExercises = session.exercises.map((e) =>
      e.localId === exerciseLocalId
        ? { ...e, sets: [...e.sets, localSet] }
        : e,
    );
    set({ session: { ...session, exercises: updatedExercises } });
  },

  updateSet: async (exerciseLocalId, setLocalId, data) => {
    const { session } = get();
    if (!session?.serverId) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex?.serverId) return;
    const s = ex.sets.find((x) => x.localId === setLocalId);
    if (!s) return;

    const merged = { ...s, ...data };
    const updatedExercises = session.exercises.map((e) =>
      e.localId === exerciseLocalId
        ? { ...e, sets: e.sets.map((x) => (x.localId === setLocalId ? merged : x)) }
        : e,
    );
    set({ session: { ...session, exercises: updatedExercises } });

    if (s.serverId) {
      workoutApi
        .updateSet(session.serverId, ex.serverId, s.serverId, {
          weight: merged.weight,
          unit: merged.unit,
          reps: merged.reps,
        })
        .catch(() => {});
    }
  },

  deleteSet: async (exerciseLocalId, setLocalId) => {
    const { session } = get();
    if (!session?.serverId) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex?.serverId) return;
    const s = ex.sets.find((x) => x.localId === setLocalId);
    const updatedExercises = session.exercises.map((e) =>
      e.localId === exerciseLocalId
        ? { ...e, sets: e.sets.filter((x) => x.localId !== setLocalId) }
        : e,
    );
    set({ session: { ...session, exercises: updatedExercises } });
    if (s?.serverId) {
      workoutApi
        .removeSet(session.serverId, ex.serverId, s.serverId)
        .catch(() => {});
    }
  },

  startRestTimer: (seconds) => {
    set({ restTimer: { endsAt: Date.now() + seconds * 1000, total: seconds } });
  },

  adjustRestTimer: (delta) => {
    set((state) => {
      if (!state.restTimer) return state;
      const newEndsAt = Math.max(Date.now(), state.restTimer.endsAt + delta * 1000);
      const newTotal = Math.max(15, state.restTimer.total + delta);
      return { restTimer: { endsAt: newEndsAt, total: newTotal } };
    });
  },

  clearRestTimer: () => set({ restTimer: null }),

  discard: async () => {
    const { session } = get();
    if (session?.serverId) {
      workoutApi.remove(session.serverId).catch(() => {});
    }
    set({ session: null, restTimer: null });
  },
}));
