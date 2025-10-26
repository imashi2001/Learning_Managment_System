import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

// ✅ Get all courses assigned to a lecturer
export const getLecturerCourses = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const courses = await Course.find({ instructor: lecturerId });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all students enrolled in lecturer's courses
export const getLecturerStudents = async (req, res) => {
  try {
    const lecturerId = req.user.id;

    const enrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title instructor");

    // Filter enrollments only for lecturer's own courses
    const filtered = enrollments.filter(
      (e) => e.course?.instructor?.toString() === lecturerId
    );

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add a new module to a course
export const addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, contentType, contentUrl } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if the lecturer owns this course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Create and add the new module
    const newModule = { title, contentType, contentUrl };
    course.modules.push(newModule);
    await course.save();

    res.status(201).json({
      message: "Module added successfully",
      module: course.modules[course.modules.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete an existing module
export const deleteModule = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Verify lecturer ownership
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Find the module index and remove it
    const moduleIndex = course.modules.findIndex(
      (m) => m._id.toString() === moduleId
    );

    if (moduleIndex === -1) {
      return res.status(404).json({ message: "Module not found" });
    }

    course.modules.splice(moduleIndex, 1);
    await course.save();

    res.json({ message: "Module deleted successfully", moduleId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
