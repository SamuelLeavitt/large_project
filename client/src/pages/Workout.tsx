import { useEffect, useMemo, useState } from "react";
import { QuickStartWorkoutBuilder } from "../components/ActiveWorkout";
import Button from "../components/Button";
import SavedTemplates from "../components/SavedTemplates";
import { getExercises } from "../utils/workoutApi";
import {
  deleteWorkout,
  getSavedWorkouts,
  saveWorkout,
  updateWorkout,
} from "../utils/workoutStorage";
import { saveWorkoutSession } from "../utils/workoutData";
import type {
  ActiveExerciseLog,
  Exercise,
  SavedWorkout,
  WorkoutExercise,
} from "../utils/workoutTypes";

const sectionStyle: React.CSSProperties = {
  background: "#f8fbff",
  border: "1px solid #d8e5f2",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  textAlign: "left",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #c8d7e6",
  background: "#ffffff",
  color: "#0f172a",
  boxSizing: "border-box",
};

const tabButtonStyle = (active: boolean): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: "999px",
  border: active ? "1px solid #9ccbf3" : "1px solid #d2deea",
  background: active ? "#dff0ff" : "#eef4fa",
  color: active ? "#2b95e8" : "#4b5563",
  cursor: "pointer",
  fontWeight: 700,
});

const shellStyle: React.CSSProperties = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "24px",
  display: "grid",
  gap: "22px",
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "56px",
  lineHeight: 1,
  color: "#060b13",
  letterSpacing: "-1.4px",
};

const zoneOptions = ["Upper Body", "Legs", "Core", "Full Body"];

//Fixed Page Setups (For easier mobile use)
const fixedWorkoutExerciseListStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "14px",
  padding: "12px",
  background: "var(--bg)",
  minHeight: "364px",
  maxHeight: "728px",
  overflowY: "auto",
};

const fixedExercisePickerBoxStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "14px",
  padding: "12px",
  background: "var(--bg)",
  minHeight: "360px",
  maxHeight: "360px",
  overflowY: "auto",
};

type BuilderStep =
  | "hidden"
  | "name"
  | "builder"
  | "exercisePicker"
  | "quickStartBuilder"
  | "quickStartExercisePicker"
  | "quickStartFinishQuestion";

type ActiveWorkoutStep = "session" | "exercisePicker" | "finishQuestion";

const buildBodyPartLabel = (exercises: WorkoutExercise[]) => {
  if (exercises.length === 1) {
    return exercises[0].bodyPart || "Custom";
  }

  return "Custom";
};

const hasEmptyActiveSet = (logs: ActiveExerciseLog[]) => {
  return logs.some((exercise) =>
    exercise.sets.some((set) => set.weight <= 0 || set.reps <= 0)
  );
};

const finishBlockedMessage = "Fill both lbs and reps for every active set before finishing.";

const parseRepTarget = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const createPrefilledSet = (reps: string) => ({
  weight: 0,
  reps: parseRepTarget(reps),
});

