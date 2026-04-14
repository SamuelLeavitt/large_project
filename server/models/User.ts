import { Schema, model, Model, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerificationTokenHash?: string | null;
  emailVerificationTokenExpiresAt?: Date | null;
  passwordResetTokenHash?: string | null;
  passwordResetTokenExpiresAt?: Date | null;
  themePreference?: "light" | "dark";
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    emailVerificationTokenHash: {
      type: String,
      default: null
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
      default: null
    },
    passwordResetTokenHash: {
      type: String,
      default: null
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null
    },
    themePreference: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  const user = this as UserDocument;

  if (!user.isModified("passwordHash")) return;

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
});

userSchema.method(
  "comparePassword",
  async function comparePassword(this: UserDocument, candidatePassword: string) {
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }
);

const User = model<IUser, UserModel>("User", userSchema);

export default User;
