import type { SavedWorkout } from "./workoutTypes";

//This file handles TEMPORARY frontend storage for saved workout plans.
//Right now plans are stored in localStorage so the page works before backend endpoints are ready.
//Later these functions wil be replaced with real API calls.

const STORAGE_KEY = "saved_workout_plans";

export function getSavedWorkouts(): SavedWorkout[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWorkout(workout: SavedWorkout): void {
  const current = getSavedWorkouts();
  const updated = [workout, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function deleteWorkout(workoutId: string): void {
  const current = getSavedWorkouts();
  const updated = current.filter((workout) => workout.id !== workoutId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}