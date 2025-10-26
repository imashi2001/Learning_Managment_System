import mongoose from "mongoose";

/**
 * Payment Model Schema
 * 
 * This schema tracks payment transactions for course enrollments.
 * Supports OTP-based payment verification system with expiration and attempt limits.
 * 
 * @field student - Reference to the student making the payment (required)
 * @field course - Reference to the course being paid for (required)
 * @field enrollment - Reference to the enrollment (optional, can be created after payment)
 * @field enrollmentData - Temporary storage of enrollment form data before enrollment creation
 * @field amount - Payment amount in local currency (required)
 * @field paymentMethod - Payment method: "card", "paypal", or "cash" (default: "card")
 * @field status - Payment status: "pending", "completed", "failed", "otp_sent", or "otp_verified" (default: "pending")
 * @field otp - 6-digit OTP code for payment verification (null after successful payment)
 * @field otpExpiresAt - Expiration timestamp for OTP (typically 5 minutes from generation)
 * @field otpAttempts - Number of failed OTP attempts (max 3 attempts allowed)
 * @field paidAt - Timestamp when payment was completed
 * @field timestamps - Automatically adds createdAt and updatedAt fields
 */
const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: "Enrollment", required: false },
    enrollmentData: { type: Object, default: null }, // Store enrollment form data temporarily
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["card", "paypal", "cash"], default: "card" },
    status: { type: String, enum: ["pending", "completed", "failed", "otp_sent", "otp_verified"], default: "pending" },
    otp: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
