import { useEffect, useMemo, useState } from "react";
import LoadingState from "../components/LoadingState";
import WorkoutChart from "../components/WorkoutChart";
import WorkoutList from "../components/WorkoutList";
import { getWorkouts } from "../utils/workoutData";
import type { Workout } from "../utils/workoutData";

// displays workout history log page - includes line chart to show progress over time for a selected exercise and a full session log below
export default function WorkoutHistoryPage() {
  const [selected, setSelected] = useState("");
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const exercises = useMemo(() => {
    return [...new Set(allWorkouts.map((workout) => workout.exercise))];
  }, [allWorkouts]);

  useEffect(() => {
    let isActive = true;

    const loadWorkoutHistory = async () => {
      setLoading(true);

      try {
        const workouts = await getWorkouts();
        if (isActive) {
          setAllWorkouts(workouts);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadWorkoutHistory();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!exercises.length) {
      setSelected("");
      return;
    }

    if (!selected || !exercises.includes(selected)) {
      setSelected(exercises[0]);
    }
  }, [exercises, selected]);

  const filtered = allWorkouts.filter((w) => w.exercise === selected);

  return (
    <div className="workout-history">
      <div>
        <br />
        <h1>Workout History</h1>
        <br />
      </div>

      {loading ? (
        <LoadingState
          title="Loading workout history"
          description="Fetching your saved sessions."
          minHeight="320px"
        />
      ) : exercises.length === 0 ? (
        <p className="workout-history__empty">No workout sessions logged yet.</p>
      ) : (
        <>
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
          {selected ? <WorkoutChart data={filtered} exercise={selected} /> : null}
          <WorkoutList data={allWorkouts} />
        </>
      )}
    </div>
  );
}
