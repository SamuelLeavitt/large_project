import mongoose, { InferSchemaType, Schema } from "mongoose";

const workoutTemplateExerciseSchema = new Schema(
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
    category: {
      type: String,
      default: "",
      trim: true,
    },
    bodyPart: {
      type: String,
      default: "",
      trim: true,
    },
    sets: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reps: {
      type: String,
      required: true,
      default: "0",
      trim: true,
    },
  },
  { _id: false }
);

const workoutTemplateSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bodyPart: {
      type: String,
      required: true,
      trim: true,
      default: "Custom",
    },
    exercises: {
      type: [workoutTemplateExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export type WorkoutTemplateDocument = InferSchemaType<typeof workoutTemplateSchema>;

export default mongoose.model("WorkoutTemplate", workoutTemplateSchema);