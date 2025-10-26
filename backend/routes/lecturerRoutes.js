import express from "express";
import {
  getLecturerCourses,
  getLecturerStudents,
  addModule,
  deleteModule, // ✅ Make sure this line is added
} from "../controllers/lecturerController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all courses assigned to lecturer
router.get("/courses", authMiddleware, getLecturerCourses);

// ✅ Get all students enrolled in lecturer's courses
router.get("/students", authMiddleware, getLecturerStudents);

// ✅ Add new module to a course
router.post("/courses/:courseId/modules", authMiddleware, addModule);

// ✅ Delete a module from a course
router.delete("/courses/:courseId/modules/:moduleId", authMiddleware, deleteModule);

export default router;
