import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Sheet, Stepper, TrashIcon, CheckIcon, ChevronDownIcon, useTheme } from '../../../shared/ui';
import type { LocalSet } from '../../../entities/workout';
import type { Unit } from '../../../shared/config/constants';

interface SetEditorProps {
  visible: boolean;
  onClose: () => void;
  set: LocalSet | null;
  index: number;
  defaultUnit: Unit;
  canDrop: boolean;
  onSave: (data: Partial<LocalSet>) => void;
  onDelete?: () => void;
}

export const SetEditor: React.FC<SetEditorProps> = ({
  visible,
  onClose,
  set,
  index,
  defaultUnit,
  canDrop,
  onSave,
  onDelete,
}) => {
  const { colors, palette, typography, radii } = useTheme();
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(10);
  const [unit, setUnit] = useState<Unit>(defaultUnit);
  const [isDrop, setIsDrop] = useState(false);

  useEffect(() => {
    if (set && visible) {
      setWeight(set.weight);
      setReps(set.reps);
      setUnit(set.unit);
      setIsDrop(!!set.dropset_group_id);
    }
  }, [set, visible]);

  const wStep = unit === 'kg' ? 2.5 : 5;

  const handleSave = () => {
    onSave({
      weight,
      reps,
      unit,
      dropset_group_id: isDrop ? (set?.dropset_group_id ?? `drop_${Date.now()}`) : null,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={`Set ${index + 1}`}>
      <View style={{ gap: 22, paddingTop: 6 }}>
        {/* Weight */}
        <View>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.text3,
              marginBottom: 12,
            }}
          >
            Weight
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stepper value={weight} onChange={setWeight} step={wStep} />
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: colors.surface2,
                borderRadius: 10,
                padding: 3,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {(['lbs', 'kg'] as Unit[]).map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: unit === u ? palette.accent : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.monoFontBold,
                      fontSize: 14,
                      color: unit === u ? palette.onAccent : colors.text2,
                    }}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Reps */}
        <View>
          <Text
            style={{
              fontFamily: typography.monoFont,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.text3,
              marginBottom: 12,
            }}
          >
            Reps
          </Text>
          <Stepper value={reps} onChange={setReps} step={1} min={1} />
        </View>

        {/* Drop set toggle */}
        {canDrop && (
          <TouchableOpacity
            onPress={() => setIsDrop((d) => !d)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor: isDrop ? `${palette.accent}22` : colors.surface2,
              borderWidth: 1,
              borderColor: isDrop ? palette.accent : colors.border,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                backgroundColor: isDrop ? palette.accent : colors.surface3,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronDownIcon
                size={18}
                color={isDrop ? palette.onAccent : colors.text2}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: typography.bodyFontBold,
                  fontSize: 15,
                  color: colors.text,
                }}
              >
                Drop set
              </Text>
              <Text
                style={{
                  fontFamily: typography.bodyFont,
                  fontSize: 12.5,
                  color: colors.text3,
                  marginTop: 1,
                }}
              >
                Link to the set above as a drop sequence
              </Text>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: isDrop ? palette.accent : colors.border2,
                backgroundColor: isDrop ? palette.accent : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDrop && <CheckIcon size={13} color={palette.onAccent} strokeWidth={3} />}
            </View>
          </TouchableOpacity>
        )}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          {onDelete && (
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 15,
                borderRadius: radii.md,
                backgroundColor: colors.surface2,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TrashIcon size={18} color="#F06A6A" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleSave}
            style={{
              flex: 1,
              paddingVertical: 16,
              borderRadius: radii.md,
              backgroundColor: palette.accent,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: typography.bodyFontBold,
                fontSize: 16,
                color: palette.onAccent,
              }}
            >
              Save set
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Sheet>
  );
};
