import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../../features/auth';
import { useUserPreferencesStore } from '../../features/user-preferences';
import { AuthPage } from '../../pages/auth';
import { SessionDetailPage } from '../../pages/session';
import { ActiveSessionPage } from '../../pages/session';
import { ProgressDetailPage } from '../../pages/progress';
import { SummaryPage } from '../../pages/summary';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isSignedIn, isHydrating, hydrate } = useAuthStore();
  const { hydrate: hydratePrefs } = useUserPreferencesStore();

  useEffect(() => {
    hydrate();
    hydratePrefs();
  }, []);

  if (isHydrating) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isSignedIn ? (
        <Stack.Screen name="Auth" component={AuthPage} />
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen
            name="ActiveSession"
            component={ActiveSessionPage}
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="SessionDetail"
            component={SessionDetailPage}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="ProgressDetail"
            component={ProgressDetailPage}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="Summary"
            component={SummaryPage}
            options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
