const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

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

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      passwordHash: hashed,
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully.",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: "Username or email already exists." });
    }
    if (error?.name === "ValidationError") {
      return res.status(400).json({ error: "Invalid registration data." });
    }

    console.error("Register error:", error?.message || error);
    return res.status(500).json({ error: "Server error during registration." });
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
      // Legacy non-bcrypt password stored; replace with bcrypt hash
      user.passwordHash = await bcrypt.hash(password, 10);
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
  } catch (error) {
    console.error("Login error:", error?.message || error);
    return res.status(500).json({ error: "Server error during login." });
  }
});

router.post("/logout", (req, res) => {
  return res.json({ message: "Logout handled client-side by removing the token." });
});

module.exports = router;
