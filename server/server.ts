import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";
import authRoutes from "./routes/auth.js";
import exerciseRoutes from "./routes/exercise.js";
import workoutRoutes from "./routes/workouts.js";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(path.dirname(new URL(import.meta.url).pathname), ".env"),
];

const envFilePath = envCandidates.find((candidate) => existsSync(candidate));
console.log("[server] cwd:", process.cwd());
console.log("[server] env candidates:", envCandidates);
console.log("[server] loaded env from:", envFilePath);

dotenv.config(envFilePath ? { path: envFilePath } : undefined);

console.log("[server] CLIENT_URL after dotenv.config:", process.env.CLIENT_URL);
console.log("[server] All env keys:", Object.keys(process.env).filter(k => k.startsWith("CLIENT") || k.startsWith("SMTP") || k.startsWith("PORT") || k.startsWith("MONGO")));

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/workouts", workoutRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is running" });
});

const PORT = process.env.PORT || "5000";
const MONGO_URI = process.env.MONGO_URI || "";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err?.message || err);
  });
