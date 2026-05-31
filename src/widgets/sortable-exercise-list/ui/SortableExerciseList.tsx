/**
 * Drag-to-reorder exercise list.
 *
 * Uses react-native-gesture-handler's Gesture.Pan (native-thread gesture, works
 * inside FlatList) + React Native's Animated API (no Reanimated worklets, so
 * fully compatible with Reanimated v4 and Expo SDK 54).
 *
 * Interaction: long-press the ≡ handle for 250 ms, then drag up or down.
 * A lime accent line tracks where the item will land on release.
 */
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Animated,
  type LayoutChangeEvent,
  type FlatListProps,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
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

const GAP = 12; // matches contentContainerStyle gap

export const SortableExerciseList: React.FC<SortableExerciseListProps> = ({
  exercises,
  onReorder,
  renderItem,
  header,
  footer,
}) => {
  const { colors, palette } = useTheme();

  // FlatList scroll enable/disable during drag
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // Drag state (JS thread — updated via runOnJS from gesture callbacks)
  const [activeId, setActiveId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState(-1);

  // Ghost element animated position
  const ghostY = useRef(new Animated.Value(0)).current;
  const ghostOpacity = useRef(new Animated.Value(0)).current;

  // Item height map populated by onLayout
  const itemHeights = useRef<Record<string, number>>({});

  // Cumulative y position of item[index] within the list content
  const getItemY = useCallback(
    (index: number) => {
      let y = 0;
      for (let i = 0; i < index; i++) {
        y += (itemHeights.current[exercises[i]?.localId] ?? 80) + GAP;
      }
      return y;
    },
    [exercises],
  );

  // Which slot (0..n) the ghost midpoint is currently over
  const getInsertAt = useCallback(
    (ghostTopY: number, draggingId: string) => {
      const ghostHeight = itemHeights.current[draggingId] ?? 80;
      const ghostMid = ghostTopY + ghostHeight / 2;
      for (let i = 0; i < exercises.length; i++) {
        const itemMid = getItemY(i) + (itemHeights.current[exercises[i].localId] ?? 80) / 2;
        if (ghostMid < itemMid) return i;
      }
      return exercises.length;
    },
    [exercises, getItemY],
  );

  // Build a gesture for one drag handle
  const buildGesture = useCallback(
    (localId: string, index: number) => {
      let startY = 0;

      return Gesture.Pan()
        .activateAfterLongPress(250)
        .runOnJS(true) // run ALL callbacks on JS thread — no worklets needed
        .onStart(() => {
          startY = getItemY(index);
          ghostY.setValue(startY);
          ghostOpacity.setValue(1);
          setActiveId(localId);
          setInsertAt(index);
          setScrollEnabled(false);
        })
        .onUpdate((e) => {
          const newY = startY + e.translationY;
          ghostY.setValue(newY);
          setInsertAt(getInsertAt(newY, localId));
        })
        .onEnd(() => {
          ghostOpacity.setValue(0);
          setScrollEnabled(true);

          const currentIdx = exercises.findIndex((ex) => ex.localId === localId);
          let target = insertAt > currentIdx ? insertAt - 1 : insertAt;
          target = Math.max(0, Math.min(target, exercises.length - 1));

          if (target !== currentIdx) {
            const next = [...exercises];
            const [removed] = next.splice(currentIdx, 1);
            next.splice(target, 0, removed);
            onReorder(next);
          }

          setActiveId(null);
          setInsertAt(-1);
        })
        .onFinalize(() => {
          ghostOpacity.setValue(0);
          setScrollEnabled(true);
          setActiveId(null);
          setInsertAt(-1);
        });
    },
    [exercises, getItemY, getInsertAt, insertAt, ghostY, ghostOpacity, onReorder],
  );

  const renderListItem = useCallback(
    ({ item, index }: { item: LocalWorkoutExercise; index: number }) => {
      const isDragging = activeId === item.localId;
      const showIndicatorAbove = insertAt === index && activeId !== null && activeId !== item.localId;
      const gesture = buildGesture(item.localId, index);

      return (
        <View>
          {showIndicatorAbove && (
            <View
              style={{
                height: 2,
                backgroundColor: palette.accent,
                borderRadius: 1,
                marginBottom: 6,
                marginHorizontal: 4,
              }}
            />
          )}
          <View
            onLayout={(e: LayoutChangeEvent) => {
              itemHeights.current[item.localId] = e.nativeEvent.layout.height;
            }}
            style={{ opacity: isDragging ? 0.3 : 1, marginBottom: GAP }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>{renderItem(item, index)}</View>
              <GestureDetector gesture={gesture}>
                <View
                  style={{ paddingTop: 8, paddingLeft: 10, paddingRight: 2 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <DragHandleIcon size={22} color={colors.text3} />
                </View>
              </GestureDetector>
            </View>
          </View>
        </View>
      );
    },
    [activeId, insertAt, buildGesture, renderItem, palette.accent, colors.text3],
  );

  // Show drop indicator after last item
  const listFooter = (
    <View>
      {insertAt === exercises.length && activeId !== null && (
        <View
          style={{
            height: 2,
            backgroundColor: palette.accent,
            borderRadius: 1,
            marginBottom: 6,
            marginHorizontal: 4,
          }}
        />
      )}
      {footer}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.localId}
        renderItem={renderListItem}
        ListHeaderComponent={header}
        ListFooterComponent={listFooter}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40, paddingTop: 0 }}
        // Remove the built-in item separator — each item manages its own gap
        ItemSeparatorComponent={null}
      />

      {/* Ghost element: follows the drag */}
      {activeId !== null && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 18,
            right: 18 + 36, // leave room for the handle column
            top: ghostY,
            opacity: ghostOpacity,
            backgroundColor: colors.surface,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: palette.accent,
            padding: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
            overflow: 'hidden',
          }}
        >
          {renderItem(
            exercises.find((e) => e.localId === activeId) ?? exercises[0],
            exercises.findIndex((e) => e.localId === activeId),
          )}
        </Animated.View>
      )}
    </View>
  );
};
