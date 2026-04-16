import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import Exercise from "../models/Exercise.js";

const app = createApp();

describe("exercise routes", () => {
  it("returns filter metadata", async () => {
    await Exercise.create({
      datasetId: "ex-1",
      name: "Bench Press",
      category: "strength",
      equipment: "barbell",
      level: "beginner",
      primaryMuscles: ["chest"],
    });

    const res = await request(app).get("/api/exercises/meta/filters");

    expect(res.status).toBe(200);
    expect(res.body.categories).toContain("strength");
    expect(res.body.equipment).toContain("barbell");
  });

  it("returns paginated exercises", async () => {
    await Exercise.create({
      datasetId: "ex-2",
      name: "Squat",
      category: "strength",
      equipment: "barbell",
      level: "intermediate",
      primaryMuscles: ["quadriceps"],
    });

    const res = await request(app).get("/api/exercises?page=1&limit=20");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.pagination.page).toBe(1);
  });
});