const Workout = () => {
  //Stores all available exercises.
  //This comes from the temporary exercise API layer for now, will be changed to connect to API on backend later.
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(true);

  //Search box used only on the Add Exercise page.
  const [builderSearch, setBuilderSearch] = useState("");

  //Search box used only on the Quick Start Add Exercise page.
  const [quickStartSearch, setQuickStartSearch] = useState("");

  //Controls the create workout flow.
  //The flow is split into dedicated full-page views:
  //1. name page
  //2. workout builder page
  //3. exercise picker page
  const [builderStep, setBuilderStep] = useState<BuilderStep>("hidden");
  const [selectedZone, setSelectedZone] = useState("Upper Body");
  const [workoutName, setWorkoutName] = useState("");
  const [builderExercises, setBuilderExercises] = useState<WorkoutExercise[]>([]);

  // Saved templates are loaded per authenticated user from backend.
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);

  //Active workout mode state.
  const [activeWorkout, setActiveWorkout] = useState<SavedWorkout | null>(null);
  const [activeWorkoutExercises, setActiveWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [activeLogs, setActiveLogs] = useState<ActiveExerciseLog[]>([]);
  const [activeWorkoutStep, setActiveWorkoutStep] = useState<ActiveWorkoutStep>("session");

  //Quick Start state.
  //This is a note: Quick Start acts like a blank temporary workout that can optionally be saved as a plan at the end.
  const [quickStartExercises, setQuickStartExercises] = useState<WorkoutExercise[]>([]);
  const [quickStartLogs, setQuickStartLogs] = useState<ActiveExerciseLog[]>([]);

  //This is a note: these states control the Quick Start finish flow pages instead of using popup windows.
  const [quickStartPlanName, setQuickStartPlanName] = useState("");

  //Stopwatch state for active workouts.
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);

  const refreshSavedWorkouts = async () => {
    try {
      const templates = await getSavedWorkouts();
      setSavedWorkouts(templates);
    } catch (error) {
      console.error("Failed to refresh saved workouts:", error);
      setSavedWorkouts([]);
    }
  };

  useEffect(() => {
    loadExercises();
    void refreshSavedWorkouts();
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

  const filteredSavedWorkouts = savedWorkouts;

  //Exercises shown in the current selected body zone while building a plan.
  //Search stays on this page only so the builder page stays cleaner on mobile.
  const zoneExercises = useMemo(() => {
    const lowered = builderSearch.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      const matchesZone =
        (exercise.bodyPart || "").toLowerCase() === selectedZone.toLowerCase();

      if (!matchesZone) return false;
      if (!lowered) return true;

      return (
        exercise.name.toLowerCase().includes(lowered) ||
        (exercise.category || "").toLowerCase().includes(lowered) ||
        (exercise.bodyPart || "").toLowerCase().includes(lowered) ||
        (exercise.equipment || "").toLowerCase().includes(lowered)
      );
    });
  }, [allExercises, selectedZone, builderSearch]);

  //This is a note: Quick Start uses its own picker search but keeps the same body zone buttons.
  const quickStartZoneExercises = useMemo(() => {
    const lowered = quickStartSearch.trim().toLowerCase();

    return allExercises.filter((exercise) => {
      const matchesZone =
        (exercise.bodyPart || "").toLowerCase() === selectedZone.toLowerCase();

      if (!matchesZone) return false;
      if (!lowered) return true;

      return (
        exercise.name.toLowerCase().includes(lowered) ||
        (exercise.category || "").toLowerCase().includes(lowered) ||
        (exercise.bodyPart || "").toLowerCase().includes(lowered) ||
        (exercise.equipment || "").toLowerCase().includes(lowered)
      );
    });
  }, [allExercises, quickStartSearch, selectedZone]);

  const addExerciseToWorkoutPlan = (exercise: Exercise) => {
    const exerciseId =
      exercise._id || exercise.id || exercise.datasetId || exercise.name;

    const alreadyAdded = builderExercises.some(
      (item) => item.exerciseId === exerciseId
    );

    if (alreadyAdded) {
      setBuilderStep("builder");
      return;
    }

    const newExercise: WorkoutExercise = {
      exerciseId,
      name: exercise.name,
      category: exercise.category,
      bodyPart: exercise.bodyPart,
      sets: 3,
      reps: "10",
    };

    setBuilderExercises((prev) => [...prev, newExercise]);
    setBuilderStep("builder");
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

  //Starts the create plan flow on a dedicated naming page first.
  const handleCreateNewWorkout = () => {
    setWorkoutName("");
    setSelectedZone("Upper Body");
    setBuilderSearch("");
    setBuilderExercises([]);
    setBuilderStep("name");
  };

  const handleSaveWorkoutName = () => {
    if (!workoutName.trim()) return;
    setBuilderStep("builder");
  };

  const handleOpenExercisePicker = () => {
    setBuilderSearch("");
    setBuilderStep("exercisePicker");
  };

  const handleCloseBuilder = () => {
    setBuilderStep("hidden");
    setWorkoutName("");
    setSelectedZone("Upper Body");
    setBuilderSearch("");
    setBuilderExercises([]);
  };

  const handleSelectZone = (zone: string) => {
    setSelectedZone(zone);
  };

  // Saves a workout template for the current authenticated user.
  const handleSaveWorkoutPlan = async () => {
    const trimmedName = workoutName.trim();

    if (!trimmedName || builderExercises.length === 0) {
      return;
    }

    const newWorkout: SavedWorkout = {
      id: crypto.randomUUID(),
      name: trimmedName,
      bodyPart: buildBodyPartLabel(builderExercises),
      createdAt: new Date().toISOString(),
      exercises: builderExercises,
    };

    try {
      await saveWorkout(newWorkout);
      await refreshSavedWorkouts();
      setWorkoutName("");
      setSelectedZone("Upper Body");
      setBuilderSearch("");
      setBuilderExercises([]);
      setBuilderStep("hidden");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save workout template.";
      window.alert(message);
    }
  };

  const handleDeleteWorkoutPlan = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId);
      await refreshSavedWorkouts();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete workout template.";
      window.alert(message);
    }
  };

  const resetWorkoutInputs = () => {
  };

  //Starts a saved workout plan and switches the page into active workout mode.
  const handleStartWorkout = (workout: SavedWorkout) => {
    setActiveWorkout(workout);
    setActiveWorkoutExercises(workout.exercises.map((exercise) => ({ ...exercise })));
    setActiveWorkoutStep("session");
    resetWorkoutInputs();
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);

    setActiveLogs(
      workout.exercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: Array.from({ length: exercise.sets }, () => createPrefilledSet(exercise.reps)),
      }))
    );
  };

  const handleAddSetToActiveWorkoutExercise = (exerciseIndex: number) => {
    setActiveWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: exercise.sets + 1 }
          : exercise
      )
    );

    setActiveLogs((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              sets: [
                ...exercise.sets,
                createPrefilledSet(activeWorkoutExercises[exerciseIndex]?.reps || "0"),
              ],
            }
          : exercise
      )
    );
  };

  const handleRemoveSetFromActiveWorkoutExercise = (
    exerciseIndex: number,
    setIndex: number
  ) => {
    setActiveWorkoutExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: Math.max(0, exercise.sets - 1) }
          : exercise
      )
    );

    setActiveLogs((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) }
          : exercise
      )
    );
  };

  const handleUpdateActiveWorkoutSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    const parsed = value.trim() === "" ? 0 : Number(value);

    if (Number.isNaN(parsed)) return;

    setActiveLogs((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, i) =>
            i === setIndex ? { ...set, [field]: parsed } : set
          ),
        };
      })
    );
  };

  const exitActiveWorkout = () => {
    setActiveWorkout(null);
    setActiveWorkoutExercises([]);
    setActiveLogs([]);
    resetWorkoutInputs();
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);
    setActiveWorkoutStep("session");
  };

  const handleOpenActiveWorkoutExercisePicker = () => {
    setActiveWorkoutStep("exercisePicker");
  };

  const addExerciseToActiveWorkout = (exercise: Exercise) => {
    const exerciseId =
      exercise._id || exercise.id || exercise.datasetId || exercise.name;

    const alreadyAddedIndex = activeWorkoutExercises.findIndex(
      (item) => item.exerciseId === exerciseId
    );

    if (alreadyAddedIndex !== -1) {
      setActiveWorkoutStep("exercisePicker");
      return;
    }

    const newExercise: WorkoutExercise = {
      exerciseId,
      name: exercise.name,
      category: exercise.category,
      bodyPart: exercise.bodyPart,
      sets: 3,
      reps: "10",
    };

    const newLog: ActiveExerciseLog = {
      exerciseId,
      name: exercise.name,
      sets: [{ weight: 0, reps: 0 }],
    };

    setActiveWorkoutExercises((prev) => [...prev, newExercise]);
    setActiveLogs((prev) => [...prev, newLog]);
    setActiveWorkoutStep("session");
  };

  const removeActiveWorkoutExercise = (index: number) => {
    setActiveWorkoutExercises((prev) => prev.filter((_, i) => i !== index));
    setActiveLogs((prev) => prev.filter((_, i) => i !== index));

    resetWorkoutInputs();
  };

  const handleSaveCompletedWorkout = async () => {
    if (!activeWorkout) return;

    if (hasEmptyActiveSet(activeLogs)) {
      window.alert(finishBlockedMessage);
      return;
    }

    const completedAt = new Date().toISOString();

    await saveWorkoutSession({
      workoutName: activeWorkout.name,
      sourceType: "template",
      templateId: activeWorkout.id,
      templateName: activeWorkout.name,
      completedAt,
      durationSeconds: elapsedSeconds,
      exercises: activeWorkoutExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: (activeLogs[index]?.sets || []).filter(
          (set) => set.weight > 0 || set.reps > 0
        ),
      })),
    });

    setIsStopwatchRunning(false);
    setActiveWorkoutStep("finishQuestion");
  };

  const handleSaveActiveWorkoutTemplate = async () => {
    if (!activeWorkout) return;

    const updatedTemplateExercises = activeWorkoutExercises.map((exercise, index) => {
      const loggedSets = (activeLogs[index]?.sets || []).filter(
        (set) => set.weight > 0 && set.reps > 0
      );

      if (loggedSets.length === 0) {
        return exercise;
      }

      return {
        ...exercise,
        sets: loggedSets.length,
      };
    });

    try {
      await updateWorkout({
        ...activeWorkout,
        bodyPart: buildBodyPartLabel(updatedTemplateExercises),
        exercises: updatedTemplateExercises,
      });
      await refreshSavedWorkouts();
      finishActiveWorkoutAndReturn();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update workout template.";
      window.alert(message);
    }
  };

  const finishActiveWorkoutAndReturn = () => {
    exitActiveWorkout();
  };

  //QUICK START HELPERS
  const resetQuickStartFlow = () => {
    setQuickStartExercises([]);
    setQuickStartLogs([]);
    setQuickStartSearch("");
    setSelectedZone("Upper Body");
    setBuilderStep("hidden");
    setQuickStartPlanName("");
    resetWorkoutInputs();
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);
  };

  const handleStartBlankQuickStart = () => {
    setQuickStartExercises([]);
    setQuickStartLogs([]);
    setQuickStartSearch("");
    setSelectedZone("Upper Body");
    setBuilderStep("quickStartBuilder");
    resetWorkoutInputs();
    setElapsedSeconds(0);
    setIsStopwatchRunning(false);
  };

  const handleOpenQuickStartExercisePicker = () => {
    setQuickStartSearch("");
    setBuilderStep("quickStartExercisePicker");
  };

  const addExerciseToQuickStart = (exercise: Exercise) => {
    const exerciseId =
      exercise._id || exercise.id || exercise.datasetId || exercise.name;

    const alreadyAddedIndex = quickStartExercises.findIndex(
      (item) => item.exerciseId === exerciseId
    );

    if (alreadyAddedIndex !== -1) {
      setBuilderStep("quickStartBuilder");
      return;
    }

    const newExercise: WorkoutExercise = {
      exerciseId,
      name: exercise.name,
      category: exercise.category,
      bodyPart: exercise.bodyPart,
      sets: 3,
      reps: "10",
    };

    const newLog: ActiveExerciseLog = {
      exerciseId,
      name: exercise.name,
      sets: [{ weight: 0, reps: 0 }],
    };

    setQuickStartExercises((prev) => [...prev, newExercise]);
    setQuickStartLogs((prev) => [...prev, newLog]);
    setBuilderStep("quickStartBuilder");
  };

  const removeQuickStartExercise = (index: number) => {
    setQuickStartExercises((prev) => prev.filter((_, i) => i !== index));
    setQuickStartLogs((prev) => prev.filter((_, i) => i !== index));
    resetWorkoutInputs();
  };

  const handleAddSetToQuickStartExercise = (exerciseIndex: number) => {
    setQuickStartLogs((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: [...exercise.sets, createPrefilledSet(quickStartExercises[index]?.reps || "0")] }
          : exercise
      )
    );
  };

  const handleRemoveSetFromQuickStartExercise = (
    exerciseIndex: number,
    setIndex: number
  ) => {
    setQuickStartExercises((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: Math.max(0, exercise.sets - 1) }
          : exercise
      )
    );

    setQuickStartLogs((prev) =>
      prev.map((exercise, index) =>
        index === exerciseIndex
          ? { ...exercise, sets: exercise.sets.filter((_, i) => i !== setIndex) }
          : exercise
      )
    );
  };

  const handleUpdateQuickStartSet = (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => {
    const parsed = value.trim() === "" ? 0 : Number(value);

    if (Number.isNaN(parsed)) return;

    setQuickStartLogs((prev) =>
      prev.map((exercise, index) => {
        if (index !== exerciseIndex) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set, i) =>
            i === setIndex ? { ...set, [field]: parsed } : set
          ),
        };
      })
    );
  };

  const saveQuickStartToHistory = async () => {
    if (quickStartExercises.length === 0) return;

    const workoutName = quickStartPlanName.trim() || "Quick Start Workout";

    await saveWorkoutSession({
      workoutName,
      sourceType: "quickStart",
      templateId: null,
      templateName: workoutName,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds,
      exercises: quickStartExercises.map((exercise, index) => ({
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        sets: (quickStartLogs[index]?.sets || []).filter(
          (set) => set.weight > 0 || set.reps > 0
        ),
      })),
    });
  };

  const finishQuickStartAndReturn = () => {
    resetQuickStartFlow();
    setQuickStartPlanName("");
  };

  const handleSaveQuickStartAsPlan = async () => {
    const trimmedName = quickStartPlanName.trim() || "Quick Start Workout";

    if (quickStartExercises.length === 0) return;

    const newWorkout: SavedWorkout = {
      id: crypto.randomUUID(),
      name: trimmedName,
      bodyPart: buildBodyPartLabel(quickStartExercises),
      createdAt: new Date().toISOString(),
      exercises: quickStartExercises,
    };

    try {
      await saveWorkout(newWorkout);
      await refreshSavedWorkouts();
      finishQuickStartAndReturn();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save workout template.";
      window.alert(message);
    }
  };

  const handleFinishQuickStartWorkout = async () => {
    if (quickStartExercises.length === 0) return;

    if (hasEmptyActiveSet(quickStartLogs)) {
      window.alert(finishBlockedMessage);
      return;
    }

    //This is a note: save the completed session to temporary workout history first.
    await saveQuickStartToHistory();

    //This is a note: move to a dedicated page instead of using popup questions.
    setBuilderStep("quickStartFinishQuestion");
  };

  //ACTIVE WORKOUT FINISH QUESTION PAGE
  if (activeWorkoutStep === "finishQuestion" && activeWorkout) {
    return (
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Workout Finished</h1>
          <p>Do you want to modify the saved template with these workout changes?</p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button label="Yes" variant="primary" onClick={handleSaveActiveWorkoutTemplate} />
            <Button label="No" variant="secondary" onClick={finishActiveWorkoutAndReturn} />
          </div>
        </div>
      </div>
    );
  }

  //ACTIVE WORKOUT ADD EXERCISE PAGE
  if (activeWorkoutStep === "exercisePicker") {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Add Exercise</h1>
          <p>Choose a body zone or search for exercises to add to this workout.</p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "18px" }}>
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
              <input
                type="text"
                placeholder="Search exercises"
                value={builderSearch}
                onChange={(e) => setBuilderSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fixedExercisePickerBoxStyle}>
              {loadingExercises ? (
                <p>Loading exercises...</p>
              ) : zoneExercises.length === 0 ? (
                <p>No exercises found in this body zone.</p>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {zoneExercises.map((exercise) => {
                    const alreadyAdded = activeWorkoutExercises.some(
                      (item) =>
                        item.exerciseId ===
                        (exercise._id || exercise.id || exercise.datasetId || exercise.name)
                    );

                    return (
                      <div
                        key={exercise._id || exercise.id || exercise.datasetId || exercise.name}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "12px",
                          background: "var(--social-bg)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: "0 0 8px 0", wordBreak: "break-word" }}>
                              {exercise.name}
                            </h3>
                            <p style={{ margin: "0 0 4px 0" }}>
                              <strong>Body Area:</strong> {exercise.bodyPart || "N/A"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Equipment:</strong> {exercise.equipment || "N/A"}
                            </p>
                          </div>

                          <Button
                            label={alreadyAdded ? "Added" : "Add"}
                            variant="primary"
                            onClick={() => addExerciseToActiveWorkout(exercise)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button label="Cancel" variant="secondary" onClick={() => setActiveWorkoutStep("session")} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  //ACTIVE WORKOUT VIEW
  if (activeWorkout) {
    return (
      <QuickStartWorkoutBuilder
        quickStartName={activeWorkout.name}
        onQuickStartNameChange={() => {}}
        quickStartNameEditable={false}
        quickStartExercises={activeWorkoutExercises}
        quickStartLogs={activeLogs}
        elapsedSeconds={elapsedSeconds}
        isStopwatchRunning={isStopwatchRunning}
        onToggleStopwatch={() => setIsStopwatchRunning((prev) => !prev)}
        onResetStopwatch={() => {
          setElapsedSeconds(0);
          setIsStopwatchRunning(false);
        }}
        onOpenExercisePicker={handleOpenActiveWorkoutExercisePicker}
        onRemoveExercise={removeActiveWorkoutExercise}
        onAddSet={handleAddSetToActiveWorkoutExercise}
        onRemoveSet={handleRemoveSetFromActiveWorkoutExercise}
        onUpdateSet={handleUpdateActiveWorkoutSet}
        onFinishWorkout={handleSaveCompletedWorkout}
        onCancelWorkout={exitActiveWorkout}
        disableFinishWorkout={activeWorkoutExercises.length === 0 || hasEmptyActiveSet(activeLogs)}
        finishBlockedMessage={finishBlockedMessage}
      />
    );
  }

  //NEW WORKOUT NAME PAGE
  if (builderStep === "name") {
    return (
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Create Template</h1>
          <p>
            Start by naming your Workout.
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "18px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px" }}>
                Workout Name
              </label>
              <input
                type="text"
                placeholder="Example: Push Day A"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                label="Save Name"
                variant="primary"
                onClick={handleSaveWorkoutName}
                disabled={!workoutName.trim()}
              />
              <Button
                label="Cancel New Workout"
                variant="secondary"
                onClick={handleCloseBuilder}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  //NEW WORKOUT BUILDER PAGE
  if (builderStep === "builder") {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "16px", wordBreak: "break-word" }}>
            {workoutName}
          </h1>
          <p>
            Add exercises to this workout, then set target sets and reps for each one.
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "16px" }}>
            {builderExercises.length === 0 ? (
              <div
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "14px",
                  background: "var(--bg)",
                }}
              >
                <p style={{ margin: 0 }}>No exercises added yet.</p>
              </div>
            ) : (
              <div style={fixedWorkoutExerciseListStyle}>
                <div style={{ display: "grid", gap: "12px" }}>
                  {builderExercises.map((exercise, index) => (
                    <div
                      key={`${exercise.exerciseId}-${index}`}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        padding: "14px",
                        background: "var(--social-bg)",
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
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <strong style={{ display: "block", wordBreak: "break-word" }}>
                            {exercise.name}
                          </strong>
                          <p style={{ margin: "6px 0 0 0" }}>
                            <strong>Body Area:</strong> {exercise.bodyPart || "N/A"}
                          </p>
                        </div>

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
                            Target Sets
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
                            Target Reps
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
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                label="Add Exercise"
                variant="primary"
                onClick={handleOpenExercisePicker}
              />
              <Button
                label="Save Workout"
                variant="primary"
                onClick={() => {
                  void handleSaveWorkoutPlan();
                }}
                disabled={!workoutName.trim() || builderExercises.length === 0}
              />
              <Button
                label="Cancel New Workout"
                variant="secondary"
                onClick={handleCloseBuilder}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  //ADD EXERCISE PAGE
  if (builderStep === "exercisePicker") {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Add Exercise</h1>
          <p>
            Choose a body zone or search for exercises to add to your workout plan.
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "18px" }}>
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
              <input
                type="text"
                placeholder="Search exercises"
                value={builderSearch}
                onChange={(e) => setBuilderSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fixedExercisePickerBoxStyle}>
              {loadingExercises ? (
                <p>Loading exercises...</p>
              ) : zoneExercises.length === 0 ? (
                <p>No exercises found in this body zone.</p>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {zoneExercises.map((exercise) => {
                    const alreadyAdded = builderExercises.some(
                      (item) =>
                        item.exerciseId ===
                        (exercise._id || exercise.id || exercise.datasetId || exercise.name)
                    );

                    return (
                      <div
                        key={exercise._id || exercise.id || exercise.datasetId || exercise.name}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "12px",
                          background: "var(--social-bg)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: "0 0 8px 0", wordBreak: "break-word" }}>
                              {exercise.name}
                            </h3>
                            <p style={{ margin: "0 0 4px 0" }}>
                              <strong>Body Area:</strong> {exercise.bodyPart || "N/A"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Equipment:</strong> {exercise.equipment || "N/A"}
                            </p>
                          </div>

                          <Button
                            label={alreadyAdded ? "Added" : "Add"}
                            variant="primary"
                            onClick={() => addExerciseToWorkoutPlan(exercise)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                label="Back to Workout"
                variant="secondary"
                onClick={() => setBuilderStep("builder")}
              />
              <Button
                label="Cancel New Workout"
                variant="secondary"
                onClick={handleCloseBuilder}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
 //QUICK START WORKOUT BUILDER PAGE
  if (builderStep === "quickStartBuilder") {
    return (
      <QuickStartWorkoutBuilder
        quickStartName={quickStartPlanName}
        onQuickStartNameChange={setQuickStartPlanName}
        quickStartExercises={quickStartExercises}
        quickStartLogs={quickStartLogs}
        elapsedSeconds={elapsedSeconds}
        isStopwatchRunning={isStopwatchRunning}
        onToggleStopwatch={() => setIsStopwatchRunning((prev) => !prev)}
        onResetStopwatch={() => {
          setElapsedSeconds(0);
          setIsStopwatchRunning(false);
        }}
        onOpenExercisePicker={handleOpenQuickStartExercisePicker}
        onRemoveExercise={removeQuickStartExercise}
        onAddSet={handleAddSetToQuickStartExercise}
        onRemoveSet={handleRemoveSetFromQuickStartExercise}
        onUpdateSet={handleUpdateQuickStartSet}
        onFinishWorkout={handleFinishQuickStartWorkout}
        onCancelWorkout={resetQuickStartFlow}
        disableFinishWorkout={quickStartExercises.length === 0 || hasEmptyActiveSet(quickStartLogs)}
        finishBlockedMessage={finishBlockedMessage}
      />
    );
  }

 
  //QUICK START ADD EXERCISE PAGE
  if (builderStep === "quickStartExercisePicker") {
    return (
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Add Exercise</h1>
          <p>
            Choose a body zone or search for exercises to add to your Quick Start workout.
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "18px" }}>
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
              <input
                type="text"
                placeholder="Search exercises"
                value={quickStartSearch}
                onChange={(e) => setQuickStartSearch(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={fixedExercisePickerBoxStyle}>
              {loadingExercises ? (
                <p>Loading exercises...</p>
              ) : quickStartZoneExercises.length === 0 ? (
                <p>No exercises found in this body zone.</p>
              ) : (
                <div style={{ display: "grid", gap: "10px" }}>
                  {quickStartZoneExercises.map((exercise) => {
                    const alreadyAdded = quickStartExercises.some(
                      (item) =>
                        item.exerciseId ===
                        (exercise._id || exercise.id || exercise.datasetId || exercise.name)
                    );

                    return (
                      <div
                        key={exercise._id || exercise.id || exercise.datasetId || exercise.name}
                        style={{
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                          padding: "12px",
                          background: "var(--social-bg)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "10px",
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <h3 style={{ margin: "0 0 8px 0", wordBreak: "break-word" }}>
                              {exercise.name}
                            </h3>
                            <p style={{ margin: "0 0 4px 0" }}>
                              <strong>Body Area:</strong> {exercise.bodyPart || "N/A"}
                            </p>
                            <p style={{ margin: 0 }}>
                              <strong>Equipment:</strong> {exercise.equipment || "N/A"}
                            </p>
                          </div>

                          <Button
                            label={alreadyAdded ? "Added" : "Add"}
                            variant="primary"
                            onClick={() => addExerciseToQuickStart(exercise)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                label="Cancel"
                variant="danger"
                onClick={() => setBuilderStep("quickStartBuilder")}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  //QUICK START FINISH QUESTION PAGE
  if (builderStep === "quickStartFinishQuestion") {
    return (
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div>
          <h1>Workout Finished</h1>
          <p>
            Your Quick Start workout was saved to Workout History. Do you also want
            to save it as a workout plan?
          </p>
        </div>

        <div style={sectionStyle}>
          <div style={{ display: "grid", gap: "18px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                label="Yes, Save as Plan"
                variant="primary"
                onClick={() => {
                  void handleSaveQuickStartAsPlan();
                }}
              />
              <Button
                label="No, Finish"
                variant="secondary"
                onClick={finishQuickStartAndReturn}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  //NORMAL PAGE VIEW (Including Saved Page, Quick Start Page, and Browse Page)
  return (
    <div
      style={{
        ...shellStyle,
      }}
    >
      <div>
        <h1 style={headingStyle}> Workout</h1>

      </div>
            <Button
              label = "Start an Empty Workout"
              onClick={handleStartBlankQuickStart}
            />

        <SavedTemplates
          filteredSavedWorkouts={filteredSavedWorkouts}
          onCreateTemplate={handleCreateNewWorkout}
          onStartWorkout={handleStartWorkout}
          onDeleteWorkoutPlan={(workoutId) => {
            void handleDeleteWorkoutPlan(workoutId);
          }}
        />

    </div>
  );
};

export default Workout;
