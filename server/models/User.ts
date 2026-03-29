import { Schema, model, Model, HydratedDocument } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
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
