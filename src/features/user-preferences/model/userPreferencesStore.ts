import { create } from 'zustand';
import { storage } from '../../../shared/lib/storage';
import { userApi } from '../../../entities/user';
import type { Unit } from '../../../shared/config/constants';
import type { AppTheme } from '../../../shared/config/theme';

interface UserPreferencesState {
  unit: Unit;
  theme: AppTheme;
  setUnit: (unit: Unit) => Promise<void>;
  setTheme: (theme: AppTheme) => void;
  hydrate: () => Promise<void>;
}

export const useUserPreferencesStore = create<UserPreferencesState>((set) => ({
  unit: 'lbs',
  theme: 'dark',

  setUnit: async (unit) => {
    set({ unit });
    await storage.set('unit', unit);
    try {
      await userApi.updateMe({ unit });
    } catch {}
  },

  setTheme: (theme) => {
    set({ theme });
    storage.set('theme', theme);
  },

  hydrate: async () => {
    const unit = await storage.get<Unit>('unit', 'lbs');
    const theme = await storage.get<AppTheme>('theme', 'dark');
    set({ unit, theme });
  },
}));
