import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import WorkoutSession from "../models/WorkoutSession.js";

const router = express.Router();

type WorkoutSetPayload = {
  weight: number;
  reps: number;
};

type WorkoutSessionPayload = {
  workoutName?: string;
  sourceType?: "quickStart" | "template";
  templateId?: string | null;
  templateName?: string;
  completedAt?: string;
  durationSeconds?: number;
  exercises?: Array<{
    exerciseId?: string;
    name?: string;
    sets?: WorkoutSetPayload[];
  }>;
};

function getUserId(req: Request): mongoose.Types.ObjectId | null {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret_change_me") as {
      userId?: string;
    };

    if (!payload.userId || !mongoose.isValidObjectId(payload.userId)) {
      return null;
    }

    return new mongoose.Types.ObjectId(payload.userId);
  } catch {
    return null;
  }
}

router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const filter = userId ? { userId } : {};

    const sessions = await WorkoutSession.find(filter)
      .sort({ completedAt: -1, createdAt: -1 })
      .lean();

    res.json({ items: sessions });
  } catch (error) {
    console.error("Failed to load workout sessions:", error);
    res.status(500).json({ message: "Failed to load workout sessions" });
  }
});

router.post("/sessions", async (req: Request, res: Response) => {
  try {
    const body = req.body as WorkoutSessionPayload;
    const workoutName = String(body?.workoutName ?? "").trim();
    const exercises = Array.isArray(body?.exercises) ? body.exercises : [];

    if (!workoutName) {
      return res.status(400).json({ message: "Workout name is required." });
    }

    const normalizedExercises = exercises
      .map((exercise) => ({
        exerciseId: String(exercise?.exerciseId ?? "").trim(),
        name: String(exercise?.name ?? "").trim(),
        sets: Array.isArray(exercise?.sets)
          ? exercise.sets.map((set) => ({
              weight: Number(set?.weight) || 0,
              reps: Number(set?.reps) || 0,
            }))
          : [],
      }))
      .filter((exercise) => exercise.exerciseId && exercise.name);

    const session = await WorkoutSession.create({
      userId: getUserId(req),
      workoutName,
      sourceType: body?.sourceType === "template" ? "template" : "quickStart",
      templateId: body?.templateId ? String(body.templateId).trim() : null,
      templateName: body?.templateName ? String(body.templateName).trim() : "",
      completedAt: body?.completedAt ? new Date(body.completedAt) : new Date(),
      durationSeconds: Number(body?.durationSeconds) || 0,
      exercises: normalizedExercises,
    });

    res.status(201).json({ message: "Workout session saved.", session });
  } catch (error) {
    console.error("Failed to save workout session:", error);
    res.status(500).json({ message: "Failed to save workout session" });
  }
});

export default router;