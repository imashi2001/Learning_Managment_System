import express from "express";
import {
  makePayment,
  getMyPayments,
  getAllPayments,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, makePayment);
router.get("/my-payments", authMiddleware, getMyPayments);
router.get("/", authMiddleware, getAllPayments);

export default router;
