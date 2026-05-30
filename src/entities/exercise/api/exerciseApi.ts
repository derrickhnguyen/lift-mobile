import { apiClient } from '../../../shared/api/client';
import type { Exercise, ProgressPoint } from '../model/types';
import type { MuscleGroup } from '../../../shared/config/constants';

export const exerciseApi = {
  list(params?: { muscle_group?: MuscleGroup; limit?: number }) {
    return apiClient
      .get<Exercise[]>('/exercises', { params })
      .then((r) => r.data);
  },

  create(body: { name: string; muscle_group: MuscleGroup }) {
    return apiClient.post<Exercise>('/exercises', body).then((r) => r.data);
  },

  remove(id: string) {
    return apiClient.delete(`/exercises/${id}`);
  },

  getProgress(id: string) {
    return apiClient
      .get<ProgressPoint[]>(`/exercises/${id}/progress`)
      .then((r) => r.data);
  },
};
