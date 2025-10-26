import mongoose from "mongoose";

/**
 * User Model Schema
 * 
 * This schema defines the structure for users in the Learning Management System.
 * Supports three user roles: admin, lecturer, and student.
 * 
 * @field name - User's full name (required)
 * @field email - User's email address (required, unique)
 * @field password - Hashed password for authentication (required)
 * @field role - User role type: admin, lecturer, or student (default: student)
 * @field phone - User's contact phone number (optional)
 * @field address - User's physical address (optional)
 * @field bio - User's biography/description (optional)
 * @field profileImage - Path to user's profile image file (optional)
 * @field assignedCourses - Array of course IDs assigned to lecturer (only for lecturers)
 * @field timestamps - Automatically adds createdAt and updatedAt fields
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ["admin", "lecturer", "student"], 
      default: "student" 
    },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
