import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// 🟢 Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, batch, phone, paymentStatus } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Check if already enrolled
    const existing = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });
    if (existing)
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });

    // ✅ Create enrollment with all fields
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      batch,
      phone,
      paymentStatus: paymentStatus || "Pending", // default to Pending
      status: "enrolled",
    });

    res.status(201).json({
      message: "Enrolled successfully. Please proceed to payment.",
      enrollment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍🎓 Get enrollments for a student
export const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "title category price");
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍💼 Admin or instructor view all enrollments
export const getAllEnrollments = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "instructor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allEnrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title category price");

    res.json(allEnrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Fetch student's enrolled courses with lecturer and modules
export const getMyCourses = async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrollments = await Enrollment.find({ student: studentId }).populate({
      path: "course",
      populate: { path: "instructor", select: "name email" },
    });

    const courses = enrollments.map((en) => en.course);
    res.json(courses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to load courses", error: error.message });
  }
};

// 💳 Mark enrollment as paid (for mock payment)
export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findById(id);
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    // Only the same student or an admin can mark payment as paid
    if (
      enrollment.student.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    enrollment.paymentStatus = "Paid";
    await enrollment.save();

    res.json({
      message: "Payment marked as successful",
      enrollment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment status", error: error.message });
  }
};
