import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

// 💳 Make payment
export const makePayment = async (req, res) => {
  try {
    const { enrollmentId, paymentMethod } = req.body;

    const enrollment = await Enrollment.findById(enrollmentId).populate("course");
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    // Prevent duplicate payments
    const existingPayment = await Payment.findOne({ enrollment: enrollmentId });
    if (existingPayment)
      return res
        .status(400)
        .json({ message: "Payment already completed for this enrollment" });

    const payment = await Payment.create({
      student: req.user.id,
      course: enrollment.course._id,
      enrollment: enrollmentId,
      amount: enrollment.course.price,
      paymentMethod,
      status: "completed",
    });

    // Update enrollment status
    enrollment.status = "completed";
    await enrollment.save();

    res.status(201).json({
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📜 Get my payments
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate("course", "title category price")
      .sort({ paidAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧾 Get all payments (admin only)
export const getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const allPayments = await Payment.find()
      .populate("student", "name email")
      .populate("course", "title category")
      .sort({ paidAt: -1 });

    res.json(allPayments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
