import express from "express";
import { assignCoursesToLecturer } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// only admins can assign courses
router.post("/assign-courses", authMiddleware, assignCoursesToLecturer);

export default router;
