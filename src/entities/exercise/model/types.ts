import type { MuscleGroup } from '../../../shared/config/constants';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: MuscleGroup;
  is_custom: boolean;
}

export interface ProgressPoint {
  date: string;
  maxWeight: number;
  volume: number;
  repsAtMax: number;
  e1rm: number;
}
