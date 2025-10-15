import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import fs from "fs";
import path from "path";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";

// 🧾 Generate PDF report
export const generatePDFReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [enrollments, payments, courses] = await Promise.all([
      Enrollment.find().populate("student", "name email").populate("course", "title category"),
      Payment.find().populate("student", "name email").populate("course", "title"),
      Course.find().populate("instructor", "name email"),
    ]);

    const doc = new PDFDocument();
    const filePath = path.join("reports", `LMS_Report_${Date.now()}.pdf`);

    if (!fs.existsSync("reports")) {
      fs.mkdirSync("reports");
    }

    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text("📘 Learning Management System Report", { align: "center" });
    doc.moveDown();

    // Section 1: Courses
    doc.fontSize(14).text("Courses Overview:", { underline: true });
    courses.forEach((course, i) => {
      doc.text(`${i + 1}. ${course.title} (${course.category}) - Instructor: ${course.instructor?.name}`);
    });
    doc.moveDown();

    // Section 2: Enrollments
    doc.fontSize(14).text("Enrollments:", { underline: true });
    enrollments.forEach((en, i) => {
      doc.text(`${i + 1}. ${en.student.name} → ${en.course.title} (${en.status})`);
    });
    doc.moveDown();

    // Section 3: Payments
    doc.fontSize(14).text("Payments:", { underline: true });
    payments.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.student.name} → ${p.course.title} | ${p.amount} LKR | ${p.status}`);
    });

    doc.end();

    res.json({
      message: "PDF report generated successfully",
      filePath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Generate CSV report
export const generateCSVReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const payments = await Payment.find()
      .populate("student", "name email")
      .populate("course", "title category");

    const csvData = payments.map((p) => ({
      StudentName: p.student?.name || "N/A",
      StudentEmail: p.student?.email || "N/A",
      CourseTitle: p.course?.title || "N/A",
      Amount: p.amount,
      PaymentMethod: p.paymentMethod,
      Status: p.status,
      Date: p.paidAt.toISOString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    const filePath = path.join("reports", `Payments_Report_${Date.now()}.csv`);
    if (!fs.existsSync("reports")) {
      fs.mkdirSync("reports");
    }

    fs.writeFileSync(filePath, csv);

    res.json({
      message: "CSV report generated successfully",
      filePath,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
