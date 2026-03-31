import mongoose, { Schema, InferSchemaType } from "mongoose";

const exerciseSchema = new Schema(
  {
    datasetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    force: {
      type: String,
      default: null,
      enum: ["push", "pull", "static", null],
    },

    level: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    mechanic: {
      type: String,
      default: null,
      trim: true,
    },

    equipment: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    primaryMuscles: {
      type: [String],
      default: [],
      index: true,
    },

    secondaryMuscles: {
      type: [String],
      default: [],
    },

    instructions: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    source: {
      type: String,
      default: "free-exercise-db",
      immutable: true,
    },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: "text", category: "text", equipment: "text" });

export type ExerciseDocument = InferSchemaType<typeof exerciseSchema>;

export default mongoose.model("Exercise", exerciseSchema);
