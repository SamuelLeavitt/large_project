import Button from "./Button";
import LoadingState from "./LoadingState";
import type { Exercise } from "../utils/workoutTypes";
import { useState } from "react";
import ExerciseDetailModal from "./ExerciseDetails";

const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const sectionStyle: React.CSSProperties = {
  background: "var(--social-bg)",
  border: "1px solid var(--border)",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  textAlign: "left",
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

interface AddExerciseProps {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  loadingExercises: boolean;
  exercises: Exercise[];
  zoneOptions: string[];
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  isExerciseAlreadyAdded: (exercise: Exercise) => boolean;
  onAddExercise: (exercise: Exercise) => void;
  onCancel: () => void;
  cancelLabel: string;
  cancelVariant?: "secondary" | "danger" | "primary";
}

const AddExercise = ({
  title,
  description,
  searchValue,
  onSearchChange,
  loadingExercises,
  exercises,
  zoneOptions,
  selectedZone,
  onSelectZone,
  isExerciseAlreadyAdded,
  onAddExercise,
  onCancel,
  cancelLabel,
  cancelVariant = "secondary",
}: AddExerciseProps) => {
  const [selected, setSelected] = useState<Exercise | null>(null);
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
        <h1>{title}</h1>
        <p>{description}</p>
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
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: selectedZone === zone ? "1px solid #9ccbf3" : "1px solid var(--border)",
                    background: selectedZone === zone ? "#dff0ff" : "var(--social-bg)",
                    color: selectedZone === zone ? "#2b95e8" : "var(--text)",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                  onClick={() => onSelectZone(zone)}
                >
                  {Cap(zone)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Search exercises"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={fixedExercisePickerBoxStyle}>
            {loadingExercises ? (
              <LoadingState
                title="Loading exercises"
                description="Fetching the latest list for this body zone."
                minHeight="300px"
              />
            ) : exercises.length === 0 ? (
              <p>No exercises found in this body zone.</p>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {exercises.map((exercise) => {
                  const exerciseId = exercise._id || exercise.id || exercise.datasetId || exercise.name;
                  const alreadyAdded = isExerciseAlreadyAdded(exercise);

                  return (
                    <div
                      key={exerciseId}
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
                            <strong>Body Zone:</strong> {exercise.primaryMuscles?.length ? Cap(exercise.primaryMuscles.join(", ")) : "N/A"}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Equipment:</strong> {exercise.equipment ? Cap(exercise.equipment) : "N/A"}
                          </p>
                        </div>
                        <Button
                          label="Details"
                          variant="secondary"
                          onClick={() => setSelected(exercise)}
                        />
                        <Button
                          label={alreadyAdded ? "Added" : "Add"}
                          variant="primary"
                          onClick={() => onAddExercise(exercise)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Button label={cancelLabel} variant={cancelVariant} onClick={onCancel} />
          </div>
        </div>
      </div>
      {selected && (
        <ExerciseDetailModal
          exercise={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

export default AddExercise;