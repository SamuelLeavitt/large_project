import { useEffect, useMemo, useState } from "react";
import LoadingState from "../components/LoadingState";
import WorkoutChart from "../components/WorkoutChart";
import WorkoutList from "../components/WorkoutList";
import { getWorkouts } from "../utils/workoutData";
import type { Workout } from "../utils/workoutData";
import "../App.css";

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
    <div className="wh-root">
      <div className="wh-page-header">

        <p className="wh-page-subtitle">Track your progress over time</p>
      </div>

      {loading ? (
        <LoadingState
          title="Loading workout history"
          description="Fetching your saved sessions."
          minHeight="320px"
        />
      ) : exercises.length === 0 ? (
        <div className="wh-empty">
          <span className="wh-empty__icon">📋</span>
          <p>No workout sessions logged yet.</p>
        </div>
      ) : (
        <>
          {/* exercise selector */}
          <div className="wh-section">
            <p className="wh-section__label">Exercise</p>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="wh-select"
            >
              {exercises.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          {/* chart filters to the selected exercise; list shows full session log intentionally */}
          {selected && (
            <div className="wh-section">
              <WorkoutChart data={filtered} exercise={selected} />
            </div>
          )}

          <div className="wh-section">
            <WorkoutList data={allWorkouts} />
          </div>
        </>
      )}
    </div>
  );
}
