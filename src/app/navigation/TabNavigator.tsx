import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../shared/ui/useTheme';
import {
  HomeIcon,
  ListIcon,
  DumbbellIcon,
  ChartIcon,
  UserIcon,
} from '../../shared/ui/Icons';
import { HomePage } from '../../pages/home';
import { LibraryPage } from '../../pages/library';
import { ProgressIndexPage } from '../../pages/progress';
import { ProfilePage } from '../../pages/profile';
import { useActiveSessionStore } from '../../features/active-session';
import { useUserPreferencesStore } from '../../features/user-preferences';
import type { MainTabParamList } from './types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const TabNavigator: React.FC = () => {
  const { colors, palette, typography } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { unit: defaultUnit } = useUserPreferencesStore();

  const handleStartWorkout = async () => {
    const name = new Date().getHours() < 12
      ? 'Morning Workout'
      : new Date().getHours() < 17
      ? 'Afternoon Workout'
      : 'Evening Workout';
    const { start } = useActiveSessionStore.getState();
    await start(name, new Date().toISOString());
    navigation.navigate('ActiveSession');
  };

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, descriptors, navigation: tabNav }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.bg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
            paddingHorizontal: 8,
            paddingTop: 8,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label = route.name;
            const isFocused = state.index === index;

            if (route.name === '__start') {
              return (
                <View key="start" style={{ flex: 1, alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={handleStartWorkout}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: palette.accent,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: -26,
                      shadowColor: palette.accent,
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    <DumbbellIcon size={26} color={palette.onAccent} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              );
            }

            const icons: Record<string, React.FC<any>> = {
              Home: HomeIcon,
              Library: ListIcon,
              Progress: ChartIcon,
              Profile: UserIcon,
            };
            const Icon = icons[route.name] ?? HomeIcon;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => tabNav.navigate(route.name)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 6,
                }}
              >
                <Icon
                  size={23}
                  color={isFocused ? colors.text : colors.text3}
                  strokeWidth={isFocused ? 2.1 : 1.8}
                />
                <Text
                  style={{
                    fontFamily: isFocused ? typography.bodyFontBold : typography.bodyFontMedium,
                    fontSize: 10.5,
                    color: isFocused ? colors.text : colors.text3,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Library" component={LibraryPage} />
      {/* Phantom screen for start button position */}
      <Tab.Screen
        name={'__start' as any}
        component={HomePage}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      <Tab.Screen name="Progress" component={ProgressIndexPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
};
