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
    <div className="wc-tooltip">
      <p className="wc-tooltip__date">{formatDateShort(workout.date)}</p>
      <p className="wc-tooltip__main">
        {metric === "maxWeight"
          ? `Peak: ${maxWeight} lbs`
          : `Volume: ${volume.toLocaleString()} lbs`}
      </p>
      <div className="wc-tooltip__divider" />
      <div className="wc-tooltip__sets">
        {workout.sets.map((s: any, i: number) => (
          <p key={i} className="wc-tooltip__set">
            <span className="wc-tooltip__set-num">#{i + 1}</span>
            {s.weight} lbs × {s.reps} reps
          </p>
        ))}
      </div>
    </div>
  );
}

// displays line chart to show progress over time for a selected exercise, with toggle to switch between max weight vs total volume lifted
export default function WorkoutChart({ data }: Props) {
  const [metric, setMetric] = useState<Metric>("maxWeight");

  const chartData = data
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((w) => ({
      date: formatDateShort(w.date),
      maxWeight: getMaxWeight(w),
      volume: getTotalVolume(w),
      workout: w,
    }));

  return (
    <div className="wc-root">
      <div className="wc-header">
        <div className="wc-header__left">
        </div>
        <div className="wc-toggle">
          {METRICS.map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`wc-toggle__btn${metric === m ? " wc-toggle__btn--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="wc-chart-wrap">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--text)", opacity: 0.55 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              width={64}
              tick={{ fontSize: 12, fill: "var(--text)", opacity: 0.55 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip metric={metric} />} cursor={{ stroke: "var(--accent-border)", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="var(--accent)"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "var(--accent)", stroke: "var(--accent-bg)", strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}