import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from './useTheme';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  sub: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, sub }) => {
  const { colors, typography } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 30,
      }}
    >
      <View style={{ marginBottom: 14, opacity: 0.7 }}>{icon}</View>
      <Text
        style={{
          fontFamily: typography.displayFont,
          fontWeight: '800',
          fontSize: 17,
          color: colors.text2,
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: typography.bodyFont,
          fontSize: 14,
          color: colors.text3,
          lineHeight: 21,
          textAlign: 'center',
        }}
      >
        {sub}
      </Text>
    </View>
  );
};
