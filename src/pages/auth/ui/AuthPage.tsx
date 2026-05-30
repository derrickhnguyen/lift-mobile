import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/ui/useTheme';
import { DumbbellIcon } from '../../../shared/ui/Icons';
import { useAuthStore } from '../../../features/auth';
import { userApi } from '../../../entities/user';
import type { AuthProvider } from '../../../entities/user';

/**
 * Auth is stubbed — real OAuth requires Supabase credentials.
 * Wire `supabase.auth.signInWithOAuth` here and pass the resulting
 * access_token + user into `useAuthStore.signIn`.
 */
export const AuthPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const [loading, setLoading] = useState<AuthProvider | null>(null);

  const handleSignIn = async (provider: AuthProvider) => {
    setLoading(provider);
    try {
      // TODO: Replace with real Supabase OAuth flow
      // const { data } = await supabase.auth.signInWithOAuth({ provider });
      // For development, stub with a placeholder token
      Alert.alert(
        'Auth Stub',
        `OAuth with ${provider} not yet wired. Supabase credentials needed.\n\nIn production, call supabase.auth.signInWithOAuth({ provider: "${provider}" }) and pass the session token to signIn().`,
        [
          {
            text: 'Sign in as demo user',
            onPress: async () => {
              const stubToken = 'stub_token_replace_with_real';
              const stubUser = {
                id: 'demo-user-id',
                email: `demo@${provider}.com`,
                unit: 'lbs' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              await signIn(stubToken, stubUser, provider);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } finally {
      setLoading(null);
    }
  };

  const providers: {
    id: AuthProvider;
    label: string;
    bg: string;
    textColor: string;
    borderColor?: string;
  }[] = [
    {
      id: 'apple',
      label: 'Continue with Apple',
      bg: colors.text,
      textColor: colors.bg,
    },
    {
      id: 'google',
      label: 'Continue with Google',
      bg: colors.surface,
      textColor: colors.text,
      borderColor: colors.border2,
    },
    {
      id: 'facebook',
      label: 'Continue with Facebook',
      bg: '#1877F2',
      textColor: '#fff',
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 26,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 34,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Brand */}
      <View style={{ flex: 1, justifyContent: 'center', paddingTop: 60 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: palette.accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <DumbbellIcon size={30} color={palette.onAccent} strokeWidth={2} />
        </View>

        <Text
          style={{
            fontFamily: typography.monoFont,
            fontSize: 11,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.text3,
            marginBottom: 14,
          }}
        >
          Strength · Tracked
        </Text>

        <Text
          style={{
            fontFamily: typography.displayFont,
            fontWeight: '800',
            fontSize: 52,
            lineHeight: 50,
            letterSpacing: -2.5,
            color: colors.text,
            marginBottom: 18,
          }}
        >
          {'Every rep\ncounts.'}
          <Text style={{ color: palette.accent }}>_</Text>
        </Text>

        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 16,
            color: colors.text2,
            lineHeight: 24,
            maxWidth: 320,
          }}
        >
          Log sessions, track supersets and dropsets, and watch your numbers climb over time.
        </Text>
      </View>

      {/* Providers */}
      <View style={{ gap: 11 }}>
        {providers.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => handleSignIn(p.id)}
            disabled={!!loading}
            activeOpacity={0.85}
            style={{
              height: 54,
              borderRadius: 14,
              backgroundColor: p.bg,
              borderWidth: p.borderColor ? 1 : 0,
              borderColor: p.borderColor,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              opacity: loading && loading !== p.id ? 0.6 : 1,
            }}
          >
            {loading === p.id ? (
              <ActivityIndicator color={p.textColor} size="small" />
            ) : (
              <Text
                style={{
                  fontFamily: typography.bodyFontBold,
                  fontSize: 16,
                  color: p.textColor,
                }}
              >
                {p.label}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        <Text
          style={{
            fontFamily: typography.bodyFont,
            fontSize: 12,
            color: colors.text3,
            textAlign: 'center',
            marginTop: 8,
            lineHeight: 18,
          }}
        >
          By continuing you agree to the Terms & Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
};
