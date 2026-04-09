import type { SavedWorkout } from "./workoutTypes";

// Saved workout templates now come from backend APIs.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function getAuthToken() {
  return localStorage.getItem("token") || "";
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
    throw new Error("Could not reach workout template service.");
  }

  if (response.status === 401) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to load saved workouts");
  }

  const data = await response.json();
  return Array.isArray(data?.items) ? (data.items as SavedWorkout[]) : [];
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
  return data?.item as SavedWorkout;
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
  return data?.item as SavedWorkout;
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
}