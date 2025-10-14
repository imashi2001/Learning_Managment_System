import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    status: {
      type: String,
      enum: ["enrolled", "completed", "cancelled"],
      default: "enrolled",
    },
    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Enrollment", enrollmentSchema);
