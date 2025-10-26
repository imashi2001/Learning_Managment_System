import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";

// 📄 Generate PDF Report
export const generatePDFReport = async (req, res) => {
  try {
    // Only admin can download
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [enrollments, payments, courses] = await Promise.all([
      Enrollment.find().populate("student", "name email").populate("course", "title category"),
      Payment.find().populate("student", "name email").populate("course", "title"),
      Course.find().populate("instructor", "name email"),
    ]);

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=LMS_Report.pdf");
    doc.pipe(res);

    doc.fontSize(20).text("Learning Management System Report", { align: "center" });
    doc.moveDown();

    // Courses Section
    doc.fontSize(14).text("Courses Overview:", { underline: true });
    courses.forEach((c, i) => {
      doc.text(`${i + 1}. ${c.title} (${c.category}) - Trainer: ${c.instructor?.name || "N/A"}`);
    });
    doc.moveDown();

    // Enrollments Section
    doc.fontSize(14).text("Enrollments:", { underline: true });
    enrollments.forEach((e, i) => {
      doc.text(`${i + 1}. ${e.student?.name} → ${e.course?.title} (${e.status})`);
    });
    doc.moveDown();

    // Payments Section
    doc.fontSize(14).text("Payments:", { underline: true });
    payments.forEach((p, i) => {
      doc.text(
        `${i + 1}. ${p.student?.name} → ${p.course?.title} | Rs.${p.amount} | ${p.status}`
      );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

// 📊 Generate CSV Report
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
      Date: p.paidAt?.toISOString(),
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment(`Payments_Report.csv`);
    res.send(csv);

  } catch (error) {
    res.status(500).json({ message: "Error generating CSV", error: error.message });
  }
};
