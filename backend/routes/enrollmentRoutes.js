import express from "express";
import {
  enrollInCourse,
  getMyEnrollments,
  getAllEnrollments,
} from "../controllers/enrollmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, enrollInCourse);
router.get("/my-enrollments", authMiddleware, getMyEnrollments);
router.get("/", authMiddleware, getAllEnrollments);

export default router;
