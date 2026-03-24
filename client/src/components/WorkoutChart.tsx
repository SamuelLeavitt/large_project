import type { Workout } from "../utils/workoutData.tsx";
import { getMaxWeight, getTotalVolume } from "../utils/workoutData.tsx";
import { formatDateShort } from "../utils/formatters.ts";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useState } from "react";
import "..//App.css";

interface Props {
  data: Workout[];
  exercise: string;
}

type Metric = "maxWeight" | "volume";

const METRICS: [Metric, string][] = [
  ["maxWeight", "Max Weight"],
  ["volume", "Volume"],
];

// shows all sets for a given workout when hovering over a point on the chart
function CustomTooltip({ active, payload, metric }: any) {
  if (!active || !payload?.length) return null;
  const { workout, maxWeight, volume } = payload[0].payload;
  return (
    <div className="workout-tooltip">
      <p className="workout-tooltip__date">{formatDateShort(workout.date)}</p>
      <p className="workout-tooltip__main">
        {metric === "maxWeight" ? `Peak: ${maxWeight} lbs` : `Volume: ${volume.toLocaleString()} lbs`}
      </p>
      <hr className="workout-tooltip__divider" />
      {workout.sets.map((s: any, i: number) => (
        <p key={i} className="workout-tooltip__set">
          Set {i + 1}: {s.weight} lbs × {s.reps} reps
        </p>
      ))}
    </div>
  );
}

// displays line chart to show progress over time for a selected exercise, with toggle to switch between max weight vs total volume lifted
export default function WorkoutChart({ data, exercise }: Props) {
  const [metric, setMetric] = useState<Metric>("maxWeight");

  const chartData = data.map((w) => ({
    date: formatDateShort(w.date),
    maxWeight: getMaxWeight(w),
    volume: getTotalVolume(w),
    workout: w,
  }));

  return (
    <div className="workout-chart">
      <div className="workout-chart__header">
        <div>
          <h2>{exercise}</h2>
            <p className="workout-chart__hint">Hover over a point to see all sets</p>
            <br />
        </div>
        <div className="workout-chart__toggle">
          {METRICS.map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`workout-chart__toggle-btn ${metric === m ? "active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <br />
      <ResponsiveContainer width="90%" height={300}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis width={70} />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          <Line type="linear" dataKey={metric} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
