import { useEffect, useState } from "react";
import Button from "../components/Button";

// Basic type for each exercise in the workout
type Exercise = {
  id: number;
  name: string;
  sets: number;
  targetReps: string;
  notes?: string;
};

// Temporary workout data for now
// Later, this can be replaced with data from your API
const todaysWorkout: Exercise[] = [
  { id: 1, name: "Barbell Bench Press", sets: 4, targetReps: "8-10", notes: "Controlled reps" },
  { id: 2, name: "Incline Dumbbell Press", sets: 3, targetReps: "10-12" },
  { id: 3, name: "Cable Fly", sets: 3, targetReps: "12-15" },
  { id: 4, name: "Push Ups", sets: 2, targetReps: "Failure" },
];

const Workout = () => {
  // Keeps track of which exercise the user is currently on
  const [currentIndex, setCurrentIndex] = useState(0);

  // Stores the weight and reps the user types in
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // Stores saved set entries
  const [savedSets, setSavedSets] = useState<string[]>([]);

  // Simple rest timer state
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentExercise = todaysWorkout[currentIndex];

  // Runs the timer every second when started
  useEffect(() => {
    let interval: number | undefined;

    if (isTimerRunning && timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setIsTimerRunning(false);
    }

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isTimerRunning, timer]);

  // Move to the previous exercise
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setWeight("");
      setReps("");
    }
  };

  // Move to the next exercise
  const handleNext = () => {
    if (currentIndex < todaysWorkout.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setWeight("");
      setReps("");
    }
  };

  // Save the entered set information
  const handleSaveSet = () => {
    if (!weight || !reps) return;

    const entry = `${currentExercise.name} - ${weight} lbs x ${reps} reps`;
    setSavedSets((prev) => [...prev, entry]);

    setWeight("");
    setReps("");
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimer(60);
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
        display: "grid",
        gap: "24px",
      }}
    >
      <div>
        <h1>Workout Page</h1>
        <p>Today’s plan: Chest Day</p>
      </div>

      {/* Main page content */}
      <div
        style={{
          display: "grid",
          gap: "20px",
          gridTemplateColumns: "1fr", // One column for simpler mobile-friendly layout
        }}
      >
        {/* Current exercise section */}
        <div
          style={{
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "left",
          }}
        >
          <p style={{ marginBottom: "8px", color: "var(--text)" }}>
            Exercise {currentIndex + 1} of {todaysWorkout.length}
          </p>

          <h2>{currentExercise.name}</h2>

          <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
            <p><strong>Sets:</strong> {currentExercise.sets}</p>
            <p><strong>Target Reps:</strong> {currentExercise.targetReps}</p>
            {currentExercise.notes && <p><strong>Notes:</strong> {currentExercise.notes}</p>}
          </div>

          {/* User input section */}
          <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>Weight</label>
              <input
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text-h)",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>Reps</label>
              <input
                type="number"
                placeholder="Enter reps"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--text-h)",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Navigation and save buttons */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Button label="Previous" variant="secondary" onClick={handlePrevious} />
            <Button label="Next" variant="secondary" onClick={handleNext} />
            <Button label="Save Set" variant="primary" onClick={handleSaveSet} />
          </div>
        </div>

        {/* Timer section */}
        <div
          style={{
            background: "var(--social-bg)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "20px",
            textAlign: "left",
            display: "grid",
            gap: "18px",
          }}
        >
          <div>
            <h2>Rest Timer</h2>
            <p style={{ fontSize: "32px", fontWeight: "bold", marginTop: "10px" }}>
              {timer}s
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <Button label="Start" variant="primary" onClick={handleStartTimer} />
            <Button label="Stop" variant="danger" onClick={handleStopTimer} />
            <Button label="Reset" variant="secondary" onClick={handleResetTimer} />
          </div>

          {/* List of exercises for today */}
          <div>
            <h2>Today’s Exercises</h2>
            <div style={{ marginTop: "10px", display: "grid", gap: "10px" }}>
              {todaysWorkout.map((exercise, index) => (
                <div
                  key={exercise.id}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: index === currentIndex
                      ? "2px solid var(--accent)"
                      : "1px solid var(--border)",
                    background: index === currentIndex
                      ? "var(--accent-bg)"
                      : "var(--bg)",
                  }}
                >
                  {index + 1}. {exercise.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Saved set history for this page session */}
      <div
        style={{
          background: "var(--social-bg)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px",
          textAlign: "left",
        }}
      >
        <h2>Saved Sets</h2>

        {savedSets.length === 0 ? (
          <p style={{ marginTop: "10px" }}>No sets saved yet.</p>
        ) : (
          <ul style={{ marginTop: "10px" }}>
            {savedSets.map((set, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                {set}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Workout;