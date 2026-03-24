import { useEffect, useState } from "react";
import WorkoutChart from "../components/WorkoutChart";
import WorkoutList from "../components/WorkoutList";
import { getWorkouts, getAllExercises } from "../utils/workoutData";
import type { Workout } from "../utils/workoutData";

const exercises = getAllExercises();

// displays workout history log page - includes line chart to show progress over time for a selected exercise and a full session log below
export default function WorkoutHistoryPage() {
  const [selected, setSelected] = useState(exercises[0]);
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    getWorkouts().then(setAllWorkouts);
  }, []);

  const filtered = allWorkouts.filter((w) => w.exercise === selected);

  return (
    <div className="workout-history">
      <div>
        <br />
        <h1>Workout History</h1>
        <br />
      </div>

      <div className="workout-history__selector">
        {exercises.map((ex) => (
          <button
            key={ex}
            onClick={() => setSelected(ex)}
            className={`workout-history__exercise-btn ${selected === ex ? "active" : ""}`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* chart filters to the selected exercise; list shows full session log intentionally */}
      <WorkoutChart data={filtered} exercise={selected} />
      <WorkoutList data={allWorkouts} />
    </div>
  );
}
