import type { MuscleGroup, Unit } from '../../../shared/config/constants';

export interface SetRecord {
  id: string;
  workout_exercise_id: string;
  weight: number;
  unit: Unit;
  reps: number;
  order: number;
  dropset_group_id: string | null;
  created_at: string;
}

export interface WorkoutExerciseRecord {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  order: number;
  superset_group_id: string | null;
  created_at: string;
  exercise: {
    id: string;
    name: string;
    muscle_group: MuscleGroup;
    is_custom: boolean;
  };
  sets: SetRecord[];
}

export interface WorkoutSession {
  id: string;
  name: string | null;
  user_id: string;
  started_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDetail extends WorkoutSession {
  exercises: WorkoutExerciseRecord[];
}

export interface WorkoutListResponse {
  data: WorkoutSession[];
  next_cursor: string | null;
}

/** Local-only set used while a session is being actively logged */
export interface LocalSet {
  localId: string;
  serverId: string | null;
  weight: number;
  unit: Unit;
  reps: number;
  dropset_group_id: string | null;
}

/** Local-only workout exercise used while a session is being actively logged */
export interface LocalWorkoutExercise {
  localId: string;
  serverId: string | null;
  exercise_id: string;
  exercise_name: string;
  muscle_group: MuscleGroup;
  superset_group_id: string | null;
  sets: LocalSet[];
}

/** Local-only session used while actively logging */
export interface LocalSession {
  serverId: string | null;
  name: string;
  started_at: string;
  exercises: LocalWorkoutExercise[];
}
