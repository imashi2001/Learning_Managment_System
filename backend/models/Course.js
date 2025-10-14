import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, default: 0 },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    modules: [
      {
        title: String,
        contentType: { type: String, enum: ["video", "pdf", "text", "link"], default: "text" },
        contentUrl: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
