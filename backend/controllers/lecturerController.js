import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";

// 📘 Get courses assigned to the logged-in lecturer
export const getLecturerCourses = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const lecturer = await User.findById(lecturerId).populate("assignedCourses");

    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(lecturer.assignedCourses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses", error: error.message });
  }
};

// 👩‍🎓 Get students enrolled in lecturer’s courses
export const getLecturerStudents = async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const lecturer = await User.findById(lecturerId).populate("assignedCourses");

    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const courseIds = lecturer.assignedCourses.map(c => c._id);
    const students = await Enrollment.find({ course: { $in: courseIds } })
      .populate("course")
      .populate("student");

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error: error.message });
  }
};
