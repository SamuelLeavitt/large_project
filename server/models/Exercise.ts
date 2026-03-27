import mongoose, { Document } from "mongoose";

export interface IExercise extends Document {
  exerciseId: string;
  name: string;
  imageUrl?: string;
  equipments: string[];
  bodyParts: string[];
  gender?: string;
  exerciseType?: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  videoUrl?: string;
  keywords: string[];
  overview?: string;
  instructions: string[];
  exerciseTips: string[];
  variations: string[];
  relatedExerciseIds: string[];
  createdBy?: mongoose.Types.ObjectId | null;
}

const exerciseSchema = new mongoose.Schema<IExercise>(
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
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

const Exercise = mongoose.model<IExercise>("Exercise", exerciseSchema);
export default Exercise;
