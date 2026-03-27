import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

type NewUser = {
  username: string;
  email: string;
  passwordHash: string;
};

async function seedUsers() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not set in environment");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("Cleared existing users");

    const users: NewUser[] = [
      { username: "samuel", email: "samuel@example.com", passwordHash: "password123" },
      { username: "avafit", email: "ava@example.com", passwordHash: "password123" },
      { username: "liftnoah", email: "noah@example.com", passwordHash: "password123" },
    ];

    for (const userData of users) {
      const user = new User(userData as any);
      await user.save();
    }

    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

if (require.main === module) {
  seedUsers();
}

export default seedUsers;
