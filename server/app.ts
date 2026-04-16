import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import exerciseRoutes from "./routes/exercise.js";
import workoutRoutes from "./routes/workouts.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  app.use("/api/exercises", exerciseRoutes);
  app.use("/api/workouts", workoutRoutes);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, message: "Server is running" });
  });

  return app;
}
