//Shared TypeScript types for the workout page.
//These are frontend types for now but they will need to change to match to backend responses later.

export interface Exercise {
  _id?: string;
  id?: string;
  datasetId?: string;
  name: string;
  category?: string;
  bodyPart?: string;
  equipment?: string | null;
  level?: string;
  force?: string | null;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  category?: string;
  bodyPart?: string;
  sets: number;
  reps: string;
}

export interface SavedWorkout {
  id: string;
  name: string;
  bodyPart: string;
  createdAt: string;
  exercises: WorkoutExercise[];
}

export interface LoggedSet {
  weight: number;
  reps: number;
}

export interface ActiveExerciseLog {
  exerciseId: string;
  name: string;
  sets: LoggedSet[];
}