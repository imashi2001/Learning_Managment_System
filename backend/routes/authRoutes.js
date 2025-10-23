import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers, 
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Register new user
router.post("/register", registerUser);

// 🔹 Login existing user
router.post("/login", loginUser);

// 🔹 Get logged-in user profile
router.get("/me", authMiddleware, getProfile);

// 🔹 Admin — Get all users
router.get("/users", authMiddleware, getAllUsers); // ✅ cleaner separation

export default router;
