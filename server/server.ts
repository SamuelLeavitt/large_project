import mongoose from "mongoose";
import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";
import { createApp } from "./app.js";

const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(path.dirname(new URL(import.meta.url).pathname), ".env"),
];

const envFilePath = envCandidates.find((candidate) => existsSync(candidate));
dotenv.config(envFilePath ? { path: envFilePath } : undefined);

const app = createApp();

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
