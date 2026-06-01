import { create } from 'zustand';
import { secureStorage, storage } from '../../../shared/lib/storage';
import type { AppUser, AuthProvider } from '../../../entities/user';

interface AuthState {
  user: AppUser | null;
  provider: AuthProvider | null;
  accessToken: string | null;
  isSignedIn: boolean;
  isHydrating: boolean;
  signIn: (token: string, user: AppUser, provider: AuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: AppUser) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  provider: null,
  accessToken: null,
  isSignedIn: false,
  isHydrating: true,

  signIn: async (token, user, provider) => {
    await secureStorage.set('access_token', token);
    await storage.set('user', user);
    await storage.set('provider', provider);
    set({ accessToken: token, user, provider, isSignedIn: true });
  },

  signOut: async () => {
    await secureStorage.remove('access_token');
    await storage.remove('user');
    await storage.remove('provider');
    await storage.remove('activeSession');
    set({ accessToken: null, user: null, provider: null, isSignedIn: false });
  },

  hydrate: async () => {
    const token = await secureStorage.get('access_token');
    const user = await storage.get<AppUser | null>('user', null);
    const provider = await storage.get<AuthProvider | null>('provider', null);
    set({
      accessToken: token,
      user,
      provider,
      isSignedIn: !!token && !!user,
      isHydrating: false,
    });
  },

  setUser: (user) => set({ user }),
}));
