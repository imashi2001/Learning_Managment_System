import express from "express";
import Course from "../models/Course.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ➕ Create a course (only for instructors/admins)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, price, modules } = req.body;

    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: only instructors or admins can create courses" });
    }

    const newCourse = await Course.create({
      title,
      description,
      category,
      price,
      instructor: req.user.id,
      modules,
    });

    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 📄 Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🆔 Get single course by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("instructor", "name email");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✏️ Update a course (only by owner or admin)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.id !== course.instructor.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Course updated", course: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ❌ Delete a course (only by owner or admin)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.id !== course.instructor.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
