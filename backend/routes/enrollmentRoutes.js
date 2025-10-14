import express from "express";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🟢 Enroll in a course
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check course existence
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (existing)
      return res.status(400).json({ message: "Already enrolled in this course" });

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
    });

    res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📚 Get all enrollments for logged-in student
router.get("/my-enrollments", authMiddleware, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "title category price");
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🧑‍🏫 Admin or instructor view all enrollments
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "instructor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title category");

    res.json(allEnrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
