export const MUSCLE_COLORS: Record<string, string> = {
  anterior_tibialis: '#7FD1C0',
  back: '#6AA8FF',
  biceps: '#F59E6A',
  calves: '#9B8CF0',
  cardio: '#F06A8C',
  chest: '#F5B25A',
  core: '#5AD0A8',
  forearms: '#C0A06A',
  glutes: '#E07AD0',
  hamstrings: '#7AD08A',
  neck: '#9AA0A8',
  quads: '#6AD0E0',
  shoulders: '#B58CF0',
  traps: '#F0A06A',
  triceps: '#8CB0F0',
};

export const getMuscleColor = (group: string): string =>
  MUSCLE_COLORS[group] ?? '#9AA0A8';
