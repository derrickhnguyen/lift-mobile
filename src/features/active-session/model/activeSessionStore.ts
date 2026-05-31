import { create } from 'zustand';
import { workoutApi } from '../../../entities/workout';
import { storage } from '../../../shared/lib/storage';
import type { LocalSession, LocalWorkoutExercise, LocalSet } from '../../../entities/workout';
import type { Exercise } from '../../../entities/exercise';
import type { Unit } from '../../../shared/config/constants';

const SESSION_STORAGE_KEY = 'activeSession';

function genLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function persist(session: LocalSession | null) {
  if (session) {
    storage.set(SESSION_STORAGE_KEY, session);
  } else {
    storage.remove(SESSION_STORAGE_KEY);
  }
}

interface ActiveSessionState {
  session: LocalSession | null;
  isHydrating: boolean;
  restTimer: { endsAt: number; total: number } | null;

  hydrate: () => Promise<void>;
  start: (name: string, startedAt: string) => Promise<void>;
  updateName: (name: string) => void;
  reorderExercises: (exercises: LocalWorkoutExercise[]) => void;
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
  isHydrating: true,
  restTimer: null,

  hydrate: async () => {
    const saved = await storage.get<LocalSession | null>(SESSION_STORAGE_KEY, null);
    set({ session: saved, isHydrating: false });
  },

  start: async (name, startedAt) => {
    let serverId: string | null = null;
    try {
      const serverSession = await workoutApi.create({ name, started_at: startedAt });
      serverId = serverSession.id;
    } catch {}
    const session: LocalSession = { serverId, name, started_at: startedAt, exercises: [] };
    persist(session);
    set({ session });
  },

  updateName: (name) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, name };
    persist(updated);
    set({ session: updated });
    if (session.serverId) {
      workoutApi.update(session.serverId, { name }).catch(() => {});
    }
  },

  reorderExercises: (exercises) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, exercises };
    persist(updated);
    set({ session: updated });
  },

  addExercise: async (exercise, _defaultUnit) => {
    const { session } = get();
    if (!session) return;

    const local: LocalWorkoutExercise = {
      localId: genLocalId(),
      serverId: null,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      muscle_group: exercise.muscle_group,
      superset_group_id: null,
      sets: [],
    };

    const updated = { ...session, exercises: [...session.exercises, local] };
    persist(updated);
    set({ session: updated });

    if (session.serverId) {
      workoutApi
        .addExercise(session.serverId, { exercise_id: exercise.id })
        .then((serverEx) => {
          set((s) => {
            if (!s.session) return s;
            const next = {
              ...s.session,
              exercises: s.session.exercises.map((e) =>
                e.localId === local.localId ? { ...e, serverId: serverEx.id } : e,
              ),
            };
            persist(next);
            return { session: next };
          });
        })
        .catch(() => {});
    }
  },

  removeExercise: async (localId) => {
    const { session } = get();
    if (!session) return;
    const ex = session.exercises.find((e) => e.localId === localId);
    const updated = { ...session, exercises: session.exercises.filter((e) => e.localId !== localId) };
    persist(updated);
    set({ session: updated });
    if (session.serverId && ex?.serverId) {
      workoutApi.removeExercise(session.serverId, ex.serverId).catch(() => {});
    }
  },

  setSupersetGroup: async (localId, groupId) => {
    const { session } = get();
    if (!session) return;
    const exercises = session.exercises.map((e) =>
      e.localId === localId ? { ...e, superset_group_id: groupId } : e,
    );
    const updated = { ...session, exercises };
    persist(updated);
    set({ session: updated });
    const ex = exercises.find((e) => e.localId === localId);
    if (session.serverId && ex?.serverId) {
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
    if (!session) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex) return;

    const last = ex.sets[ex.sets.length - 1];
    const newWeight = last?.weight ?? (defaultUnit === 'kg' ? 20 : 45);
    const newUnit = last?.unit ?? defaultUnit;
    const newReps = last?.reps ?? 10;

    const localSet: LocalSet = {
      localId: genLocalId(),
      serverId: null,
      weight: newWeight,
      unit: newUnit,
      reps: newReps,
      dropset_group_id: null,
    };

    const updated = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.localId === exerciseLocalId ? { ...e, sets: [...e.sets, localSet] } : e,
      ),
    };
    persist(updated);
    set({ session: updated });

    if (session.serverId && ex.serverId) {
      workoutApi
        .createSet(session.serverId, ex.serverId, { weight: newWeight, unit: newUnit, reps: newReps })
        .then((serverSet) => {
          set((s) => {
            if (!s.session) return s;
            const next = {
              ...s.session,
              exercises: s.session.exercises.map((e) =>
                e.localId === exerciseLocalId
                  ? {
                      ...e,
                      sets: e.sets.map((x) =>
                        x.localId === localSet.localId ? { ...x, serverId: serverSet.id } : x,
                      ),
                    }
                  : e,
              ),
            };
            persist(next);
            return { session: next };
          });
        })
        .catch(() => {});
    }
  },

  updateSet: async (exerciseLocalId, setLocalId, data) => {
    const { session } = get();
    if (!session) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex) return;
    const s = ex.sets.find((x) => x.localId === setLocalId);
    if (!s) return;

    const merged = { ...s, ...data };
    const updated = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.localId === exerciseLocalId
          ? { ...e, sets: e.sets.map((x) => (x.localId === setLocalId ? merged : x)) }
          : e,
      ),
    };
    persist(updated);
    set({ session: updated });

    if (session.serverId && ex.serverId && s.serverId) {
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
    if (!session) return;
    const ex = session.exercises.find((e) => e.localId === exerciseLocalId);
    if (!ex) return;
    const s = ex.sets.find((x) => x.localId === setLocalId);
    const updated = {
      ...session,
      exercises: session.exercises.map((e) =>
        e.localId === exerciseLocalId
          ? { ...e, sets: e.sets.filter((x) => x.localId !== setLocalId) }
          : e,
      ),
    };
    persist(updated);
    set({ session: updated });
    if (session.serverId && ex.serverId && s?.serverId) {
      workoutApi.removeSet(session.serverId, ex.serverId, s.serverId).catch(() => {});
    }
  },

  startRestTimer: (seconds) => {
    set({ restTimer: { endsAt: Date.now() + seconds * 1000, total: seconds } });
  },

  adjustRestTimer: (delta) => {
    set((state) => {
      if (!state.restTimer) return state;
      return {
        restTimer: {
          endsAt: Math.max(Date.now(), state.restTimer.endsAt + delta * 1000),
          total: Math.max(15, state.restTimer.total + delta),
        },
      };
    });
  },

  clearRestTimer: () => set({ restTimer: null }),

  discard: async () => {
    const { session } = get();
    if (session?.serverId) {
      workoutApi.remove(session.serverId).catch(() => {});
    }
    persist(null);
    set({ session: null, restTimer: null });
  },
}));
