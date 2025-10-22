import express from "express";
import { getLecturerCourses, getLecturerStudents } from "../controllers/lecturerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All lecturer routes require authentication
router.get("/courses", authMiddleware, getLecturerCourses);
router.get("/students", authMiddleware, getLecturerStudents);

export default router;
