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

  if (!sessions.length)
    return (
      <div className="wl-empty">
        <span className="wl-empty__icon">🏋️</span>
        <p>No sessions logged yet.</p>
      </div>
    );

  return (
    <div className="wl-root">
      <h2 className="wl-heading">Session Log</h2>
      <div className="wl-sessions">
        {sessions.map((session, idx) => {
          const isOpen = expanded.has(session.sessionKey);
          const totalSets = session.workouts.reduce((acc, w) => acc + w.sets.length, 0);
          const exerciseCount = session.workouts.length;

          return (
            <div
              key={session.sessionKey}
              className={`wl-card${isOpen ? " wl-card--open" : ""}`}
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* session header row */}
              <button
                className="wl-card__header"
                onClick={() => toggle(session.sessionKey)}
              >
                <div className="wl-card__header-left">
                  <span className="wl-card__date">
                    {formatDateFull(session.date)}
                  </span>
                  <span className="wl-card__time">
                    {formatTime(session.time)}
                  </span>
                </div>

                <div className="wl-card__header-right">
                  <span className="wl-card__pill">{exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}</span>
                  <span className="wl-card__pill">{totalSets} set{totalSets !== 1 ? "s" : ""}</span>
                  <span className={`wl-card__chevron${isOpen ? " wl-card__chevron--open" : ""}`}>
                    ›
                  </span>
                </div>
              </button>

              {/* expanded body */}
              {isOpen && (
                <div className="wl-card__body">
                  {session.workouts.map((w, i) => (
                    <div key={`${w.exercise}-${i}`} className="wl-exercise">
                      <div className="wl-exercise__header">
                        <span className="wl-exercise__name">{w.exercise}</span>
                        <span className="wl-exercise__count">{w.sets.length} sets</span>
                      </div>
                      <div className="wl-exercise__sets">
                        {w.sets.map((s, j) => (
                          <span key={j} className="wl-set-chip">
                            <span className="wl-set-chip__num">#{j + 1}</span>
                            {s.weight} lbs × {s.reps} reps
                          </span>
                        ))}
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
