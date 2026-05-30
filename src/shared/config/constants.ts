export const API_BASE_URL = 'http://localhost:3000/api/v1';

export const MUSCLE_GROUPS = [
  'anterior_tibialis',
  'back',
  'biceps',
  'calves',
  'cardio',
  'chest',
  'core',
  'forearms',
  'glutes',
  'hamstrings',
  'neck',
  'quads',
  'shoulders',
  'traps',
  'triceps',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const MUSCLE_GROUP_LABELS: Record<string, string> = {
  anterior_tibialis: 'Anterior Tibialis',
  back: 'Back',
  biceps: 'Biceps',
  calves: 'Calves',
  cardio: 'Cardio',
  chest: 'Chest',
  core: 'Core',
  forearms: 'Forearms',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  neck: 'Neck',
  quads: 'Quads',
  shoulders: 'Shoulders',
  traps: 'Traps',
  triceps: 'Triceps',
};

export type Unit = 'lbs' | 'kg';

export const REST_TIMER_OPTIONS = [60, 90, 120, 180];
