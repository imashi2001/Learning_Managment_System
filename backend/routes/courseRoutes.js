import express from "express";
import Course from "../models/Course.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🆕 Add a new course (admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, category, description } = req.body;

    const course = await Course.create({ title, category, description });
    res.status(201).json({ message: "Course added successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error adding course", error: error.message });
  }
});

// 📋 Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
});

export default router;
