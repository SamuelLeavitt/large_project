export interface Workout {
  date: string;       // "YYYY-MM-DD"
  time: string;       // "HH:MM" 24h
  exercise: string;
  sets: WorkoutSet[];
}

export interface WorkoutSet {
  weight: number;
  reps: number;
}

//This storage key is for TEMPORARY workout history saved from the frontend.
//Later the workout history will come from the backend per logged-in user.
const HISTORY_STORAGE_KEY = "temporary_workout_history";

//Reads workout history entries that were temporarily saved from the Workout page.
function getStoredWorkoutHistory(): Workout[] {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

//Saves new workout history rows into localStorage just to test the frontend work for now.
export function appendWorkoutHistory(workouts: Workout[]): void {
  const current = getStoredWorkoutHistory();
  const updated = [...workouts, ...current];
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

// temporarily replaces actual API call to fetch distinct exercise names from database, use mock data for now
export function getAllExercises(): string[] {
  const combined = [...MOCK_DATA, ...getStoredWorkoutHistory()];
  return [...new Set(combined.map((w) => w.exercise))];
}

// temporarily replaces actual API call to fetch workouts from database, use mock data for now
export async function getWorkouts(exercise?: string): Promise<Workout[]> {
  await new Promise((r) => setTimeout(r, 200));
  const combined = [...getStoredWorkoutHistory(), ...MOCK_DATA];
  return exercise ? combined.filter((w) => w.exercise === exercise) : combined;
}

// helper functions to calculate max weight for a given workout
export function getMaxWeight(workout: Workout): number {
  return Math.max(...workout.sets.map((s) => s.weight));
}

// helper functions to calculate total volume for a given workout
export function getTotalVolume(workout: Workout): number {
  return workout.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

// temporary mock data to test frontend while backend is being developed
const MOCK_DATA: Workout[] = [

  { date: "2025-02-01", time: "08:30", exercise: "Bench Press", sets: [{ weight: 15, reps: 5 }, { weight: 45, reps: 5 }, { weight: 50, reps: 6 }] },
  { date: "2025-02-01", time: "08:30", exercise: "Squat",       sets: [{ weight: 15, reps: 10 }, { weight: 25, reps: 10 }, { weight: 25, reps: 8 }] },

  { date: "2025-02-05", time: "09:00", exercise: "Deadlift",    sets: [{ weight: 225, reps: 3 }, { weight: 255, reps: 2 }, { weight: 275, reps: 3 }] },

  { date: "2025-02-08", time: "07:15", exercise: "Bench Press", sets: [{ weight: 145, reps: 10 }, { weight: 155, reps: 8 }, { weight: 160, reps: 6 }] },
  { date: "2025-02-08", time: "17:45", exercise: "Squat",       sets: [{ weight: 195, reps: 8 }, { weight: 215, reps: 6 }, { weight: 225, reps: 4 }] },

  { date: "2025-02-12", time: "10:00", exercise: "Deadlift",    sets: [{ weight: 245, reps: 5 }, { weight: 265, reps: 4 }, { weight: 285, reps: 3 }] },

  { date: "2025-02-15", time: "08:00", exercise: "Bench Press", sets: [{ weight: 155, reps: 1 }, { weight: 165, reps: 1 }, { weight: 170, reps: 1 }] },
  { date: "2025-02-15", time: "08:00", exercise: "Squat",       sets: [{ weight: 205, reps: 2 }, { weight: 225, reps: 1 }, { weight: 235, reps: 2 }] },

  { date: "2025-02-19", time: "09:30", exercise: "Deadlift",    sets: [{ weight: 255, reps: 5 }, { weight: 275, reps: 4 }, { weight: 295, reps: 2 }] },

  { date: "2025-02-22", time: "06:45", exercise: "Bench Press", sets: [{ weight: 160, reps: 8 }, { weight: 170, reps: 6 }, { weight: 175, reps: 5 }] },
  { date: "2025-02-22", time: "18:00", exercise: "Squat",       sets: [{ weight: 215, reps: 6 }, { weight: 235, reps: 5 }, { weight: 245, reps: 3 }] },

  { date: "2025-02-26", time: "10:15", exercise: "Deadlift",    sets: [{ weight: 265, reps: 5 }, { weight: 285, reps: 3 }, { weight: 305, reps: 2 }] },

  { date: "2025-03-01", time: "08:00", exercise: "Bench Press", sets: [{ weight: 165, reps: 8 }, { weight: 175, reps: 6 }, { weight: 185, reps: 4 }] },
  { date: "2025-03-01", time: "08:00", exercise: "Squat",       sets: [{ weight: 225, reps: 6 }, { weight: 245, reps: 4 }, { weight: 255, reps: 3 }] },
  { date: "2025-03-01", time: "08:00", exercise: "Deadlift",    sets: [{ weight: 275, reps: 5 }, { weight: 295, reps: 3 }, { weight: 315, reps: 2 }] },

  { date: "2025-03-05", time: "09:00", exercise: "Deadlift",    sets: [{ weight: 275, reps: 5 }, { weight: 295, reps: 3 }, { weight: 315, reps: 2 }] },
];
