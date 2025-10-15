import express from "express";
import { generatePDFReport, generateCSVReport } from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin-only routes
router.get("/pdf", authMiddleware, generatePDFReport);
router.get("/csv", authMiddleware, generateCSVReport);

export default router;
