import express from "express";
import { assignCoursesToLecturer } from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getOverviewStats } from "../controllers/adminController.js";
const router = express.Router();

// only admins can assign courses
router.post("/assign-courses", authMiddleware, assignCoursesToLecturer);
router.get("/overview", authMiddleware, getOverviewStats);
export default router;
