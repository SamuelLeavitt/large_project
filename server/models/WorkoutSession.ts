import mongoose, { InferSchemaType, Schema } from "mongoose";

const workoutSetSchema = new Schema(
  {
    weight: {
      type: Number,
      required: true,
      default: 0,
    },
    reps: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const workoutSessionExerciseSchema = new Schema(
  {
    exerciseId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sets: {
      type: [workoutSetSchema],
      default: [],
    },
  },
  { _id: false }
);

const workoutSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    workoutName: {
      type: String,
      required: true,
      trim: true,
    },
    sourceType: {
      type: String,
      enum: ["quickStart", "template"],
      default: "quickStart",
      trim: true,
    },
    templateId: {
      type: String,
      default: null,
      trim: true,
    },
    templateName: {
      type: String,
      default: "",
      trim: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    exercises: {
      type: [workoutSessionExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export type WorkoutSessionDocument = InferSchemaType<typeof workoutSessionSchema>;

export default mongoose.model("WorkoutSession", workoutSessionSchema);