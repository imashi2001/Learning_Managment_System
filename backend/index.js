import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";


// Load environment variables first
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/enrollments", enrollmentRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("LMS Backend is running ");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
