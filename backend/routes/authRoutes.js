import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  getCurrentUser,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  upload
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Register new user
router.post("/register", registerUser);

// 🔹 Login existing user
router.post("/login", loginUser);

// 🔹 Get logged-in user profile
router.get("/me", authMiddleware, getProfile);

// 🔹 Get current user profile (detailed)
router.get("/profile", authMiddleware, getCurrentUser);

// 🔹 Update user profile
router.put("/profile", authMiddleware, updateProfile);

// 🔹 Upload profile image
router.post("/upload-profile-image", authMiddleware, upload.single('profileImage'), uploadProfileImage);

// 🔹 Remove profile image
router.delete("/remove-profile-image", authMiddleware, removeProfileImage);

// 🔹 Admin — Get all users
router.get("/users", authMiddleware, getAllUsers);

export default router;
