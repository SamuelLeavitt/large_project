import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { getExercises } from "../utils/workoutApi";
import {
  deleteWorkout,
  getSavedWorkouts,
  saveWorkout,
} from "../utils/workoutStorage";
import { appendWorkoutHistory } from "../utils/workoutData";
import type {
  ActiveExerciseLog,
  Exercise,
  LoggedSet,
  SavedWorkout,
  WorkoutExercise,
} from "../utils/workoutTypes";

const sectionStyle: React.CSSProperties = {
  background: "var(--social-bg)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  background: "var(--bg)",
  color: "var(--text-h)",
  boxSizing: "border-box",
};

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: "999px",
  border: active ? "1px solid var(--accent-border)" : "1px solid var(--border)",
  background: active ? "var(--accent)" : "var(--social-bg)",
  color: active ? "var(--bg)" : "var(--text)",
  cursor: "pointer",
  fontWeight: 700,
});

const zoneOptions = ["Upper Body", "Legs", "Core", "Full Body"];

type ViewMode = "saved" | "browse";
type BuilderStep = "hidden" | "exercise";

const Workout = () => {
  //Top-level page mode.
  //"saved" = manage saved workout plans
  //"browse" = browse all available exercises
  const [viewMode, setViewMode] = useState<ViewMode>("saved");

  //Stores all available exercises.
  //This comes from the temporary exercise API layer for now, will be changed to connect to API on backend later.
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  //Search box for Browse tab.
  const [browseSearch, setBrowseSearch] = useState("");

  //Search box for Saved Workouts tab.
  const [savedSearch, setSavedSearch] = useState("");

  //Controls the create workout flow.
  const [builderStep, setBuilderStep] = useState<BuilderStep>("hidden");
  const [selectedZone, setSelectedZone] = useState("Upper Body");
  const [workoutName, setWorkoutName] = useState("");
  const [builderExercises, setBuilderExercises] = useState<WorkoutExercise[]>([]);

  //Saved plans live in temporary localStorage for now.
  //Later these will be changed to come from the backend per logged-in user.
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  //Active workout mode state.
  const [activeWorkout, setActiveWorkout] = useState<SavedWorkout | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeLogs, setActiveLogs] = useState<ActiveExerciseLog[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [repsInput, setRepsInput] = useState("");

  //Stopwatch state for active workouts.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  useEffect(() => {
    loadExercises();
    setSavedWorkouts(getSavedWorkouts());
  }, []);

  useEffect(() => {
    if (!isStopwatchRunning) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isStopwatchRunning]);

  const loadExercises = async (searchTerm = "") => {
    setLoadingExercises(true);
    const exercises = await getExercises(searchTerm);
    setAllExercises(exercises);
    setLoadingExercises(false);
  };

  //Browse tab filtering.
  const filteredBrowseExercises = useMemo(() => {
    const lowered = browseSearch.trim().toLowerCase();

    if (!lowered) return allExercises;

    return allExercises.filter((exercise) => {
      return (
        exercise.name.toLowerCase().includes(lowered) ||
        (exercise.category || "").toLowerCase().includes(lowered) ||
        (exercise.bodyPart || "").toLowerCase().includes(lowered) ||
        (exercise.equipment || "").toLowerCase().includes(lowered)
      );
    });
  }, [allExercises, browseSearch]);

  //Saved workouts search by workout plan name.
  const filteredSavedWorkouts = useMemo(() => {
    const lowered = savedSearch.trim().toLowerCase();

    if (!lowered) return savedWorkouts;

    return savedWorkouts.filter((workout) =>
      workout.name.toLowerCase().includes(lowered)
    );
  }, [savedWorkouts, savedSearch]);

  //Exercises shown in the current selected body zone while building a plan.
  //The user can switch body zones at any time and keep the same current plan.
  const zoneExercises = useMemo(() => {
    return allExercises.filter(
      (exercise) =>
        (exercise.bodyPart || "").toLowerCase() === selectedZone.toLowerCase()
    );
  }, [allExercises, selectedZone]);

  const addExerciseToWorkoutPlan = (exercise: Exercise) => {
    const exerciseId =
      exercise._id || exercise.id || exercise.datasetId || exercise.name;

    const alreadyAdded = builderExercises.some(
      (item) => item.exerciseId === exerciseId
    );

    if (alreadyAdded) return;

    const newExercise: WorkoutExercise = {
      exerciseId,
      name: exercise.name,
      category: exercise.category,
      bodyPart: exercise.bodyPart,
      sets: 3,
      reps: "10",
    };

    setBuilderExercises((prev) => [...prev, newExercise]);
  };

  const updateBuilderExercise = (
    index: number,
    field: keyof WorkoutExercise,
    value: string | number
  ) => {
    setBuilderExercises((prev) =>
      prev.map((exercise, i) =>
        i === index ? { ...exercise, [field]: value } : exercise
      )
    );
  };

  const removeBuilderExercise = (index: number) => {
    setBuilderExercises((prev) => prev.filter((_, i) => i !== index));
  };

  //Starts the create plan flow and leaves zone switching available the whole time just incase user wants to mix and match.
  const handleCreateNewWorkout = () => {
    setWorkoutName("");
    setSelectedZone("Upper Body");
    setBuilderExercises([]);
    setBuilderStep("exercise");
  };

  const handleSelectZone = (zone: string) => {
    setSelectedZone(zone);
  };

  //Saves a workout plan to temporary localStorage until connected to backend logins.
  const handleSaveWorkoutPlan = () => {
    const trimmedName = workoutName.trim();

    if (!trimmedName || builderExercises.length === 0) {
      return;
    }

    const newWorkout: SavedWorkout = {
      id: crypto.randomUUID(),
      name: trimmedName,
      bodyPart:
        builderExercises.length === 1
          ? builderExercises[0].bodyPart || "Custom"
          : "Custom",
      createdAt: new Date().toISOString(),
      exercises: builderExercises,
    };

    saveWorkout(newWorkout);
    setSavedWorkouts(getSavedWorkouts());
    setWorkoutName("");
    setSelectedZone("Upper Body");
    setBuilderExercises([]);
    setBuilderStep("hidden");
  };

  const handleDeleteWorkoutPlan = (workoutId: string) => {
    deleteWorkout(workoutId);
    setSavedWorkouts(getSavedWorkouts());
  };

  //Starts a saved workout plan and switches the page into active workout mode.
  const handleStartWorkout = (workout: SavedWorkout) => {
    setActiveWorkout(workout);
    setActiveExerciseIndex(0);
    setWeightInput("");
    setRepsInput("");
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);

    setActiveLogs(
      workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: [],
      }))
    );
  };

  const handleAddSetToActiveExercise = () => {
    if (!activeWorkout || !weightInput || !repsInput) return;

    const newSet: LoggedSet = {
      weight: Number(weightInput),
      reps: Number(repsInput),
    };

    setActiveLogs((prev) =>
      prev.map((exercise, index) =>
        index === activeExerciseIndex
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    );

    setWeightInput("");
    setRepsInput("");
  };

  const activeExercise =
    activeWorkout?.exercises[activeExerciseIndex] || null;

  const activeExerciseLog = activeLogs[activeExerciseIndex];

  const handlePreviousExercise = () => {
    if (activeExerciseIndex === 0) return;
    setActiveExerciseIndex((prev) => prev - 1);
    setWeightInput("");
    setRepsInput("");
  };

  const handleNextExercise = () => {
    if (!activeWorkout) return;
    if (activeExerciseIndex >= activeWorkout.exercises.length - 1) return;

    setActiveExerciseIndex((prev) => prev + 1);
    setWeightInput("");
    setRepsInput("");
  };

  //Saves the completed active workout into temporary Workout History storage.
  const handleSaveCompletedWorkout = () => {
    if (!activeWorkout) return;

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5);

    const historyRows = activeLogs
      .filter((exercise) => exercise.sets.length > 0)
      .map((exercise) => ({
        date,
        time,
        exercise: exercise.name,
        sets: exercise.sets,
      }));

    if (historyRows.length > 0) {
      appendWorkoutHistory(historyRows);
    }

    setActiveWorkout(null);
    setActiveExerciseIndex(0);
    setActiveLogs([]);
    setWeightInput("");
    setRepsInput("");
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);
  };

  const formatStopwatch = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  //ACTIVE WORKOUT VIEW
  if (activeWorkout && activeExercise) {
    const isLastExercise =
      activeExerciseIndex === activeWorkout.exercises.length - 1;

    return (
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ marginBottom: "8px" }}>{activeWorkout.name}</h1>
              <p>
                Exercise {activeExerciseIndex + 1} of {activeWorkout.exercises.length}
              </p>
            </div>

            <Button
              label="Exit Workout"
              variant="danger"
              onClick={() => {
                setActiveWorkout(null);
                setActiveExerciseIndex(0);
                setActiveLogs([]);
                setWeightInput("");
                setRepsInput("");
                setElapsedSeconds(0);
                setIsStopwatchRunning(false);
              }}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <h2>{activeExercise.name}</h2>
          <p>
            <strong>Target:</strong> {activeExercise.sets} sets × {activeExercise.reps} reps
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>Weight</label>
              <input
                type="number"
                placeholder="Enter weight"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>Reps</label>
              <input
                type="number"
                placeholder="Enter reps"
                value={repsInput}
                onChange={(e) => setRepsInput(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Button
              label="Add Set"
              variant="primary"
              onClick={handleAddSetToActiveExercise}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <h3>Logged Sets</h3>
            {!activeExerciseLog || activeExerciseLog.sets.length === 0 ? (
              <p>No sets logged yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "10px", marginTop: "12px" }}>
                {activeExerciseLog.sets.map((set, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      background: "var(--bg)",
                    }}
                  >
                    Set {index + 1}: {set.weight} lbs × {set.reps} reps
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={sectionStyle}>
          <h2>Stopwatch</h2>
          <p style={{ fontSize: "32px", fontWeight: 700, margin: "10px 0 18px 0" }}>
            {formatStopwatch(elapsedSeconds)}
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
              label={isStopwatchRunning ? "Pause" : "Start"}
              variant="primary"
              onClick={() => setIsStopwatchRunning((prev) => !prev)}
            />
            <Button
              label="Reset"
              variant="secondary"
              onClick={() => {
                setElapsedSeconds(0);
                setIsStopwatchRunning(false);
              }}
            />
          </div>
        </div>

        <div style={sectionStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Button
              label="Last Exercise"
              variant="secondary"
              onClick={handlePreviousExercise}
              disabled={activeExerciseIndex === 0}
            />

            {isLastExercise ? (
              <Button
                label="Save"
                variant="primary"
                onClick={handleSaveCompletedWorkout}
              />
            ) : (
              <Button
                label="Next Exercise"
                variant="primary"
                onClick={handleNextExercise}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  //NORMAL PAGE VIEW (Including Saved Page and Browse Page)
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "24px",
        display: "grid",
        gap: "24px",
      }}
    >
      <div>
        <h1>Workouts</h1>
        <p>
          Build workout plans, browse exercises, and temporarily save completed
          workouts into Workout History.
        </p>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button
          type="button"
          style={tabButtonStyle(viewMode === "saved")}
          onClick={() => setViewMode("saved")}
        >
          Saved Workouts
        </button>

        <button
          type="button"
          style={tabButtonStyle(viewMode === "browse")}
          onClick={() => setViewMode("browse")}
        >
          Browse
        </button>
      </div>
      
      {viewMode === "browse" && (
        <div style={sectionStyle}>
          <div style={{ marginBottom: "18px" }}>
            <input
              type="text"
              placeholder="Search Exercises"
              value={browseSearch}
              onChange={(e) => setBrowseSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          {loadingExercises ? (
            <p>Loading exercises...</p>
          ) : filteredBrowseExercises.length === 0 ? (
            <p>No exercises found.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredBrowseExercises.map((exercise) => (
                <div
                  key={exercise._id || exercise.id || exercise.datasetId || exercise.name}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    padding: "14px",
                    background: "var(--bg)",
                  }}
                >
                  <h3 style={{ margin: "0 0 8px 0" }}>{exercise.name}</h3>
                  <p><strong>Body Area:</strong> {exercise.bodyPart || "N/A"}</p>
                  <p><strong>Category:</strong> {exercise.category || "N/A"}</p>
                  <p><strong>Equipment:</strong> {exercise.equipment || "N/A"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewMode === "saved" && (
        <div style={{ display: "grid", gap: "24px" }}>
          <div style={sectionStyle}>
            <input
              type="text"
              placeholder="Search saved workouts"
              value={savedSearch}
              onChange={(e) => setSavedSearch(e.target.value)}
              style={inputStyle}
            />

            <div style={{ marginTop: "18px" }}>
              <Button
                label="Create New Workout"
                variant="primary"
                onClick={handleCreateNewWorkout}
              />
            </div>

            {builderStep === "exercise" && (
              <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
                <div>
                  <h2>Create Your Workout Plan</h2>
                  <p>Choose a body zone, then add any exercises you want to your plan.</p>
                </div>

                <div>
                  <h3 style={{ marginBottom: "10px" }}>Choose a Body Zone</h3>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {zoneOptions.map((zone) => (
                      <button
                        key={zone}
                        type="button"
                        style={tabButtonStyle(selectedZone === zone)}
                        onClick={() => handleSelectZone(zone)}
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2>{selectedZone} Exercises</h2>
                  <p>Choose the exercises you want in this workout plan.</p>
                </div>

                <div style={{ display: "grid", gap: "12px" }}>
                  {zoneExercises.map((exercise) => (
                    <div
                      key={exercise._id || exercise.id || exercise.datasetId || exercise.name}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "14px",
                        background: "var(--bg)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h3 style={{ margin: "0 0 8px 0" }}>{exercise.name}</h3>
                          <p><strong>Body Area:</strong> {exercise.bodyPart || "N/A"}</p>
                          <p><strong>Equipment:</strong> {exercise.equipment || "N/A"}</p>
                        </div>

                        <Button
                          label="Add to Workout Plan"
                          variant="primary"
                          onClick={() => addExerciseToWorkoutPlan(exercise)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "6px" }}>
                    Workout Plan Name
                  </label>
                  <input
                    type="text"
                    placeholder="Example: Upper Body Day A"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <h2>Current Plan Exercises</h2>

                  {builderExercises.length === 0 ? (
                    <p>No exercises added yet.</p>
                  ) : (
                    <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                      {builderExercises.map((exercise, index) => (
                        <div
                          key={`${exercise.exerciseId}-${index}`}
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: "12px",
                            padding: "14px",
                            background: "var(--bg)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "10px",
                              flexWrap: "wrap",
                              alignItems: "center",
                              marginBottom: "12px",
                            }}
                          >
                            <strong>{exercise.name}</strong>
                            <Button
                              label="Remove"
                              variant="danger"
                              onClick={() => removeBuilderExercise(index)}
                            />
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "12px",
                            }}
                          >
                            <div>
                              <label style={{ display: "block", marginBottom: "6px" }}>
                                Sets
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={exercise.sets}
                                onChange={(e) =>
                                  updateBuilderExercise(
                                    index,
                                    "sets",
                                    Number(e.target.value)
                                  )
                                }
                                style={inputStyle}
                              />
                            </div>

                            <div>
                              <label style={{ display: "block", marginBottom: "6px" }}>
                                Reps
                              </label>
                              <input
                                type="text"
                                placeholder="8-10"
                                value={exercise.reps}
                                onChange={(e) =>
                                  updateBuilderExercise(index, "reps", e.target.value)
                                }
                                style={inputStyle}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Button
                    label="Save Workout Plan"
                    variant="primary"
                    onClick={handleSaveWorkoutPlan}
                    disabled={!workoutName.trim() || builderExercises.length === 0}
                  />
                  <Button
                    label="Cancel"
                    variant="secondary"
                    onClick={() => {
                      setBuilderStep("hidden");
                      setWorkoutName("");
                      setSelectedZone("Upper Body");
                      setBuilderExercises([]);
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={sectionStyle}>
            <h2>Your Saved Workout Plans</h2>

            {filteredSavedWorkouts.length === 0 ? (
              <p style={{ marginTop: "12px" }}>No saved workout plans yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
                {filteredSavedWorkouts.map((workout) => (
                  <div
                    key={workout.id}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "14px",
                      background: "var(--bg)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0 }}>{workout.name}</h3>
                        <p style={{ marginTop: "6px" }}>
                          <strong>Body Area:</strong> {workout.bodyPart}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <Button
                          label="Start Workout"
                          variant="primary"
                          onClick={() => handleStartWorkout(workout)}
                        />
                        <Button
                          label="Delete"
                          variant="danger"
                          onClick={() => handleDeleteWorkoutPlan(workout.id)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: "8px" }}>
                      {workout.exercises.map((exercise, index) => (
                        <div
                          key={`${workout.id}-${index}`}
                          style={{
                            padding: "10px",
                            borderRadius: "10px",
                            background: "var(--social-bg)",
                          }}
                        >
                          <strong>{exercise.name}</strong>
                          <p>
                            {exercise.sets} sets × {exercise.reps} reps
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Workout;