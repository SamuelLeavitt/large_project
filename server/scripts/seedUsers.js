const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    console.log("Cleared existing users");

    const users = [
      {
        username: "samuel",
        email: "samuel@example.com",
        passwordHash: "password123",
      },
      {
        username: "avafit",
        email: "ava@example.com",
        passwordHash: "password123",
      },
      {
        username: "liftnoah",
        email: "noah@example.com",
        passwordHash: "password123",
      },
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // triggers pre("save") password hashing
    }

    console.log("Users seeded successfully");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
}

seedUsers();
