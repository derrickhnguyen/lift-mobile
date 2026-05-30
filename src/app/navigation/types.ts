export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ActiveSession: undefined;
  SessionDetail: { sessionId: string };
  ProgressDetail: {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
  };
  Summary: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Progress: undefined;
  Profile: undefined;
};
