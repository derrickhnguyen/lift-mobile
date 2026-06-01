import type { Unit } from '../../../shared/config/constants';

export interface AppUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  unit: Unit;
  created_at: string;
  updated_at: string;
}

export type AuthProvider = 'google';
