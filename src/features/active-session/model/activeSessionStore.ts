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

  start: (name: string, startedAt: string) => Promise<void>;
  updateName: (name: string) => void;
  reorderExercises: (exercises: LocalWorkoutExercise[]) => void;
  addExercise: (exercise: Exercise, defaultUnit: Unit) => Promise<void>;
  removeExercise: (localId: string) => Promise<void>;
  setSupersetGroup: (localId: string, groupId: string | null) => Promise<void>;
  addSet: (exerciseLocalId: string, defaultUnit: Unit) => Promise<void>;
  updateSet: (exerciseLocalId: string, setLocalId: string, data: Partial<LocalSet>) => Promise<void>;
  deleteSet: (exerciseLocalId: string, setLocalId: string) => Promise<void>;
  finish: () => void;
  discard: () => Promise<void>;
}

export const useActiveSessionStore = create<ActiveSessionState>((set, get) => ({
  session: null,

  start: async (name, startedAt) => {
    let serverId: string | null = null;
    try {
      const serverSession = await workoutApi.create({ name, started_at: startedAt });
      serverId = serverSession.id;
    } catch {}
    set({ session: { serverId, name, started_at: startedAt, exercises: [] } });
  },

  updateName: (name) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, name } });
    if (session.serverId) {
      workoutApi.update(session.serverId, { name }).catch(() => {});
    }
  },

  reorderExercises: (exercises) => {
    const { session } = get();
    if (!session) return;
    set({ session: { ...session, exercises } });
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

    set({ session: { ...session, exercises: [...session.exercises, local] } });

    if (session.serverId) {
      workoutApi
        .addExercise(session.serverId, { exercise_id: exercise.id })
        .then((serverEx) => {
          set((s) => {
            if (!s.session) return s;
            return {
              session: {
                ...s.session,
                exercises: s.session.exercises.map((e) =>
                  e.localId === local.localId ? { ...e, serverId: serverEx.id } : e,
                ),
              },
            };
          });
        })
        .catch(() => {});
    }
  },

  removeExercise: async (localId) => {
    const { session } = get();
    if (!session) return;
    const ex = session.exercises.find((e) => e.localId === localId);
    set({ session: { ...session, exercises: session.exercises.filter((e) => e.localId !== localId) } });
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
    set({ session: { ...session, exercises } });
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
    set({ session: updated });

    if (session.serverId && ex.serverId) {
      workoutApi
        .createSet(session.serverId, ex.serverId, { weight: newWeight, unit: newUnit, reps: newReps })
        .then((serverSet) => {
          set((s) => {
            if (!s.session) return s;
            return {
              session: {
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
              },
            };
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
    set({ session: updated });
    if (session.serverId && ex.serverId && s?.serverId) {
      workoutApi.removeSet(session.serverId, ex.serverId, s.serverId).catch(() => {});
    }
  },

  finish: () => {
    set({ session: null });
  },

  discard: async () => {
    const { session } = get();
    if (session?.serverId) {
      workoutApi.remove(session.serverId).catch(() => {});
    }
    set({ session: null });
  },
}));
