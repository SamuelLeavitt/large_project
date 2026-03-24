import type { Workout } from "../utils/workoutData";
import { formatDateFull, formatTime } from "../utils/formatters";
import { useState } from "react";
import "..//App.css";

interface Props {
  data: Workout[];
}

// represents a single workout session, which may contain multiple exercises with each collapsible to show/hide details
interface Session {
  date: string;
  time: string;
  sessionKey: string;
  workouts: Workout[];
}

// groups workouts by session (date + time) and sorts in reverse chronological order (recent first)
function groupBySessions(data: Workout[]): Session[] {
  const map = new Map<string, Workout[]>();
  for (const w of data) {
    const key = `${w.date}|${w.time}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(w);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, workouts]) => {
      const [date, time] = key.split("|");
      return { date, time, sessionKey: key, workouts };
    });
}

// displays list of all workout sessions
export default function WorkoutList({ data }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const sessions = groupBySessions(data);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (!sessions.length) return <p className="workout-list__empty">No sessions logged yet.</p>;

  return (
    <div className="workout-list">
      <h2>Session Log</h2>
      <div className="workout-list__sessions">
        {sessions.map((session) => {
          const isOpen = expanded.has(session.sessionKey);
          return (
            <div key={session.sessionKey} className="session-block">

              {/* collapsed row:  date and time only */}
              <button
                className="session-block__row"
                onClick={() => toggle(session.sessionKey)}
              >
                <span className="session-block__chevron">{isOpen ? "▾" : "▸"}</span>
                <span className="session-block__date">
                  {formatDateFull(session.date)} · {formatTime(session.time)}
                </span>
              </button>

              {/* expanded: exercise name with each set on its own line */}
              <br />
              {isOpen && (
                
                <div className="session-block__body">
                  {session.workouts.map((w, i) => (
                    <div key={`${w.exercise}-${i}`} className="session-block__exercise-preview">
                      <span className="session-block__exercise-name">{w.exercise}</span>
                      <div className="session-block__set-preview" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <br />
                        {w.sets.map((s, j) => (
                          <span key={j} className="session-block__set-chip">
                            {s.weight} lbs × {s.reps} reps
                          </span>
                        ))}
                        <br />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
