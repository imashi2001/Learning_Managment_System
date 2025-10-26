import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";

// 🟢 Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId, batch, phone, paymentStatus, startingDate } = req.body;

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

    // If paymentStatus is "Paid", check for completed payment
    if (paymentStatus === "Paid") {
      const completedPayment = await Payment.findOne({
        student: req.user.id,
        course: courseId,
        status: "completed",
        enrollment: null // Payment not yet linked to enrollment
      });

      if (!completedPayment) {
        return res.status(400).json({ 
          message: "No completed payment found for this course" 
        });
      }
    }

    // ✅ Create enrollment with all fields
    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: courseId,
      batch: batch || "General", // default to "General" if not provided
      phone,
      startingDate: new Date(startingDate),
      paymentStatus: paymentStatus || "Pending", // default to Pending
      status: "enrolled",
    });

    // If payment was already completed, link it to the enrollment
    if (paymentStatus === "Paid") {
      const completedPayment = await Payment.findOne({
        student: req.user.id,
        course: courseId,
        status: "completed",
        enrollment: null
      });

      if (completedPayment) {
        completedPayment.enrollment = enrollment._id;
        await completedPayment.save();
      }
    }

    res.status(201).json({
      message: paymentStatus === "Paid" ? "Enrolled successfully!" : "Enrolled successfully. Please proceed to payment.",
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
    
    // Filter out enrollments with null courses (deleted courses)
    const validEnrollments = enrollments.filter(enrollment => enrollment.course !== null);
    
    res.json(validEnrollments);
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

    // Filter out enrollments with null courses (deleted courses)
    const validEnrollments = allEnrollments.filter(enrollment => enrollment.course !== null);

    res.json(validEnrollments);
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

    // Filter out enrollments with null courses and return enrollment data with course details
    const coursesWithEnrollmentData = enrollments
      .filter((enrollment) => enrollment.course !== null) // Remove enrollments with deleted courses
      .map((enrollment) => {
        const course = enrollment.course;
        
        // Calculate end date based on course duration and starting date
        const startDate = new Date(enrollment.startingDate);
        const duration = course.duration || "3 months";
        
        let endDate = new Date(startDate);
        switch (duration) {
          case "1 month":
            endDate.setMonth(endDate.getMonth() + 1);
            break;
          case "3 months":
            endDate.setMonth(endDate.getMonth() + 3);
            break;
          case "6 months":
            endDate.setMonth(endDate.getMonth() + 6);
            break;
          case "1 year":
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
          case "2 years":
            endDate.setFullYear(endDate.getFullYear() + 2);
            break;
          default:
            endDate.setMonth(endDate.getMonth() + 3); // default to 3 months
        }

        return {
          ...course.toObject(),
          enrollmentId: enrollment._id,
          paymentStatus: enrollment.paymentStatus,
          status: enrollment.status,
          startingDate: enrollment.startingDate,
          endDate: endDate,
          enrolledAt: enrollment.enrolledAt,
          phone: enrollment.phone,
          batch: enrollment.batch
        };
      });

    res.json(coursesWithEnrollmentData);
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
