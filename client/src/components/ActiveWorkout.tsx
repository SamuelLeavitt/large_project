import Button from "./Button";
import type {
  ActiveExerciseLog,
  SavedWorkout,
  WorkoutExercise,
} from "../utils/workoutTypes";

interface ActiveWorkoutProps {
  activeWorkout: SavedWorkout;
  activeExercise: WorkoutExercise;
  activeExerciseIndex: number;
  activeExerciseLog?: ActiveExerciseLog;
  weightInput: string;
  repsInput: string;
  onWeightInputChange: (value: string) => void;
  onRepsInputChange: (value: string) => void;
  onAddSet: () => void;
  onFinish: () => void;
  onPreviousExercise: () => void;
  onNextOrSave: () => void;
  isLastExercise: boolean;
  elapsedSeconds: number;
  isStopwatchRunning: boolean;
  onToggleStopwatch: () => void;
  onResetStopwatch: () => void;
}

interface QuickStartWorkoutBuilderProps {
  quickStartName: string;
  onQuickStartNameChange: (value: string) => void;
  quickStartNameEditable?: boolean;
  quickStartExercises: WorkoutExercise[];
  quickStartLogs: ActiveExerciseLog[];
  elapsedSeconds: number;
  isStopwatchRunning: boolean;
  onToggleStopwatch: () => void;
  onResetStopwatch: () => void;
  onOpenExercisePicker?: () => void;
  onRemoveExercise?: (index: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet?: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (
    exerciseIndex: number,
    setIndex: number,
    field: "weight" | "reps",
    value: string
  ) => void;
  onFinishWorkout: () => void;
  onCancelWorkout: () => void;
  disableFinishWorkout?: boolean;
  finishBlockedMessage?: string;
}

const formatStopwatch = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const ActiveWorkout = ({
  activeWorkout,
  activeExercise,
  activeExerciseIndex,
  activeExerciseLog,
  weightInput,
  repsInput,
  onWeightInputChange,
  onRepsInputChange,
  onAddSet,
  onFinish,
  onPreviousExercise,
  onNextOrSave,
  isLastExercise,
  elapsedSeconds,
  isStopwatchRunning,
  onToggleStopwatch,
  onResetStopwatch,
}: ActiveWorkoutProps) => {
  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "24px",
        display: "grid",
        gap: "22px",
      }}
    >
      <div
        style={{
          background: "#f8fbff",
          border: "1px solid #d8e5f2",
          borderRadius: "18px",
          padding: "20px",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          textAlign: "left",
          minHeight: "120px",
          maxHeight: "160px",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "48px", lineHeight: 1.05, wordBreak: "break-word" }}>
              {activeWorkout.name}
            </h1>
            <p style={{ marginTop: "12px", color: "#5b6778" }}>
              Exercise {activeExerciseIndex + 1} of {activeWorkout.exercises.length}
            </p>
          </div>

          <Button
            label="Finish"
            variant="primary"
            onClick={onFinish}
          />
        </div>
      </div>

      <div
        style={{
          background: "#f8fbff",
          border: "1px solid #d8e5f2",
          borderRadius: "18px",
          padding: "20px",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          textAlign: "left",
        }}
      >
        <h2>{activeExercise.name}</h2>
        <p>
          <strong>Target:</strong> {activeExercise.sets} sets x {activeExercise.reps} reps
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
              onChange={(e) => onWeightInputChange(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #c8d7e6",
                background: "#ffffff",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px" }}>Reps</label>
            <input
              type="number"
              placeholder="Enter reps"
              value={repsInput}
              onChange={(e) => onRepsInputChange(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid #c8d7e6",
                background: "#ffffff",
                color: "#0f172a",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <Button
            label="Add Set"
            variant="primary"
            onClick={onAddSet}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Logged Sets</h3>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "12px",
              background: "var(--bg)",
              minHeight: "180px",
              maxHeight: "240px",
              overflowY: "auto",
              marginTop: "12px",
            }}
          >
            {!activeExerciseLog || activeExerciseLog.sets.length === 0 ? (
              <p style={{ margin: 0 }}>No sets logged yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {activeExerciseLog.sets.map((set, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1px solid #d6e4f2",
                      background: "#ffffff",
                    }}
                  >
                    Set {index + 1}: {set.weight} lbs x {set.reps} reps
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-[18px] border border-[#d8e5f2] bg-[#f8fbff] p-5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <h2 className="m-0">Stopwatch</h2>
        <p className="m-0 text-4xl font-bold leading-none text-[#2e9be8]">
          {formatStopwatch(elapsedSeconds)}
        </p>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-[var(--accent-border)] bg-[var(--accent)] px-5 py-2.5 font-bold text-[var(--bg)] transition"
          onClick={onToggleStopwatch}
        >
          {isStopwatchRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--social-bg)] px-5 py-2.5 font-bold text-[var(--text)] transition"
          onClick={onResetStopwatch}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          background: "#f8fbff",
          border: "1px solid #d8e5f2",
          borderRadius: "18px",
          padding: "20px",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          textAlign: "left",
        }}
      >
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
            onClick={onPreviousExercise}
            disabled={activeExerciseIndex === 0}
          />

          <Button
            label={isLastExercise ? "Save" : "Next Exercise"}
            variant="primary"
            onClick={onNextOrSave}
          />
        </div>
      </div>
    </div>
  );
};

export const QuickStartWorkoutBuilder = ({
  quickStartName,
  onQuickStartNameChange,
  quickStartNameEditable = true,
  quickStartExercises,
  quickStartLogs,
  elapsedSeconds,
  isStopwatchRunning,
  onToggleStopwatch,
  onResetStopwatch,
  onOpenExercisePicker,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onFinishWorkout,
  onCancelWorkout,
  disableFinishWorkout = false,
  finishBlockedMessage,
}: QuickStartWorkoutBuilderProps) => {
  const quickStartCardClassName =
    "w-full rounded-[18px] border border-[#d8e5f2] bg-[#f8fbff] p-5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)]";

  return (
    <div className="mx-auto grid w-full max-w-[980px] justify-items-stretch gap-6 p-6">
      <div className={quickStartCardClassName}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
          Workout Name
        </label>
        <input
          type="text"
          placeholder="Quick Start Workout"
          value={quickStartName}
          readOnly={!quickStartNameEditable}
          onChange={(e) => onQuickStartNameChange(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #c8d7e6",
            background: "#ffffff",
            color: "#0f172a",
            boxSizing: "border-box",
            cursor: quickStartNameEditable ? "text" : "default",
          }}
        />
      </div>

      <div className={`${quickStartCardClassName} flex flex-wrap items-center gap-2`}>
        <h2 className="m-0">Stopwatch</h2>
        <p style={{ fontSize: "32px", fontWeight: 700, margin: "10px 0 18px 0", color: "#2e9be8" }}>
          {formatStopwatch(elapsedSeconds)}
        </p>

        <div className="flex flex-wrap gap-[10px]">
          <Button
            label={isStopwatchRunning ? "Pause" : "Start"}
            variant="primary"
            onClick={onToggleStopwatch}
          />
          <Button label="Reset" variant="secondary" onClick={onResetStopwatch} />
        </div>
      </div>

      <div className={quickStartCardClassName}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "14px",
          }}
        >
          <h2 style={{ margin: 0 }}>Exercises</h2>
          {onOpenExercisePicker ? (
            <Button label="Add Exercise" variant="primary" onClick={onOpenExercisePicker} />
          ) : null}
        </div>

        {quickStartExercises.length === 0 ? (
          <p style={{ margin: 0 }}>No exercises added yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {quickStartExercises.map((exercise, index) => {
              const completedSets = quickStartLogs[index]?.sets.length || 0;
              const loggedSets = quickStartLogs[index]?.sets ?? [];

              return (
                <div
                  key={`${exercise.exerciseId}-${index}`}
                  style={{
                    border: "1px solid #d8e5f2",
                    borderRadius: "14px",
                    padding: "16px",
                    background: "#ffffff",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ margin: "0 0 8px 0", wordBreak: "break-word" }}>
                        {exercise.name}
                      </h3>

                    </div>

                    {onRemoveExercise ? (
                      <Button label="Remove" variant="danger" onClick={() => onRemoveExercise(index)} />
                    ) : null}
                  </div>

                  <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #d8e5f2" }}>
                    <div style={{ display: "grid", gap: "10px" }}>
                      {loggedSets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "64px 1fr 1fr auto",
                            gap: "12px",
                            alignItems: "center",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1px solid #d8e5f2",
                            background: "#f8fbff",
                          }}
                        >
                          <strong>#{setIndex + 1}</strong>
                          <input
                            type="number"
                            placeholder="lbs"
                            value={set.weight === 0 ? "" : set.weight}
                            onChange={(e) => onUpdateSet(index, setIndex, "weight", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "10px",
                              border: "1px solid #c8d7e6",
                              background: "#ffffff",
                              color: "#0f172a",
                              boxSizing: "border-box",
                            }}
                          />
                          <input
                            type="number"
                            placeholder="reps"
                            value={set.reps === 0 ? "" : set.reps}
                            onChange={(e) => onUpdateSet(index, setIndex, "reps", e.target.value)}
                            style={{
                              width: "100%",
                              padding: "10px",
                              borderRadius: "10px",
                              border: "1px solid #c8d7e6",
                              background: "#ffffff",
                              color: "#0f172a",
                              boxSizing: "border-box",
                            }}
                          />
                          {onRemoveSet ? (
                            <Button
                              label="Delete"
                              variant="danger"
                              onClick={() => onRemoveSet(index, setIndex)}
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: "12px" }}>
                      <Button label="+ Add Set" variant="secondary" onClick={() => onAddSet(index)} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={quickStartCardClassName}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button
              label="Finish Workout"
              variant="primary"
              onClick={onFinishWorkout}
              disabled={quickStartExercises.length === 0 || disableFinishWorkout}
            />
            <Button label="Cancel" variant="secondary" onClick={onCancelWorkout} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default ActiveWorkout;