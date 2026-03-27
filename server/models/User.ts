import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

(userSchema as any).pre("save", function (this: IUser & mongoose.Document, next: mongoose.CallbackWithoutResultAndOptionalError) {
  // Only hash when passwordHash field is modified
  const doc = this as IUser & mongoose.Document;
  if (!doc.isModified("passwordHash")) return next();

  bcrypt
    .genSalt(10)
    .then((salt) => bcrypt.hash(doc.passwordHash, salt))
    .then((hash) => {
      doc.passwordHash = hash;
      next();
    })
    .catch((err) => next(err));
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
