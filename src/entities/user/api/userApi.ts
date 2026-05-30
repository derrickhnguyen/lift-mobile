import { apiClient } from '../../../shared/api/client';
import type { AppUser } from '../model/types';
import type { Unit } from '../../../shared/config/constants';

export const userApi = {
  getMe() {
    return apiClient.get<AppUser>('/users/me').then((r) => r.data);
  },

  updateMe(body: { unit?: Unit }) {
    return apiClient.patch<AppUser>('/users/me', body).then((r) => r.data);
  },
};
