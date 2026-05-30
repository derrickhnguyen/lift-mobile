import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  TopBar,
  ChevronLeftIcon,
  TrophyIcon,
  BoltIcon,
  EmptyState,
  ChartIcon,
  useTheme,
} from '../../../shared/ui';
import { LineChart } from '../../../widgets/line-chart';
import { exerciseApi } from '../../../entities/exercise';
import { fmtDate } from '../../../shared/lib/formatters';
import type { ProgressPoint } from '../../../entities/exercise';
import type { RootStackParamList } from '../../../app/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProgressDetail'>;

type Metric = 'max' | 'e1rm' | 'volume';
type Range = '1m' | '3m' | 'all';

const METRICS: Record<Metric, { label: string; head: string; fmt: (v: number) => string; valueOf: (p: ProgressPoint) => number }> = {
  max: { label: 'Max weight', head: 'Heaviest set', fmt: (v) => `${v} lb`, valueOf: (p) => p.maxWeight },
  e1rm: { label: 'Est. 1RM', head: 'Estimated 1-rep max', fmt: (v) => `${v} lb`, valueOf: (p) => p.e1rm },
  volume: { label: 'Volume', head: 'Session volume', fmt: (v) => `${v.toLocaleString()} lb`, valueOf: (p) => p.volume },
};

const RANGES: { key: Range; label: string; days: number }[] = [
  { key: '1m', label: '1M', days: 31 },
  { key: '3m', label: '3M', days: 93 },
  { key: 'all', label: 'All', days: 1e9 },
];

export const ProgressDetailPage: React.FC = () => {
  const { colors, palette, typography, spacing } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { exerciseId, exerciseName, muscleGroup } = route.params;

  const [allPoints, setAllPoints] = useState<ProgressPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metric, setMetric] = useState<Metric>('max');
  const [range, setRange] = useState<Range>('all');

  useEffect(() => {
    exerciseApi
      .getProgress(exerciseId)
      .then(setAllPoints)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [exerciseId]);

  const rangeInfo = RANGES.find((r) => r.key === range)!;
  const cutoff = Date.now() - rangeInfo.days * 86400000;
  const points = useMemo(
    () => allPoints.filter((p) => new Date(p.date).getTime() >= cutoff),
    [allPoints, range, cutoff],
  );

  const m = METRICS[metric];
  const allTimePR = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.maxWeight)) : 0;
  const bestE1rm = allPoints.length > 0 ? Math.max(...allPoints.map((p) => p.e1rm)) : 0;
  const delta =
    allPoints.length >= 2
      ? Math.round(
          ((allPoints[allPoints.length - 1].maxWeight - allPoints[0].maxWeight) /
            allPoints[0].maxWeight) *
            100,
        )
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TopBar
        sub={muscleGroup.replace(/_/g, ' ')}
        title={exerciseName}
        leftSlot={
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface2,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={20} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={palette.accent} size="large" />
        </View>
      ) : allPoints.length === 0 ? (
        <EmptyState
          icon={<ChartIcon size={40} color={colors.text3} />}
          title="No data yet"
          sub={`Log ${exerciseName} in a workout to start tracking progress.`}
        />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.section, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'All-time PR', value: allTimePR, unit: 'lb', hi: true, icon: <TrophyIcon size={16} color={palette.accent} /> },
              { label: 'Est. 1RM', value: bestE1rm, unit: 'lb', hi: false, icon: <BoltIcon size={16} color={colors.text3} /> },
              { label: 'Progress', value: (delta >= 0 ? '+' : '') + delta, unit: '%', hi: false },
            ].map((s, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  padding: 13,
                  borderRadius: 14,
                  backgroundColor: s.hi ? `${palette.accent}1E` : colors.surface,
                  borderWidth: 1,
                  borderColor: s.hi ? `${palette.accent}60` : colors.border,
                }}
              >
                {s.icon && <View style={{ marginBottom: 5 }}>{s.icon}</View>}
                <Text
                  style={{
                    fontFamily: typography.monoFontBold,
                    fontSize: 23,
                    color: s.hi ? palette.accent : colors.text,
                    lineHeight: 25,
                  }}
                >
                  {s.value}
                  {s.unit && (
                    <Text style={{ fontSize: 11, color: colors.text3, fontFamily: typography.monoFont }}>
                      {' '}{s.unit}
                    </Text>
                  )}
                </Text>
                <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 10.5, color: colors.text3, marginTop: 6 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Metric toggle */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.surface2,
              borderRadius: 12,
              padding: 4,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 10,
            }}
          >
            {(Object.entries(METRICS) as [Metric, typeof METRICS[Metric]][]).map(([k, mm]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setMetric(k)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderRadius: 9,
                  alignItems: 'center',
                  backgroundColor: metric === k ? palette.accent : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.bodyFontBold,
                    fontSize: 13,
                    color: metric === k ? palette.onAccent : colors.text2,
                  }}
                  numberOfLines={1}
                >
                  {mm.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              paddingBottom: 10,
              marginBottom: 18,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 8 }}>
              <Text style={{ fontFamily: typography.monoFont, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.text3 }}>
                {m.head}
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {RANGES.map((r) => (
                  <TouchableOpacity
                    key={r.key}
                    onPress={() => setRange(r.key)}
                    style={{
                      paddingHorizontal: 9,
                      paddingVertical: 4,
                      borderRadius: 7,
                      backgroundColor: range === r.key ? colors.surface3 : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.monoFontBold,
                        fontSize: 11,
                        color: range === r.key ? colors.text : colors.text3,
                      }}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <LineChart
              points={points.map((p) => ({ date: p.date, value: m.valueOf(p) }))}
              formatValue={m.fmt}
            />
          </View>

          {/* Session history */}
          <Text style={{ fontFamily: typography.monoFont, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.text3, marginBottom: 10 }}>
            Session history
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {[...allPoints].reverse().map((p, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  borderBottomWidth: i < allPoints.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View>
                  <Text style={{ fontFamily: typography.bodyFontSemibold, fontSize: 14, color: colors.text }}>
                    {fmtDate(p.date)}
                  </Text>
                  <Text style={{ fontFamily: typography.monoFont, fontSize: 11, color: colors.text3, marginTop: 1 }}>
                    1RM ~{p.e1rm} lb
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 18 }}>
                  <Text style={{ fontFamily: typography.monoFontBold, fontSize: 14, color: colors.text }}>
                    {p.maxWeight}
                    <Text style={{ fontSize: 11, color: colors.text3, fontFamily: typography.monoFont }}> lb</Text>
                  </Text>
                  <Text style={{ fontFamily: typography.monoFont, fontSize: 14, color: colors.text2, minWidth: 70, textAlign: 'right' }}>
                    {p.volume.toLocaleString()}
                    <Text style={{ fontSize: 11, color: colors.text3 }}> vol</Text>
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};
