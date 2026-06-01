import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Svg, { Path, Circle, G, Line, Defs, LinearGradient, Stop, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../../shared/ui/useTheme';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  points: DataPoint[];
  formatValue: (v: number) => string;
  formatDate?: (iso: string) => string;
}

const W = 320;
const H = 184;
const PAD_L = 10;
const PAD_R = 10;
const PAD_T = 24;
const PAD_B = 28;

export const LineChart: React.FC<LineChartProps> = ({
  points,
  formatValue,
  formatDate,
}) => {
  const { colors, palette, typography } = useTheme();
  const [selected, setSelected] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <View style={{ padding: 30, alignItems: 'center' }}>
        <Text style={{ color: colors.text3, fontSize: 13, fontFamily: typography.bodyFont }}>
          No data in this range
        </Text>
      </View>
    );
  }

  const vals = points.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const xs = (i: number) =>
    PAD_L + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const ys = (v: number) => PAD_T + innerH - ((v - min) / range) * innerH;

  const pathD = points
    .map((p, i) => `${i ? 'L' : 'M'} ${xs(i).toFixed(1)} ${ys(p.value).toFixed(1)}`)
    .join(' ');
  const areaD = `${pathD} L ${xs(points.length - 1).toFixed(1)} ${(PAD_T + innerH).toFixed(1)} L ${xs(0).toFixed(1)} ${(PAD_T + innerH).toFixed(1)} Z`;

  const maxIdx = vals.indexOf(max);
  const sel = selected != null && selected < points.length ? selected : -1;

  const TIP_W = 88;
  const TIP_H = 24;
  const tipX = sel >= 0 ? Math.max(2, Math.min(W - TIP_W - 2, xs(sel) - TIP_W / 2)) : 0;
  const tipYBase = sel >= 0 ? ys(points[sel].value) : 0;
  const tipAbove = tipYBase > PAD_T + 30;
  const tipY = tipAbove ? tipYBase - TIP_H - 9 : tipYBase + 9;

  const fmtDate = formatDate ?? ((iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  return (
    <TouchableWithoutFeedback onPress={() => setSelected(null)}>
      <View>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
          <Defs>
            <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={palette.accent} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={palette.accent} stopOpacity={0} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((t) => (
            <Line
              key={t}
              x1={PAD_L}
              x2={W - PAD_R}
              y1={PAD_T + innerH * t}
              y2={PAD_T + innerH * t}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="2 4"
            />
          ))}

          {/* Guide line for selected */}
          {sel >= 0 && (
            <Line
              x1={xs(sel)}
              x2={xs(sel)}
              y1={PAD_T - 2}
              y2={PAD_T + innerH}
              stroke={palette.accent}
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.6}
            />
          )}

          {/* Area fill */}
          <Path d={areaD} fill="url(#chartGrad)" />

          {/* Line */}
          <Path
            d={pathD}
            fill="none"
            stroke={palette.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => {
            const isPR = i === maxIdx;
            const isSel = i === sel;
            return (
              <G key={i} onPress={() => setSelected(i === sel ? null : i)}>
                <Rect
                  x={xs(i) - 14}
                  y={PAD_T - 6}
                  width={28}
                  height={innerH + 12}
                  fill="transparent"
                />
                {isPR && (
                  <Circle
                    cx={xs(i)}
                    cy={ys(p.value)}
                    r={9}
                    fill="none"
                    stroke={palette.accent}
                    strokeWidth={1}
                    opacity={0.4}
                  />
                )}
                <Circle
                  cx={xs(i)}
                  cy={ys(p.value)}
                  r={isSel ? 5.5 : isPR ? 5 : 3.5}
                  fill={isSel || isPR ? palette.accent : colors.bg}
                  stroke={palette.accent}
                  strokeWidth={2.5}
                />
                <SvgText
                  x={xs(i)}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill={isSel ? palette.accent : colors.text3}
                  fontFamily={typography.monoFont}
                >
                  {fmtDate(p.date)}
                </SvgText>
              </G>
            );
          })}

          {/* Tooltip */}
          {sel >= 0 && (
            <G>
              <Rect x={tipX} y={tipY} width={TIP_W} height={TIP_H} rx={6} fill={colors.text} />
              <SvgText
                x={tipX + TIP_W / 2}
                y={tipY + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight="700"
                fill={colors.bg}
                fontFamily={typography.monoFontBold}
              >
                {formatValue(points[sel].value)}
              </SvgText>
            </G>
          )}
        </Svg>

        <Text
          style={{
            textAlign: 'center',
            fontFamily: typography.bodyFont,
            fontSize: 11,
            color: colors.text3,
            paddingTop: 4,
          }}
        >
          Tap a point for details
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
