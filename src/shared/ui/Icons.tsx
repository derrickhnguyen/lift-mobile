import React from 'react';
import Svg, { Path, Circle, G, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = 22,
  color = 'currentColor',
  strokeWidth = 1.75,
  children,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M3 10.5 12 3l9 7.5M5 9.5V20h5v-5h4v5h5V9.5" />
  </Icon>
);

export const DumbbellIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" />
  </Icon>
);

export const ListIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
  </Icon>
);

export const ChartIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M4 4v16h16M8 14l3-4 3 3 4-6" />
  </Icon>
);

export const UserIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Circle cx="12" cy="8" r="3.5" />
    <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </Icon>
);

export const PlusIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Icon>
);

export const MinusIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M5 12h14" />
  </Icon>
);

export const SearchIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Circle cx="11" cy="11" r="7" />
    <Path d="m20 20-3.2-3.2" />
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ChevronRightIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="m9 5 7 7-7 7" />
  </Icon>
);

export const ChevronLeftIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="m15 5-7 7 7 7" />
  </Icon>
);

export const ChevronDownIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="m5 9 7 7 7-7" />
  </Icon>
);

export const TrashIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icon>
);

export const EditIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />
  </Icon>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M5 12.5 10 17 19 7" />
  </Icon>
);

export const LinkIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M9 12h6M8 8h-1a4 4 0 0 0 0 8h1M16 8h1a4 4 0 0 1 0 8h-1" />
  </Icon>
);

export const ClockIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 7.5V12l3 2" />
  </Icon>
);

export const FlameIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M12 3c1 3-2 4-2 7a2 2 0 1 0 4 0c0-1 1-1.5 1-1.5 1.5 1.5 2 3 2 4.5a5 5 0 0 1-10 0c0-4 5-6 5-10z" />
  </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
  </Icon>
);

export const WeightIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M7 8h10l2 12H5L7 8zM9 8a3 3 0 0 1 6 0" />
  </Icon>
);

export const TrophyIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M7 4h10v4a5 5 0 0 1-10 0V4zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 17h6M10 17l.5-3h3l.5 3M8 21h8" />
  </Icon>
);

export const BoltIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
  </Icon>
);

export const ArrowDownIcon: React.FC<IconProps> = (p) => (
  <Icon {...p}>
    <Path d="M12 5v14M6 13l6 6 6-6" />
  </Icon>
);

export const MoreVerticalIcon: React.FC<IconProps & { fill?: string }> = ({
  size = 20,
  fill = 'currentColor',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <Circle cx="12" cy="5" r="1.7" />
    <Circle cx="12" cy="12" r="1.7" />
    <Circle cx="12" cy="19" r="1.7" />
  </Svg>
);
