import express from "express";
import Course from "../models/Course.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🧑‍💼 Helper: Check admin permission
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// 🆕 Add a new course (Admin only)
router.post("/", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, category, description, price, duration } = req.body;

    const course = await Course.create({
      title,
      category,
      description,
      price: price || 0,
      duration: duration || "3 months",
    });

    res.status(201).json({ message: "Course added successfully", course });
  } catch (error) {
    res.status(500).json({ message: "Error adding course", error: error.message });
  }
});

// ✏️ Update a course (Admin only)
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { title, category, description, price, duration } = req.body;

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, category, description, price, duration },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    res.status(500).json({ message: "Error updating course", error: error.message });
  }
});

// 🗑️ Delete a course (Admin only)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course", error: error.message });
  }
});

// 📋 Get all courses (public)
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
});

export default router;
