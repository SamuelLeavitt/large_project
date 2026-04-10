import Button from "./Button";
import type { SavedWorkout } from "../utils/workoutTypes";

const sectionStyle: React.CSSProperties = {
  background: "#f8fbff",
  border: "1px solid #d8e5f2",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
  textAlign: "left",
};

const fixedSavedWorkoutsListStyle: React.CSSProperties = {
  minHeight: "420px",
  maxHeight: "420px",
  overflowY: "auto",
  paddingRight: "6px",
};

interface SavedTemplatesProps {
  filteredSavedWorkouts: SavedWorkout[];
  onCreateTemplate: () => void;
  onStartWorkout: (workout: SavedWorkout) => void;
  onDeleteWorkoutPlan: (workoutId: string) => void;
}

const SavedTemplates = ({
  filteredSavedWorkouts,
  onCreateTemplate,
  onStartWorkout,
  onDeleteWorkoutPlan,
}: SavedTemplatesProps) => {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      <div style={sectionStyle}>
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2>Saved Templates</h2>
          <Button label="Create Template" variant="primary" onClick={onCreateTemplate} />
        </div>

        {filteredSavedWorkouts.length === 0 ? (
          <p style={{ marginTop: "12px" }}>No saved templates yet.</p>
        ) : (
          <div style={{ ...fixedSavedWorkoutsListStyle, marginTop: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "14px" }}>
              {filteredSavedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  style={{
                    border: "1px solid #d1e1ef",
                    borderRadius: "16px",
                    padding: "14px",
                    background: "#ffffff",
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
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ margin: 0, wordBreak: "break-word" }}>{workout.name}</h3>
                      <p style={{ marginTop: "6px" }}>
                        <strong>Body Area:</strong> {workout.bodyPart}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <Button
                        label="Start Workout"
                        variant="primary"
                        onClick={() => onStartWorkout(workout)}
                      />
                      <Button
                        label="Delete"
                        variant="danger"
                        onClick={() => {
                          onDeleteWorkoutPlan(workout.id);
                        }}
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
                          background: "#f3f8fd",
                        }}
                      >
                        <strong>{exercise.name}</strong>
                        <p>{exercise.sets} sets</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedTemplates;