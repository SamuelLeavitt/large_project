import type { Exercise } from "./workoutTypes";

//This file is the temporary frontend API layer for exercises.

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

//Temporary mock exercises.
//These include bodyPart so i can build category based workout plans.
//Will be changed when connected to backend.
const MOCK_EXERCISES: Exercise[] = [
  {
    id: "1",
    name: "Barbell Bench Press",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "barbell",
    level: "intermediate",
    primaryMuscles: ["chest"],
  },
  {
    id: "2",
    name: "Incline Dumbbell Press",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "dumbbell",
    level: "beginner",
    primaryMuscles: ["chest"],
  },
  {
    id: "3",
    name: "Cable Fly",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "cable",
    level: "beginner",
    primaryMuscles: ["chest"],
  },
  {
    id: "4",
    name: "Lat Pulldown",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "machine",
    level: "beginner",
    primaryMuscles: ["lats"],
  },
  {
    id: "5",
    name: "Seated Cable Row",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "cable",
    level: "beginner",
    primaryMuscles: ["back"],
  },
  {
    id: "6",
    name: "Shoulder Press",
    category: "strength",
    bodyPart: "Upper Body",
    equipment: "dumbbell",
    level: "beginner",
    primaryMuscles: ["shoulders"],
  },
  {
    id: "7",
    name: "Barbell Squat",
    category: "strength",
    bodyPart: "Legs",
    equipment: "barbell",
    level: "intermediate",
    primaryMuscles: ["quadriceps", "glutes"],
  },
  {
    id: "8",
    name: "Romanian Deadlift",
    category: "strength",
    bodyPart: "Legs",
    equipment: "barbell",
    level: "intermediate",
    primaryMuscles: ["hamstrings"],
  },
  {
    id: "9",
    name: "Leg Press",
    category: "strength",
    bodyPart: "Legs",
    equipment: "machine",
    level: "beginner",
    primaryMuscles: ["quadriceps"],
  },
  {
    id: "10",
    name: "Walking Lunges",
    category: "strength",
    bodyPart: "Legs",
    equipment: "dumbbell",
    level: "beginner",
    primaryMuscles: ["glutes", "quadriceps"],
  },
  {
    id: "11",
    name: "Deadlift",
    category: "strength",
    bodyPart: "Full Body",
    equipment: "barbell",
    level: "intermediate",
    primaryMuscles: ["hamstrings", "glutes", "lower back"],
  },
  {
    id: "12",
    name: "Burpees",
    category: "conditioning",
    bodyPart: "Full Body",
    equipment: "body only",
    level: "beginner",
    primaryMuscles: ["full body"],
  },
  {
    id: "13",
    name: "Plank",
    category: "core",
    bodyPart: "Core",
    equipment: "body only",
    level: "beginner",
    primaryMuscles: ["abs"],
  },
  {
    id: "14",
    name: "Hanging Leg Raise",
    category: "core",
    bodyPart: "Core",
    equipment: "body only",
    level: "intermediate",
    primaryMuscles: ["abs"],
  },
  {
    id: "15",
    name: "Push Up",
    category: "bodyweight",
    bodyPart: "Upper Body",
    equipment: "body only",
    level: "beginner",
    primaryMuscles: ["chest", "triceps"],
  },
];

export async function getExercises(search = ""): Promise<Exercise[]> {
  try {
    const query = search.trim()
      ? `?search=${encodeURIComponent(search.trim())}`
      : "";

    const response = await fetch(`${API_BASE}/api/exercises${query}`);

    if (!response.ok) {
      throw new Error("Failed to load exercises");
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    if (Array.isArray(data.exercises)) return data.exercises;

    return [];
  } catch (error) {
    console.warn(
      "Backend not ready yet. Using temporary mock exercise data.",
      error
    );

    const lowered = search.trim().toLowerCase();

    if (!lowered) return MOCK_EXERCISES;

    // Temporary frontend filtering until backend partial match search is connected.
    return MOCK_EXERCISES.filter((exercise) => {
      return (
        exercise.name.toLowerCase().includes(lowered) ||
        (exercise.category || "").toLowerCase().includes(lowered) ||
        (exercise.bodyPart || "").toLowerCase().includes(lowered) ||
        (exercise.equipment || "").toLowerCase().includes(lowered)
      );
    });
  }
}