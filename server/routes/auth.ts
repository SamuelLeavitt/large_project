import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendAuthEmail } from "../utils/mailer.js";

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("hex");
}

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
      isEmailVerified: false,
    });

    const verificationToken = createToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await user.save();

    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;

    await sendAuthEmail({
      to: email,
      subject: "Verify your email",
      text: `Verify your email by opening this link: ${verificationLink}`,
      html: `<p>Verify your email to finish creating your account.</p><p><a href="${verificationLink}">Verify email</a></p>`,
    });

    return res.status(201).json({
      message: "User registered successfully. Check your email to verify your account.",
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

    if (!user.isEmailVerified) {
      return res.status(403).json({ error: "Please verify your email before logging in." });
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

router.get("/verify-email", async (req, res) => {
  try {
    const token = String(req.query?.token ?? "").trim();

    if (!token) {
      return res.status(400).json({ error: "Verification token is required." });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Verification token is invalid or expired." });
    }

    user.isEmailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationTokenExpiresAt = null;
    await user.save();

    return res.json({ message: "Email verified successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Verify email error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/resend-verification", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email ?? "");
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If that email exists, a verification link has been sent." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: "This email is already verified." });
    }

    const verificationToken = createToken();
    user.emailVerificationTokenHash = hashToken(verificationToken);
    user.emailVerificationTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await user.save();

    const verificationLink = `${clientUrl}/verify-email?token=${verificationToken}`;
    await sendAuthEmail({
      to: email,
      subject: "Verify your email",
      text: `Verify your email by opening this link: ${verificationLink}`,
      html: `<p>Verify your email to finish creating your account.</p><p><a href="${verificationLink}">Verify email</a></p>`,
    });

    return res.json({ message: "If that email exists, a verification link has been sent." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Resend verification error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const rawEmail = String(req.body?.email ?? "");
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const resetToken = createToken();
    user.passwordResetTokenHash = hashToken(resetToken);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();

    const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;
    await sendAuthEmail({
      to: email,
      subject: "Reset your password",
      text: `Reset your password by opening this link: ${resetLink}`,
      html: `<p>Reset your password using the link below.</p><p><a href="${resetLink}">Reset password</a></p>`,
    });

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Forgot password error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const rawToken = String(req.body?.token ?? "");
    const rawPassword = String(req.body?.password ?? "");

    const token = rawToken.trim();
    const password = rawPassword;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const tokenHash = hashToken(token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset token is invalid or expired." });
    }

    user.passwordHash = password;
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("Reset password error:", message);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
