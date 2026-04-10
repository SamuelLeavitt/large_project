import type { SavedWorkout } from "./workoutTypes";

// Saved workout templates now come from backend APIs.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const SAVED_WORKOUTS_CACHE_KEY = "workout-app:saved-workouts-cache";

function getAuthToken() {
  return localStorage.getItem("token") || "";
}

function readSavedWorkoutsCache(): SavedWorkout[] {
  try {
    const raw = localStorage.getItem(SAVED_WORKOUTS_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedWorkout[]) : [];
  } catch {
    return [];
  }
}

function writeSavedWorkoutsCache(workouts: SavedWorkout[]) {
  try {
    localStorage.setItem(SAVED_WORKOUTS_CACHE_KEY, JSON.stringify(workouts));
  } catch {
    // Ignore cache write failures; the network response is still authoritative.
  }
}

async function authorizedFetch(path: string, init?: RequestInit) {
  const token = getAuthToken();

  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
}

export async function getSavedWorkouts(): Promise<SavedWorkout[]> {
  let response: Response;

  try {
    response = await authorizedFetch("/api/workouts/templates", {
      method: "GET",
    });
  } catch {
    return readSavedWorkoutsCache();
  }

  if (response.status === 401) {
    return readSavedWorkoutsCache();
  }

  if (!response.ok) {
    return readSavedWorkoutsCache();
  }

  const data = await response.json();
  const savedWorkouts = Array.isArray(data?.items) ? (data.items as SavedWorkout[]) : [];
  writeSavedWorkoutsCache(savedWorkouts);
  return savedWorkouts;
}

export async function saveWorkout(workout: SavedWorkout): Promise<SavedWorkout> {
  let response: Response;

  try {
    response = await authorizedFetch("/api/workouts/templates", {
      method: "POST",
      body: JSON.stringify(workout),
    });
  } catch {
    throw new Error("Could not reach workout template service.");
  }

  if (!response.ok) {
    throw new Error("Failed to save workout template");
  }

  const data = await response.json();
  const savedWorkout = data?.item as SavedWorkout;
  writeSavedWorkoutsCache([savedWorkout, ...readSavedWorkoutsCache().filter((item) => item.id !== savedWorkout.id)]);
  return savedWorkout;
}

export async function updateWorkout(workout: SavedWorkout): Promise<SavedWorkout> {
  let response: Response;

  try {
    response = await authorizedFetch(`/api/workouts/templates/${encodeURIComponent(workout.id)}`, {
      method: "PUT",
      body: JSON.stringify(workout),
    });
  } catch {
    throw new Error("Could not reach workout template service.");
  }

  if (!response.ok) {
    throw new Error("Failed to update workout template");
  }

  const data = await response.json();
  const updatedWorkout = data?.item as SavedWorkout;
  writeSavedWorkoutsCache(
    readSavedWorkoutsCache().map((item) => (item.id === updatedWorkout.id ? updatedWorkout : item))
  );
  return updatedWorkout;
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  let response: Response;

  try {
    response = await authorizedFetch(`/api/workouts/templates/${encodeURIComponent(workoutId)}`, {
      method: "DELETE",
    });
  } catch {
    throw new Error("Could not reach workout template service.");
  }

  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to delete workout template");
  }

  writeSavedWorkoutsCache(readSavedWorkoutsCache().filter((item) => item.id !== workoutId));
}