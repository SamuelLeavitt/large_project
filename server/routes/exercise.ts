import express, { Request, Response } from "express";
import Exercise from "../models/Exercise.js";

const router = express.Router();

/**
 * GET /api/exercises/meta/filters
 * Returns distinct values for frontend filter dropdowns
 */
router.get("/meta/filters", async (_req: Request, res: Response) => {
  try {
    const [categories, equipment, levels, primaryMuscles] = await Promise.all([
      Exercise.distinct("category"),
      Exercise.distinct("equipment"),
      Exercise.distinct("level"),
      Exercise.distinct("primaryMuscles"),
    ]);

    res.json({
      categories: categories.filter(Boolean).sort(),
      equipment: equipment.filter(Boolean).sort(),
      levels: levels.filter(Boolean).sort(),
      primaryMuscles: primaryMuscles.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error("Failed to load exercise filters:", error);
    res.status(500).json({ message: "Failed to load exercise filters" });
  }
});

/**
 * GET /api/exercises
 * Query params:
 * - search
 * - category
 * - equipment
 * - muscle
 * - level
 * - page
 * - limit
 * - sort=name|createdAt
 * - order=asc|desc
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      equipment,
      muscle,
      level,
      page = "1",
      limit = "20",
      sort = "name",
      order = "asc",
    } = req.query;

    const filter: Record<string, any> = {};

    if (category) filter.category = String(category);
    if (equipment) filter.equipment = String(equipment);
    if (muscle) filter.primaryMuscles = String(muscle);
    if (level) filter.level = String(level);

    if (search) {
      filter.name = { $regex: String(search), $options: "i" };
    }

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const allowedSorts = new Set(["name", "createdAt"]);
    const sortField = allowedSorts.has(String(sort)) ? String(sort) : "name";
    const sortOrder = String(order) === "desc" ? -1 : 1;

    let query = Exercise.find(filter).sort({ [sortField]: sortOrder });

    const [items, total] = await Promise.all([
      query.skip(skip).limit(limitNum).lean(),
      Exercise.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Failed to fetch exercises:", error);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
});

/**
 * GET /api/exercises/:id
 * Supports Mongo _id or datasetId
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const exercise = await Exercise.findOne({
      $or: [{ _id: id }, { datasetId: id }],
    }).lean();

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.json(exercise);
  } catch (error) {
    console.error("Failed to fetch exercise:", error);
    return res.status(500).json({ message: "Failed to fetch exercise" });
  }
});

export default router;
