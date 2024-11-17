const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/polling_system", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    seedAdminUser();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// Seed Admin User if it doesn't exist
const seedAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin", 10);
      const newAdmin = new User({
        name: "admin",
        email: "admin@gmail.com",
        password: hashedPassword,
        role: "admin",
      });
      await newAdmin.save();
      console.log("Admin user created.");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  }
};

// Server listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
