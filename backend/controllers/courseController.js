import Course from "../models/Course.js";

// ➕ Create course
export const createCourse = async (req, res) => {
  try {
    const { title, description, category, price, duration, modules } = req.body;

    if (req.user.role !== "instructor" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only instructors or admins can create courses",
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      price,
      duration,
      instructor: req.user.id,
      modules,
    });

    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📄 Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🆔 Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructor",
      "name email"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update course
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (req.user.id !== course.instructor.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ message: "Course updated", course: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete course
export const deleteCourse = async (req, res) => {
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
};
