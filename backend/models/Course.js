import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ✅ Instructor field – references the lecturer assigned to this course
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // can be assigned later by admin
    },
    // ✅ List of modules (lecturer can add content)
    modules: [
      {
        title: {
          type: String,
          required: true,
        },
        contentType: {
          type: String,
          enum: ["video", "pdf", "text", "link"],
          default: "text",
        },
        contentUrl: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
