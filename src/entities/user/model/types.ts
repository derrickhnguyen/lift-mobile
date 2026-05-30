import type { Unit } from '../../../shared/config/constants';

export interface AppUser {
  id: string;
  email: string;
  unit: Unit;
  created_at: string;
  updated_at: string;
}

export type AuthProvider = 'google' | 'apple' | 'facebook';
