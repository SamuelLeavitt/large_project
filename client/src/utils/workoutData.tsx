const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface Workout {
  date: string;
  time: string;
  exercise: string;
  sets: WorkoutSet[];
  workoutName?: string;
  sessionId?: string;
  sourceType?: "quickStart" | "template";
}

export interface WorkoutSessionExercise {
  exerciseId: string;
  name: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id?: string;
  workoutName: string;
  sourceType: "quickStart" | "template";
  templateId?: string | null;
  templateName?: string;
  completedAt: string;
  durationSeconds?: number;
  exercises: WorkoutSessionExercise[];
}

function getAuthToken() {
  return localStorage.getItem("token") || "";
}

async function fetchWorkoutSessionsFromApi(): Promise<WorkoutSession[]> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/workouts/sessions`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to load workout sessions");
  }

  const data = await response.json();
  return Array.isArray(data?.items) ? (data.items as WorkoutSession[]) : [];
}

export async function saveWorkoutSession(session: WorkoutSession): Promise<void> {
  const normalizedSession: WorkoutSession = {
    ...session,
    workoutName: session.workoutName.trim(),
    exercises: session.exercises
      .map((exercise) => ({
        exerciseId: exercise.exerciseId.trim(),
        name: exercise.name.trim(),
        sets: exercise.sets.map((set) => ({
          weight: Number(set.weight) || 0,
          reps: Number(set.reps) || 0,
        })),
      }))
      .filter((exercise) => exercise.exerciseId && exercise.name),
  };

  const token = getAuthToken();
  const response = await fetch(`${API_BASE}/api/workouts/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(normalizedSession),
  });

  if (!response.ok) {
    throw new Error("Failed to save workout session");
  }
}

async function getWorkoutSessions(): Promise<WorkoutSession[]> {
  return fetchWorkoutSessionsFromApi();
}

function flattenWorkoutSessions(sessions: WorkoutSession[]): Workout[] {
  return sessions.flatMap((session) => {
    const completedAt = new Date(session.completedAt);
    const date = Number.isNaN(completedAt.getTime())
      ? new Date().toISOString().slice(0, 10)
      : completedAt.toISOString().slice(0, 10);
    const time = Number.isNaN(completedAt.getTime())
      ? new Date().toTimeString().slice(0, 5)
      : completedAt.toTimeString().slice(0, 5);

    return session.exercises.map((exercise) => ({
      date,
      time,
      exercise: exercise.name,
      sets: exercise.sets,
      workoutName: session.workoutName,
      sessionId: session.id,
      sourceType: session.sourceType,
    }));
  });
}

export async function getAllExercises(): Promise<string[]> {
  const sessions = await getWorkoutSessions();
  const combined = flattenWorkoutSessions(sessions);
  return [...new Set(combined.map((workout) => workout.exercise))];
}

export async function getWorkouts(exercise?: string): Promise<Workout[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const combined = flattenWorkoutSessions(await getWorkoutSessions());
  return exercise ? combined.filter((w) => w.exercise === exercise) : combined;
}

export function getMaxWeight(workout: Workout): number {
  if (workout.sets.length === 0) {
    return 0;
  }

  return Math.max(...workout.sets.map((s) => s.weight));
}

export function getTotalVolume(workout: Workout): number {
  return workout.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}
