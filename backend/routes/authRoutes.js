import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js"; // ✅ import User model to fetch users

const router = express.Router();

// 🔹 Register
router.post("/register", registerUser);

// 🔹 Login
router.post("/login", loginUser);

// 🔹 Get current user's profile
router.get("/me", authMiddleware, getProfile);

// 🔹 Get all users (Admin only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    // Check if the logged-in user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Fetch all users except passwords
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

export default router;
