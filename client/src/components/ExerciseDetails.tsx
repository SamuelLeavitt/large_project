import type { Exercise } from "../utils/workoutTypes";

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
}
const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const ExerciseDetailModal = ({ exercise, onClose }: ExerciseDetailModalProps) => (
  <div className="ex-lib-overlay" onClick={onClose}>
    <div className="ex-lib-modal" onClick={(e) => e.stopPropagation()}>

      <div className="ex-lib-modal__header">
        <h3 className="ex-lib-modal__title">{exercise.name}</h3>
        <button
          className="ex-lib-modal__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
        {exercise.level    && <span className="ex-lib-chip">{exercise.level}</span>}
        {exercise.category && <span className="ex-lib-chip">{exercise.category}</span>}
        {exercise.force    && <span className="ex-lib-chip">{exercise.force}</span>}
      </div>

      {/* information modal */}
      <div className="ex-lib-modal__info">
        <div>
          <p className="ex-lib-modal__info-label">Equipment</p>
          <p className="ex-lib-modal__info-value">{Cap(exercise.equipment ?? "")}</p>
        </div>
        <div>
          <p className="ex-lib-modal__info-label">Primary Muscles</p>
          <p className="ex-lib-modal__info-value">
            {Cap(exercise.primaryMuscles!.join(", ")) || "—"}
          </p>
        </div>
        {exercise.secondaryMuscles!.length > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p className="ex-lib-modal__info-label">Secondary Muscles</p>
            <p className="ex-lib-modal__info-value">
              {exercise.secondaryMuscles!.map(Cap).join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* instructions */}
      {exercise.instructions!.length > 0 && (
        <>
          <p className="ex-lib-modal__steps-label">Instructions</p>
          <ol className="ex-lib-modal__steps">
            {exercise.instructions!.map((step, i) => (
              <li key={i} className="ex-lib-modal__step">
                <span className="ex-lib-modal__step-num">{i + 1}</span>
                <span className="ex-lib-modal__step-text">{step}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  </div>
);

export default ExerciseDetailModal;
