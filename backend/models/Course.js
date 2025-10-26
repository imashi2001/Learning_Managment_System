import mongoose from "mongoose";

/**
 * Course Model Schema
 * 
 * This schema defines the structure for courses in the Learning Management System.
 * Courses can be created by admins and lecturers, and contain modules/lessons.
 * 
 * @field title - Course title/name (required)
 * @field description - Detailed course description (required)
 * @field category - Course category (e.g., "Web Development", "Data Science") (required)
 * @field price - Course price in local currency (default: 0, minimum: 0)
 * @field duration - Course duration: 1 month, 3 months, 6 months, 1 year, or 2 years (default: 3 months)
 * @field instructor - Reference to the lecturer/teacher assigned to this course (optional, can be assigned later)
 * @field modules - Array of course modules containing learning materials
 *   - title: Module title (required)
 *   - contentType: Type of content - video, pdf, text, or link (default: text)
 *   - contentUrl: URL or path to the content (required)
 * @field timestamps - Automatically adds createdAt and updatedAt fields
 */
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
    duration: {
      type: String,
      required: true,
      enum: ["1 month", "3 months", "6 months", "1 year", "2 years"],
      default: "3 months",
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
