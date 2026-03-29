import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema(
  {
    exerciseId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: "" },
    equipments: { type: [String], default: [] },
    bodyParts: { type: [String], default: [] },
    gender: { type: String, default: "" },
    exerciseType: { type: String, default: "" },
    targetMuscles: { type: [String], default: [] },
    secondaryMuscles: { type: [String], default: [] },
    videoUrl: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    overview: { type: String, default: "" },
    instructions: { type: [String], default: [] },
    exerciseTips: { type: [String], default: [] },
    variations: { type: [String], default: [] },
    relatedExerciseIds: { type: [String], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Exercise", exerciseSchema);
