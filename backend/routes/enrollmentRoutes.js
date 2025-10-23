import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  getAllEnrollments,
} from "../controllers/enrollmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { getMyCourses } from "../controllers/enrollmentController.js";

const router = express.Router();

router.post("/", authMiddleware, enrollInCourse);
router.get("/my-enrollments", authMiddleware, getMyEnrollments);
router.get("/", authMiddleware, getAllEnrollments);
router.get("/my-courses", authMiddleware, getMyCourses);

export default router;
