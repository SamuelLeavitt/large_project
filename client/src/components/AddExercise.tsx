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
            <select
              value={selectedZone}
              onChange={(e) => onSelectZone(e.target.value)}
              style={{
                padding: "10px 36px 10px 16px",
                borderRadius: "999px",
                border: "1.5px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text-h)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                minWidth: "200px",
              }}
            >
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {Cap(zone)}
                </option>
              ))}
            </select>
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
                          variant="secondary"
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