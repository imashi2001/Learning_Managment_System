import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

// 🧑‍🏫 Assign one or more courses to a lecturer (updates both User & Course models)
export const assignCoursesToLecturer = async (req, res) => {
  try {
    const { lecturerId, courseIds } = req.body; // expect courseIds to be an array

    // ✅ Validate lecturer
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== "lecturer") {
      return res.status(404).json({ message: "Lecturer not found or invalid role" });
    }

    // ✅ Validate course IDs
    const validCourses = await Course.find({ _id: { $in: courseIds } });
    if (validCourses.length !== courseIds.length) {
      return res.status(400).json({ message: "One or more course IDs are invalid" });
    }

    // ✅ 1. Assign courses to lecturer
    lecturer.assignedCourses = courseIds;
    await lecturer.save();

    // ✅ 2. Assign lecturer to each selected course
    await Promise.all(
      courseIds.map((courseId) =>
        Course.findByIdAndUpdate(courseId, { instructor: lecturerId })
      )
    );

    // ✅ 3. Remove lecturer from courses not in current list
    await Course.updateMany(
      { instructor: lecturerId, _id: { $nin: courseIds } },
      { $unset: { instructor: "" } }
    );

    res.json({
      message: "Courses assigned successfully to lecturer",
      lecturer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error assigning courses", error: error.message });
  }
};
export const getOverviewStats = async (req, res) => {
  try {
    // count totals
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalLecturers = await User.countDocuments({ role: "lecturer" });
    const totalCourses = await Course.countDocuments();

    // sum revenue for paid enrollments
    const paidEnrollments = await Enrollment.find({ paymentStatus: "Paid" });
    const totalRevenue = paidEnrollments.reduce(
      (sum, e) => sum + (e.course?.price || 0),
      0
    );

    res.json({
      totalStudents,
      totalLecturers,
      totalCourses,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};