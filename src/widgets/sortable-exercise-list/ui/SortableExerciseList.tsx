import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  PanResponder,
  Animated,
  TouchableOpacity,
  StyleSheet,
  type LayoutChangeEvent,
} from 'react-native';
import { useTheme } from '../../../shared/ui/useTheme';
import { DragHandleIcon } from '../../../shared/ui/Icons';
import type { LocalWorkoutExercise } from '../../../entities/workout';

interface ItemLayout {
  y: number;
  height: number;
}

interface SortableExerciseListProps {
  exercises: LocalWorkoutExercise[];
  onReorder: (exercises: LocalWorkoutExercise[]) => void;
  renderItem: (exercise: LocalWorkoutExercise, index: number) => React.ReactNode;
}

export const SortableExerciseList: React.FC<SortableExerciseListProps> = ({
  exercises,
  onReorder,
  renderItem,
}) => {
  const { colors, palette } = useTheme();

  const layoutsRef = useRef<Record<string, ItemLayout>>({});
  const draggingIdRef = useRef<string | null>(null);
  const initialItemY = useRef(0);
  const initialTouchY = useRef(0);
  const insertAtRef = useRef(-1);

  const ghostY = useRef(new Animated.Value(0)).current;
  const ghostHeight = useRef(new Animated.Value(0)).current;
  const ghostOpacity = useRef(new Animated.Value(0)).current;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState(-1);
  const [ghostContent, setGhostContent] = useState<React.ReactNode>(null);

  const computeInsertAt = useCallback(
    (touchY: number) => {
      // touchY is relative to the list container
      let idx = exercises.length; // default: after last item
      for (let i = 0; i < exercises.length; i++) {
        const layout = layoutsRef.current[exercises[i].localId];
        if (!layout) continue;
        if (touchY < layout.y + layout.height / 2) {
          idx = i;
          break;
        }
      }
      return idx;
    },
    [exercises],
  );

  const buildPanResponder = useCallback(
    (localId: string, itemIndex: number) => {
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,

        onPanResponderGrant: () => {
          const layout = layoutsRef.current[localId];
          if (!layout) return;

          draggingIdRef.current = localId;
          initialItemY.current = layout.y;
          initialTouchY.current = layout.y;
          insertAtRef.current = itemIndex;

          ghostY.setValue(layout.y);
          ghostHeight.setValue(layout.height);
          ghostOpacity.setValue(1);

          setGhostContent(renderItem(exercises[itemIndex], itemIndex));
          setDraggingId(localId);
          setInsertAt(itemIndex);
        },

        onPanResponderMove: (_e, gestureState) => {
          const newY = initialItemY.current + gestureState.dy;
          ghostY.setValue(newY);

          // Find the midpoint of the ghost
          const layout = layoutsRef.current[localId];
          const ghostMid = newY + (layout?.height ?? 60) / 2;
          const target = computeInsertAt(ghostMid);
          insertAtRef.current = target;
          setInsertAt(target);
        },

        onPanResponderRelease: () => {
          ghostOpacity.setValue(0);

          const currentIdx = exercises.findIndex((e) => e.localId === localId);
          let target = insertAtRef.current;

          // Adjust for the hole left by removing the dragged item
          if (target > currentIdx) target -= 1;
          target = Math.max(0, Math.min(target, exercises.length - 1));

          if (target !== currentIdx) {
            const next = [...exercises];
            const [removed] = next.splice(currentIdx, 1);
            next.splice(target, 0, removed);
            onReorder(next);
          }

          draggingIdRef.current = null;
          setDraggingId(null);
          setInsertAt(-1);
          setGhostContent(null);
        },

        onPanResponderTerminate: () => {
          ghostOpacity.setValue(0);
          draggingIdRef.current = null;
          setDraggingId(null);
          setInsertAt(-1);
          setGhostContent(null);
        },
      });
    },
    [exercises, computeInsertAt, renderItem, onReorder],
  );

  const handleLayout = useCallback((localId: string, e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    layoutsRef.current[localId] = { y, height };
  }, []);

  return (
    <View style={{ position: 'relative' }}>
      <View style={{ gap: 12 }}>
        {exercises.map((ex, idx) => {
          const panResponder = buildPanResponder(ex.localId, idx);
          const isDragging = draggingId === ex.localId;

          return (
            <View key={ex.localId}>
              {/* Drop indicator: line above this item */}
              {insertAt === idx && draggingId !== null && draggingId !== ex.localId && (
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
                onLayout={(e) => handleLayout(ex.localId, e)}
                style={{ opacity: isDragging ? 0 : 1 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>{renderItem(ex, idx)}</View>

                  {/* Drag handle */}
                  <View
                    {...panResponder.panHandlers}
                    style={styles.handle}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <DragHandleIcon size={20} color={colors.text3} />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Drop indicator at the end of the list */}
        {insertAt === exercises.length && draggingId !== null && (
          <View
            style={{
              height: 2,
              backgroundColor: palette.accent,
              borderRadius: 1,
              marginTop: 6,
              marginHorizontal: 4,
            }}
          />
        )}
      </View>

      {/* Floating ghost that follows the finger */}
      {draggingId !== null && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ghost,
            {
              backgroundColor: colors.surface,
              borderColor: palette.accent,
              shadowColor: '#000',
              top: ghostY,
              opacity: ghostOpacity,
              minHeight: ghostHeight,
            },
          ]}
        >
          {ghostContent}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  handle: {
    paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  ghost: {
    position: 'absolute',
    left: 0,
    right: 36, // leave room for handle column
    borderRadius: 14,
    borderWidth: 1,
    padding: 15,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
});
