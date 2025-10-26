import mongoose from "mongoose";

/**
 * Enrollment Model Schema
 * 
 * This schema tracks student enrollments in courses, including payment status
 * and enrollment details like batch, start date, and contact information.
 * 
 * @field student - Reference to the student (User) enrolling in the course (required)
 * @field course - Reference to the course being enrolled in (required)
 * @field batch - Batch name for group-based courses (default: "General")
 * @field phone - Student's contact phone number (required)
 * @field startingDate - Date when the course starts (required)
 * @field paymentStatus - Payment status: "Pending" or "Paid" (default: "Pending")
 * @field status - Enrollment status: "enrolled", "completed", or "cancelled" (default: "enrolled")
 * @field enrolledAt - Timestamp when enrollment was created (default: current date)
 * @field timestamps - Automatically adds createdAt and updatedAt fields
 */
const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    batch: {
      type: String,
      required: false,
      default: "General",
    },
    phone: {
      type: String,
      required: true,
    },
    startingDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    status: {
      type: String,
      enum: ["enrolled", "completed", "cancelled"],
      default: "enrolled",
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
