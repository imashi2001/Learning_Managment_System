import express from "express";
import {
  makePayment,
  getMyPayments,
  getAllPayments,
  generatePaymentOTP,
  generateEnrollmentPaymentOTP,
  verifyOTPAndCompletePayment,
  resendOTP,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// OTP-based payment routes
router.post("/generate-otp", authMiddleware, generatePaymentOTP);
router.post("/generate-enrollment-otp", authMiddleware, generateEnrollmentPaymentOTP);
router.post("/verify-otp", authMiddleware, verifyOTPAndCompletePayment);
router.post("/resend-otp", authMiddleware, resendOTP);

// Legacy payment route (kept for backward compatibility)
router.post("/", authMiddleware, makePayment);

// Get payments
router.get("/my-payments", authMiddleware, getMyPayments);
router.get("/", authMiddleware, getAllPayments);

export default router;
