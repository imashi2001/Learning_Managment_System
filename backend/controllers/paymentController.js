import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import { sendOTPEmail, sendPaymentConfirmationEmail } from "../utils/emailService.js";

// 🔐 Generate OTP for payment
export const generatePaymentOTP = async (req, res) => {
  try {
    const { enrollmentId, paymentMethod } = req.body;

    // Find enrollment with course and student details
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("course", "title price")
      .populate("student", "name email");
    
    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // Check if student is the owner of this enrollment
    if (enrollment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if payment already exists and is completed
    const existingPayment = await Payment.findOne({ enrollment: enrollmentId });
    if (existingPayment && existingPayment.status === "completed") {
      return res.status(400).json({ message: "Payment already completed for this enrollment" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    let payment;
    
    if (existingPayment) {
      // Update existing payment with new OTP
      payment = await Payment.findByIdAndUpdate(
        existingPayment._id,
        {
          otp,
          otpExpiresAt,
          otpAttempts: 0,
          status: "otp_sent",
          paymentMethod,
        },
        { new: true }
      );
    } else {
      // Create new payment with OTP
      payment = await Payment.create({
        student: req.user.id,
        course: enrollment.course._id,
        enrollment: enrollmentId,
        amount: enrollment.course.price,
        paymentMethod,
        status: "otp_sent",
        otp,
        otpExpiresAt,
        otpAttempts: 0,
      });
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(
      enrollment.student.email,
      otp,
      enrollment.student.name,
      enrollment.course.title
    );

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: "Failed to send OTP email", 
        error: emailResult.error 
      });
    }

    res.status(200).json({
      message: "OTP sent successfully to your email",
      paymentId: payment._id,
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Error generating payment OTP:", error);
    res.status(500).json({ message: "Failed to generate OTP", error: error.message });
  }
};

// ✅ Verify OTP and complete payment
export const verifyOTPAndCompletePayment = async (req, res) => {
  try {
    const { paymentId, otp } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate("student", "name email")
      .populate("course", "title price")
      .populate("enrollment");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if student is the owner of this payment
    if (payment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if payment is already completed
    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Check if OTP has expired
    if (payment.otpExpiresAt && new Date() > payment.otpExpiresAt) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Check OTP attempts limit
    if (payment.otpAttempts >= 3) {
      return res.status(400).json({ 
        message: "Too many failed attempts. Please request a new OTP." 
      });
    }

    // Verify OTP
    if (payment.otp !== otp) {
      // Increment failed attempts
      await Payment.findByIdAndUpdate(paymentId, {
        $inc: { otpAttempts: 1 }
      });
      
      return res.status(400).json({ 
        message: "Invalid OTP. Please try again.",
        attemptsLeft: 3 - (payment.otpAttempts + 1)
      });
    }

    // OTP is correct, complete the payment
    payment.status = "completed";
    payment.paidAt = new Date();
    payment.otp = null; // Clear OTP for security
    payment.otpExpiresAt = null;
    await payment.save();

    // Update enrollment status
    const enrollment = await Enrollment.findById(payment.enrollment._id);
    enrollment.status = "completed";
    enrollment.paymentStatus = "Paid";
    await enrollment.save();

    // Send payment confirmation email
    await sendPaymentConfirmationEmail(
      payment.student.email,
      payment.student.name,
      payment.course.title,
      payment.amount
    );

    res.status(200).json({
      message: "Payment completed successfully!",
      payment: {
        id: payment._id,
        amount: payment.amount,
        course: payment.course.title,
        paidAt: payment.paidAt,
        status: payment.status
      }
    });
  } catch (error) {
    console.error("Error verifying OTP and completing payment:", error);
    res.status(500).json({ message: "Failed to complete payment", error: error.message });
  }
};

// 🔄 Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const payment = await Payment.findById(paymentId)
      .populate("student", "name email")
      .populate("course", "title price");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Check if student is the owner of this payment
    if (payment.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if payment is already completed
    if (payment.status === "completed") {
      return res.status(400).json({ message: "Payment already completed" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update payment with new OTP
    await Payment.findByIdAndUpdate(paymentId, {
      otp,
      otpExpiresAt,
      otpAttempts: 0,
      status: "otp_sent",
    });

    // Send new OTP email
    const emailResult = await sendOTPEmail(
      payment.student.email,
      otp,
      payment.student.name,
      payment.course.title
    );

    if (!emailResult.success) {
      return res.status(500).json({ 
        message: "Failed to send OTP email", 
        error: emailResult.error 
      });
    }

    res.status(200).json({
      message: "New OTP sent successfully to your email",
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP", error: error.message });
  }
};

// 💳 Make payment (Legacy - kept for backward compatibility)
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
      paidAt: new Date(),
    });

    // Update enrollment status
    enrollment.status = "completed";
    enrollment.paymentStatus = "Paid";
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
