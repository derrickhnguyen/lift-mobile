import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {
  TopBar,
  WeightIcon,
  ClockIcon,
  SettingsIcon,
  TrashIcon,
  useTheme,
} from '../../../shared/ui';
import { useAuthStore } from '../../../features/auth';
import { useUserPreferencesStore } from '../../../features/user-preferences';
import { useWorkoutHistoryStore } from '../../../features/workout-history';
import { REST_TIMER_OPTIONS } from '../../../shared/config/constants';
import type { Unit } from '../../../shared/config/constants';
import type { AppTheme } from '../../../shared/config/theme';

function fmtRest(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return sec > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${m}:00`;
}

export const ProfilePage: React.FC = () => {
  const { colors, palette, typography, spacing, radii } = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { unit, defaultRest, theme, setUnit, setDefaultRest, setTheme } =
    useUserPreferencesStore();
  const { sessions, clearAll } = useWorkoutHistoryStore();
  const [isClearing, setIsClearing] = useState(false);

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : user?.first_name
    ? user.first_name.slice(0, 2).toUpperCase()
    : user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'LF';
  const totalSets = sessions.reduce(
    (a, s) => a + ((s as any).setCount ?? 0),
    0,
  );
  const totalVol = sessions.reduce(
    (a, s) => a + ((s as any).volumeLbs ?? 0),
    0,
  );

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You will need to sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear all workout history?', "This can't be undone.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          setIsClearing(true);
          try {
            await clearAll();
          } catch {
            Alert.alert('Error', 'Failed to clear history. Please try again.');
          } finally {
            setIsClearing(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar large title="Profile" />
      <ScrollView
        contentContainerStyle={{ padding: spacing.section, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: palette.accent,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontFamily: typography.displayFont,
                fontWeight: '800',
                fontSize: 24,
                color: palette.onAccent,
              }}
            >
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: typography.displayFont,
                fontWeight: '800',
                fontSize: 21,
                color: colors.text,
                letterSpacing: -0.4,
              }}
            >
              {user?.first_name && user?.last_name
              ? `${user.first_name} ${user.last_name}`
              : user?.first_name ?? user?.email?.split('@')[0] ?? 'Athlete'}
            </Text>
            <Text
              style={{
                fontFamily: typography.bodyFont,
                fontSize: 13.5,
                color: colors.text3,
                marginTop: 2,
              }}
            >
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Lifetime stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[
            { value: sessions.length, label: 'Workouts' },
            { value: totalSets, label: 'Sets' },
            { value: `${(totalVol / 1000).toFixed(0)}k`, label: 'lb moved' },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 14,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.monoFontBold,
                  fontSize: 24,
                  color: colors.text,
                  lineHeight: 26,
                }}
              >
                {s.value}
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFontSemibold,
                  fontSize: 11,
                  color: colors.text3,
                  marginTop: 6,
                }}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Preferences */}
        <Text
          style={{
            fontFamily: typography.monoFont,
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.text3,
            marginBottom: 10,
          }}
        >
          Preferences
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
            marginBottom: 8,
          }}
        >
          {/* Default unit */}
          <SettingRow
            icon={<WeightIcon size={19} color={colors.text2} />}
            title="Default weight unit"
            sub="Used for new sets"
          >
            <SegmentControl
              options={['lbs', 'kg']}
              value={unit}
              onChange={(v) => setUnit(v as Unit)}
              colors={colors}
              palette={palette}
              typography={typography}
            />
          </SettingRow>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Rest timer */}
          <SettingRow
            icon={<ClockIcon size={19} color={colors.text2} />}
            title="Rest timer"
            sub="Auto-starts after each set"
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface2,
                borderRadius: 9,
                padding: 3,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {REST_TIMER_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setDefaultRest(s)}
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 6,
                    borderRadius: 7,
                    backgroundColor: defaultRest === s ? palette.accent : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.monoFontBold,
                      fontSize: 12,
                      color: defaultRest === s ? palette.onAccent : colors.text2,
                    }}
                  >
                    {fmtRest(s)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingRow>

          <View style={{ height: 1, backgroundColor: colors.border }} />

          {/* Theme */}
          <SettingRow
            icon={<SettingsIcon size={19} color={colors.text2} />}
            title="Appearance"
            sub="Dark or light"
          >
            <SegmentControl
              options={['dark', 'light']}
              value={theme}
              onChange={(v) => setTheme(v as AppTheme)}
              colors={colors}
              palette={palette}
              typography={typography}
            />
          </SettingRow>
        </View>

        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 12,
            color: colors.text3,
            lineHeight: 18,
            paddingHorizontal: 4,
            paddingBottom: 22,
          }}
        >
          The unit is also saved on each set, so older workouts always display in the unit you logged them with — even if you switch your default.
        </Text>

        {/* Actions */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={handleClearHistory}
            disabled={sessions.length === 0 || isClearing}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              paddingVertical: 15,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border2,
              opacity: sessions.length === 0 || isClearing ? 0.5 : 1,
            }}
          >
            <TrashIcon size={17} color={colors.text} />
            <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15, color: colors.text }}>
              Clear workout history
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 15,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: '#F06A6A44',
            }}
          >
            <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15, color: '#F06A6A' }}>
              Sign out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 22 }}>
          <Text
            style={{
              fontFamily: typography.displayFont,
              fontWeight: '800',
              fontSize: 15,
              color: colors.text3,
              letterSpacing: -0.2,
            }}
          >
            Lift
            <Text style={{ color: palette.accent }}>.</Text>
          </Text>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              color: colors.text3,
              marginTop: 3,
            }}
          >
            v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SettingRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  sub?: string;
  children: React.ReactNode;
}> = ({ icon, title, sub, children }) => {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: 16,
        paddingVertical: 15,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 15, color: colors.text }}>
          {title}
        </Text>
        {sub && (
          <Text style={{ fontFamily: typography.bodyFont, fontSize: 12, color: colors.text3, marginTop: 1 }}>
            {sub}
          </Text>
        )}
      </View>
      {children}
    </View>
  );
};

const SegmentControl: React.FC<{
  options: string[];
  value: string;
  onChange: (v: string) => void;
  colors: any;
  palette: any;
  typography: any;
}> = ({ options, value, onChange, colors, palette, typography }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: colors.surface2,
      borderRadius: 9,
      padding: 3,
      borderWidth: 1,
      borderColor: colors.border,
    }}
  >
    {options.map((o) => (
      <TouchableOpacity
        key={o}
        onPress={() => onChange(o)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 7,
          backgroundColor: value === o ? palette.accent : 'transparent',
        }}
      >
        <Text
          style={{
            fontFamily: typography.bodyFontBold,
            fontSize: 13,
            color: value === o ? palette.onAccent : colors.text2,
            textTransform: 'capitalize',
          }}
        >
          {o}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
