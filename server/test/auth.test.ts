import request from "supertest";
import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import User from "../models/User.js";

const app = createApp();

describe("auth routes", () => {
  it("GET /api/health returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("registers a user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "tester",
      email: "tester@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/registered/i);

    const user = await User.findOne({ email: "tester@example.com" });
    expect(user).toBeTruthy();
    expect(user?.themePreference).toBe("light");
  });

  it("logs in a verified user", async () => {
    const user = new User({
      username: "verifieduser",
      email: "verified@example.com",
      passwordHash: "secret123",
      isEmailVerified: true,
      themePreference: "light",
    });
    await user.save();

    const res = await request(app).post("/api/auth/login").send({
      email: "verified@example.com",
      password: "secret123",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("verified@example.com");
  });

  it("requires auth for /me", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns current user for /me with bearer token", async () => {
    const user = new User({
      username: "meuser",
      email: "me@example.com",
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

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("meuser");
  });
});
