import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../shared/ui/useTheme';
import { ArrowDownIcon, EditIcon } from '../../../shared/ui/Icons';
import type { LocalSet } from '../../../entities/workout';

interface SetRowProps {
  set: LocalSet;
  index: number;
  prevSet: LocalSet | null;
  nextIsDrop: boolean;
  readOnly?: boolean;
  onEdit?: () => void;
}

const DROP_COLOR = '#FF8A3C';

export const SetRow: React.FC<SetRowProps> = ({
  set,
  index,
  prevSet,
  nextIsDrop,
  readOnly,
  onEdit,
}) => {
  const { colors, typography } = useTheme();
  const isDrop = !!set.dropset_group_id;

  let delta: number | null = null;
  if (isDrop && prevSet && prevSet.unit === set.unit) {
    const d = Math.round((set.weight - prevSet.weight) * 10) / 10;
    if (d !== 0) delta = d;
  }

  const weight = Number.isInteger(set.weight) ? set.weight : set.weight.toFixed(1);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch', position: 'relative', minHeight: 46 }}>
      {/* Left rail */}
      <View
        style={{
          width: 30,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Connector from above (this is a drop) */}
        {isDrop && (
          <View
            style={{
              position: 'absolute',
              top: -10,
              height: 30,
              left: '50%',
              width: 2.5,
              backgroundColor: DROP_COLOR,
              marginLeft: -1.25,
              borderRadius: 2,
            }}
          />
        )}
        {/* Connector going down (next is a drop) */}
        {nextIsDrop && (
          <View
            style={{
              position: 'absolute',
              top: 20,
              bottom: -10,
              left: '50%',
              width: 2.5,
              backgroundColor: DROP_COLOR,
              marginLeft: -1.25,
              borderRadius: 2,
            }}
          />
        )}
        <View
          style={{
            marginTop: 9,
            width: 24,
            height: 24,
            borderRadius: 8,
            backgroundColor: isDrop ? DROP_COLOR : colors.surface3,
            borderWidth: isDrop ? 0 : 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {isDrop ? (
            <ArrowDownIcon size={13} color="#1A0F06" strokeWidth={3} />
          ) : (
            <Text
              style={{
                fontFamily: typography.monoFontBold,
                fontSize: 11,
                color: colors.text3,
              }}
            >
              {index + 1}
            </Text>
          )}
        </View>
      </View>

      {/* Set content */}
      <TouchableOpacity
        onPress={readOnly ? undefined : onEdit}
        activeOpacity={readOnly ? 1 : 0.7}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 12,
          paddingVertical: 9,
          marginVertical: 4,
          marginLeft: isDrop ? 8 : 0,
          borderRadius: 11,
          backgroundColor: isDrop
            ? `${DROP_COLOR}22`
            : readOnly
            ? 'transparent'
            : colors.surface2,
          borderWidth: 1,
          borderColor: isDrop
            ? `${DROP_COLOR}70`
            : readOnly
            ? 'transparent'
            : colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
          <Text
            style={{ fontFamily: typography.monoFontBold, fontSize: 20, color: colors.text }}
          >
            {weight}
          </Text>
          <Text
            style={{ fontFamily: typography.monoFontBold, fontSize: 12, color: colors.text3 }}
          >
            {set.unit}
          </Text>
          <Text style={{ fontSize: 14, color: colors.text3, marginHorizontal: 8 }}>×</Text>
          <Text
            style={{ fontFamily: typography.monoFontBold, fontSize: 20, color: colors.text }}
          >
            {set.reps}
          </Text>
          <Text
            style={{ fontFamily: typography.bodyFontSemibold, fontSize: 12, color: colors.text3, marginLeft: 2 }}
          >
            reps
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isDrop && delta != null && (
            <Text
              style={{
                fontFamily: typography.monoFontBold,
                fontSize: 12,
                color: DROP_COLOR,
              }}
            >
              {delta > 0 ? '+' : ''}
              {delta}
            </Text>
          )}
          {isDrop && (
            <View
              style={{
                backgroundColor: DROP_COLOR,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 5,
              }}
            >
              <Text
                style={{
                  fontFamily: typography.monoFontBold,
                  fontSize: 9,
                  color: '#1A0F06',
                  letterSpacing: 1.2,
                }}
              >
                DROP
              </Text>
            </View>
          )}
          {!readOnly && <EditIcon size={15} color={colors.text3} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};
