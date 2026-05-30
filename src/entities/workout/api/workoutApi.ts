import { apiClient } from '../../../shared/api/client';
import type {
  WorkoutListResponse,
  WorkoutDetail,
  WorkoutSession,
  WorkoutExerciseRecord,
  SetRecord,
} from '../model/types';
import type { Unit } from '../../../shared/config/constants';

export const workoutApi = {
  list(params?: { limit?: number; cursor?: string }) {
    return apiClient
      .get<WorkoutListResponse>('/workouts', { params })
      .then((r) => r.data);
  },

  get(id: string) {
    return apiClient
      .get<WorkoutDetail>(`/workouts/${id}`)
      .then((r) => {
        const d = r.data;
        // Normalise numeric weight strings from DB to numbers
        d.exercises?.forEach((ex) => {
          ex.sets?.forEach((s) => {
            s.weight = parseFloat(s.weight as unknown as string);
          });
        });
        return d;
      });
  },

  create(body: { name?: string; started_at: string }) {
    return apiClient.post<WorkoutSession>('/workouts', body).then((r) => r.data);
  },

  update(id: string, body: { name?: string; started_at?: string }) {
    return apiClient
      .patch<WorkoutSession>(`/workouts/${id}`, body)
      .then((r) => r.data);
  },

  remove(id: string) {
    return apiClient.delete(`/workouts/${id}`);
  },

  addExercise(
    workoutId: string,
    body: { exercise_id: string; superset_group_id?: string },
  ) {
    return apiClient
      .post<WorkoutExerciseRecord>(`/workouts/${workoutId}/exercises`, body)
      .then((r) => r.data);
  },

  removeExercise(workoutId: string, workoutExerciseId: string) {
    return apiClient.delete(
      `/workouts/${workoutId}/exercises/${workoutExerciseId}`,
    );
  },

  createSet(
    workoutId: string,
    workoutExerciseId: string,
    body: { weight: number; unit: Unit; reps: number; dropset_group_id?: string },
  ) {
    return apiClient
      .post<SetRecord>(
        `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets`,
        body,
      )
      .then((r) => {
        const s = r.data;
        s.weight = parseFloat(s.weight as unknown as string);
        return s;
      });
  },

  updateSet(
    workoutId: string,
    workoutExerciseId: string,
    setId: string,
    body: { weight?: number; unit?: Unit; reps?: number },
  ) {
    return apiClient
      .patch<SetRecord>(
        `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`,
        body,
      )
      .then((r) => {
        const s = r.data;
        s.weight = parseFloat(s.weight as unknown as string);
        return s;
      });
  },

  removeSet(workoutId: string, workoutExerciseId: string, setId: string) {
    return apiClient.delete(
      `/workouts/${workoutId}/exercises/${workoutExerciseId}/sets/${setId}`,
    );
  },
};
