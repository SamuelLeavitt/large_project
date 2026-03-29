import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const rawUsername = String(req.body?.username ?? "");
    const rawEmail = String(req.body?.email ?? "");
    const rawPassword = String(req.body?.password ?? "");

    const username = rawUsername.trim();
    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ error: "Username or email already exists." });
    }

    const user = new User({
      username,
      email,
      passwordHash: password,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    console.error("Register error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email ?? "");
    const rawPassword = String(req.body?.password ?? "");

    const email = rawEmail.trim().toLowerCase();
    const password = rawPassword;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Upgrade legacy plain-text password rows to bcrypt hash after successful login.
    if (typeof user.passwordHash === "string" && !user.passwordHash.startsWith("$2")) {
      user.passwordHash = password;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    console.error("Login error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", (req, res) => {
  return res.json({ message: "Logout handled client-side by removing the token." });
});

export default router;
