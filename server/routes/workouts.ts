import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import WorkoutSession from "../models/WorkoutSession.js";
import WorkoutTemplate from "../models/WorkoutTemplate.js";

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

type WorkoutTemplateExercisePayload = {
  exerciseId?: string;
  name?: string;
  category?: string;
  bodyPart?: string;
  sets?: number;
  reps?: string;
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

function requireUserId(req: Request, res: Response): mongoose.Types.ObjectId | null {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({ message: "Authentication required." });
    return null;
  }

  return userId;
}

router.get("/sessions", async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

    const sessions = await WorkoutSession.find({ userId })
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
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

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
      userId,
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

router.get("/templates", async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

    const templates = await WorkoutTemplate.find({ userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const items = templates.map((template) => ({
      id: String(template._id),
      name: template.name,
      bodyPart: template.bodyPart,
      createdAt:
        template.createdAt instanceof Date
          ? template.createdAt.toISOString()
          : new Date().toISOString(),
      exercises: template.exercises,
    }));

    res.json({ items });
  } catch (error) {
    console.error("Failed to load workout templates:", error);
    res.status(500).json({ message: "Failed to load workout templates" });
  }
});

router.post("/templates", async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

    const name = String(req.body?.name ?? "").trim();
    const bodyPart = String(req.body?.bodyPart ?? "Custom").trim() || "Custom";
    const exercises = Array.isArray(req.body?.exercises) ? req.body.exercises : [];

    if (!name) {
      return res.status(400).json({ message: "Workout name is required." });
    }

    const normalizedExercises = exercises
      .map((exercise: WorkoutTemplateExercisePayload) => ({
        exerciseId: String(exercise?.exerciseId ?? "").trim(),
        name: String(exercise?.name ?? "").trim(),
        category: String(exercise?.category ?? "").trim(),
        bodyPart: String(exercise?.bodyPart ?? "").trim(),
        sets: Math.max(0, Number(exercise?.sets) || 0),
        reps: String(exercise?.reps ?? "0").trim() || "0",
      }))
      .filter((exercise: WorkoutTemplateExercisePayload) => exercise.exerciseId && exercise.name);

    const created = await WorkoutTemplate.create({
      userId,
      name,
      bodyPart,
      exercises: normalizedExercises,
    });

    res.status(201).json({
      item: {
        id: String(created._id),
        name: created.name,
        bodyPart: created.bodyPart,
        createdAt: created.createdAt instanceof Date ? created.createdAt.toISOString() : new Date().toISOString(),
        exercises: created.exercises,
      },
    });
  } catch (error) {
    console.error("Failed to create workout template:", error);
    res.status(500).json({ message: "Failed to create workout template" });
  }
});

router.put("/templates/:id", async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

    const id = String(req.params.id || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid template id." });
    }

    const name = String(req.body?.name ?? "").trim();
    const bodyPart = String(req.body?.bodyPart ?? "Custom").trim() || "Custom";
    const exercises = Array.isArray(req.body?.exercises) ? req.body.exercises : [];

    if (!name) {
      return res.status(400).json({ message: "Workout name is required." });
    }

    const normalizedExercises = exercises
      .map((exercise: WorkoutTemplateExercisePayload) => ({
        exerciseId: String(exercise?.exerciseId ?? "").trim(),
        name: String(exercise?.name ?? "").trim(),
        category: String(exercise?.category ?? "").trim(),
        bodyPart: String(exercise?.bodyPart ?? "").trim(),
        sets: Math.max(0, Number(exercise?.sets) || 0),
        reps: String(exercise?.reps ?? "0").trim() || "0",
      }))
      .filter((exercise: WorkoutTemplateExercisePayload) => exercise.exerciseId && exercise.name);

    const updated = await WorkoutTemplate.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          name,
          bodyPart,
          exercises: normalizedExercises,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Template not found." });
    }

    return res.json({
      item: {
        id: String(updated._id),
        name: updated.name,
        bodyPart: updated.bodyPart,
        createdAt:
          updated.createdAt instanceof Date
            ? updated.createdAt.toISOString()
            : new Date().toISOString(),
        exercises: updated.exercises,
      },
    });
  } catch (error) {
    console.error("Failed to update workout template:", error);
    return res.status(500).json({ message: "Failed to update workout template" });
  }
});

router.delete("/templates/:id", async (req: Request, res: Response) => {
  try {
    const userId = requireUserId(req, res);

    if (!userId) {
      return;
    }

    const id = String(req.params.id || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid template id." });
    }

    const deleted = await WorkoutTemplate.findOneAndDelete({ _id: id, userId }).lean();

    if (!deleted) {
      return res.status(404).json({ message: "Template not found." });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete workout template:", error);
    return res.status(500).json({ message: "Failed to delete workout template" });
  }
});

export default router;