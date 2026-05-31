import React, { useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useTheme } from '../../../shared/ui/useTheme';
import { DragHandleIcon } from '../../../shared/ui/Icons';
import type { LocalWorkoutExercise } from '../../../entities/workout';

interface SortableExerciseListProps {
  exercises: LocalWorkoutExercise[];
  onReorder: (exercises: LocalWorkoutExercise[]) => void;
  renderItem: (exercise: LocalWorkoutExercise, index: number) => React.ReactNode;
  header?: React.ReactElement;
  footer?: React.ReactElement;
}

export const SortableExerciseList: React.FC<SortableExerciseListProps> = ({
  exercises,
  onReorder,
  renderItem,
  header,
  footer,
}) => {
  const { colors } = useTheme();

  const renderDraggableItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<LocalWorkoutExercise>) => {
      const index = exercises.indexOf(item);
      return (
      <ScaleDecorator activeScale={0.97}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            opacity: isActive ? 0.85 : 1,
            marginBottom: 12,
          }}
        >
          <View style={{ flex: 1 }}>{renderItem(item, index)}</View>
          <TouchableOpacity
            onLongPress={drag}
            delayLongPress={150}
            style={{ paddingTop: 8, paddingLeft: 10, paddingRight: 2 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <DragHandleIcon size={22} color={colors.text3} />
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
      );
    },
    [exercises, renderItem, colors.text3],
  );

  return (
    <DraggableFlatList
      data={exercises}
      keyExtractor={(item) => item.localId}
      onDragEnd={({ data }) => onReorder(data)}
      renderItem={renderDraggableItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      activationDistance={5}
      containerStyle={{ flex: 1 }}
    />
  );
};
