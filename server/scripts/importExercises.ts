import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Exercise from "../models/Exercise.js";

dotenv.config();

type FreeExerciseDbItem = {
  id: string;
  name: string;
  force: "push" | "pull" | "static" | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images?: string[];
};

async function run() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from environment variables");
  }

  const filePath = path.resolve("data/free-exercise-db.json");
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const exercises: FreeExerciseDbItem[] = JSON.parse(fileContents);

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  let inserted = 0;
  let updated = 0;

  for (const item of exercises) {
    const update = {
      datasetId: item.id,
      name: item.name,
      force: item.force ?? null,
      level: item.level ?? "",
      mechanic: item.mechanic ?? null,
      equipment: item.equipment ?? null,
      primaryMuscles: item.primaryMuscles ?? [],
      secondaryMuscles: item.secondaryMuscles ?? [],
      instructions: item.instructions ?? [],
      category: item.category ?? "",
      source: "free-exercise-db",
    };

    const result = await Exercise.updateOne(
      { datasetId: item.id },
      {
        $set: update,
        $unset: {
          images: "",
          imageUrls: "",
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) inserted++;
    else updated++;
  }

  console.log("Import complete");
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated: ${updated}`);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

run().catch(async (err) => {
  console.error("Import failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
