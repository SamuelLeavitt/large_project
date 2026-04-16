import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import User from "../models/User.js";

const app = createApp();

async function makeAuth() {
  const user = new User({
    username: "workoutuser",
    email: "workout@example.com",
    passwordHash: "secret123",
    isEmailVerified: true,
    themePreference: "light",
  });
  await user.save();

  const token = jwt.sign(
    { userId: String(user._id), email: user.email },
    process.env.JWT_SECRET || "test_jwt_secret",
    { expiresIn: "1h" }
  );

  return { user, token };
}

describe("workout routes", () => {
  it("requires auth for templates", async () => {
    const res = await request(app).get("/api/workouts/templates");
    expect(res.status).toBe(401);
  });

  it("creates and lists templates", async () => {
    const { token } = await makeAuth();

    const createRes = await request(app)
      .post("/api/workouts/templates")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Push Day",
        bodyPart: "Chest",
        exercises: [
          {
            exerciseId: "bench-1",
            name: "Bench Press",
            category: "strength",
            bodyPart: "Chest",
            sets: 3,
            reps: "10",
          },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.item.name).toBe("Push Day");

    const listRes = await request(app)
      .get("/api/workouts/templates")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.items.length).toBe(1);
  });

  it("creates and lists sessions", async () => {
    const { token } = await makeAuth();

    const createRes = await request(app)
      .post("/api/workouts/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        workoutName: "Morning Lift",
        sourceType: "quickStart",
        durationSeconds: 1200,
        exercises: [
          {
            exerciseId: "bench-1",
            name: "Bench Press",
            sets: [{ weight: 135, reps: 8 }],
          },
        ],
      });

    expect(createRes.status).toBe(201);

    const listRes = await request(app)
      .get("/api/workouts/sessions")
      .set("Authorization", `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.items.length).toBe(1);
    expect(listRes.body.items[0].workoutName).toBe("Morning Lift");
  });
});
