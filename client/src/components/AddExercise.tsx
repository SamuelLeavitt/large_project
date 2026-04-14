import Button from "./Button";
import LoadingState from "./LoadingState";
import type { Exercise } from "../utils/workoutTypes";
import { useState } from "react";
import ExerciseDetailModal from "./ExerciseDetails";
import MuscleMapFront from "./MuscleMapFront";
import MuscleMapBack from "./MuscleMapBack";

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
  extraActions?: React.ReactNode;
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
  extraActions,
}: AddExerciseProps) => {
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [showMap, setShowMap] = useState(false);
  const handleZonePick = (zone: string) => {             // ← new
    onSelectZone(zone);
    setShowMap(false);
  };
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
                minWidth: "150px",
              }}
            >
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {Cap(zone)}
                </option>
              ))}
            </select>
            <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
              <Button
                label="Find a Muscle"
                variant="secondary"
                onClick={() => setShowMap(true)}
              />
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
            {extraActions}
          </div>
        </div>
      </div>
      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}   // prevent backdrop click from closing when clicking inside
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "24px",
              width: "min(500px, 90vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              display: "grid",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Pick a Muscle Group</h2>
              <Button label="Close" variant="secondary" onClick={() => setShowMap(false)} />
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Click a muscle to filter exercises.
            </p>

            <div style={{
              display: "flex",
              flexDirection: "row",
              gap: "20px",
              justifyContent: "center",
              alignItems: "flex-start"
            }}>
              <MuscleMapFront onZoneClick={handleZonePick} />  {/* closes on selection */}
              <MuscleMapBack onZoneClick={handleZonePick} />  {/* closes on selection */}
            </div>
            
          </div>
        </div>
      )}

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