import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/ui/useTheme';
import { DumbbellIcon } from '../../../shared/ui/Icons';
import { useAuthStore } from '../../../features/auth';
import { userApi } from '../../../entities/user';
import { secureStorage } from '../../../shared/lib/storage';
import type { AuthProvider } from '../../../entities/user';

WebBrowser.maybeCompleteAuthSession();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

export const AuthPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const signIn = useAuthStore((s) => s.signIn);
  const [loading, setLoading] = useState<AuthProvider | null>(null);

  const handleSignIn = async (provider: AuthProvider) => {
    setLoading(provider);
    try {
      const redirectTo = Linking.createURL('/');

      // Build Supabase's OAuth URL directly — no JS client needed.
      // Without a code_challenge, Supabase uses implicit flow and returns
      // the access_token in the URL fragment after the user logs in.
      const authUrl =
        `${SUPABASE_URL}/auth/v1/authorize` +
        `?provider=${provider}` +
        `&redirect_to=${encodeURIComponent(redirectTo)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
      if (result.type !== 'success') return;

      // Supabase implicit flow returns the token in the URL fragment:
      // lift://...#access_token=xxx&token_type=bearer&expires_in=3600
      const fragment = result.url.split('#')[1] ?? '';
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');

      if (!accessToken) throw new Error('Sign-in completed but no token was returned.');

      // Store the token first so the API client can attach it to the /users/me request
      await secureStorage.set('access_token', accessToken);
      const me = await userApi.getMe();
      await signIn(accessToken, me, provider);
    } catch (err: any) {
      Alert.alert('Sign in failed', err?.message ?? 'Something went wrong. Please try again.');
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
      id: 'google',
      label: 'Continue with Google',
      bg: colors.surface,
      textColor: colors.text,
      borderColor: colors.border2,
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
