import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from './useTheme';
import { CloseIcon } from './Icons';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeightRatio?: number;
}

const { height: SCREEN_H } = Dimensions.get('window');

export const Sheet: React.FC<SheetProps> = ({
  visible,
  onClose,
  title,
  children,
  maxHeightRatio = 0.86,
}) => {
  const { colors, radii, typography, palette } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(0,0,0,0.5)' },
            ]}
          />
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_H * maxHeightRatio,
          backgroundColor: colors.surface,
          borderTopLeftRadius: 26,
          borderTopRightRadius: 26,
          borderTopWidth: 1,
          borderColor: colors.border,
          transform: [{ translateY }],
        }}
      >
        {/* drag handle */}
        <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <View
            style={{
              width: 38,
              height: 4,
              borderRadius: 99,
              backgroundColor: colors.border2,
            }}
          />
        </View>

        {title && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 18,
              paddingBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: typography.displayFont,
                fontWeight: '800',
                fontSize: 19,
                color: colors.text,
                letterSpacing: -0.4,
              }}
            >
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CloseIcon size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          style={{ paddingHorizontal: 18 }}
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};
