import Enrollment from "../models/Enrollment.js";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";

// 📄 Generate PDF report
export const generatePDFReport = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate("course");
    const payments = await Payment.find().populate("student");

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=report.pdf");
    doc.pipe(res);

    doc.fontSize(18).text("Learning Management System Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Enrollments Summary:");
    enrollments.forEach((e) => {
      doc
        .fontSize(12)
        .text(
          `Student: ${e.name} (${e.email}) | Course: ${e.course?.title || "N/A"} | Batch: ${
            e.batch
          } | Phone: ${e.phone}`
        );
    });

    doc.moveDown();
    doc.fontSize(14).text("Payments Summary:");
    payments.forEach((p) => {
      doc
        .fontSize(12)
        .text(
          `Student: ${p.student?.name || "N/A"} | Amount: Rs.${p.amount} | Status: ${
            p.status
          } | Date: ${new Date(p.createdAt).toLocaleDateString()}`
        );
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: "Error generating PDF", error: error.message });
  }
};

// 📊 Generate CSV report
export const generateCSVReport = async (req, res) => {
  try {
    const enrollments = await Enrollment.find().populate("course");
    const payments = await Payment.find().populate("student");

    const data = [
      { section: "Enrollments" },
      ...enrollments.map((e) => ({
        StudentName: e.name,
        Email: e.email,
        Course: e.course?.title || "N/A",
        Batch: e.batch,
        Phone: e.phone,
      })),
      { section: "Payments" },
      ...payments.map((p) => ({
        Student: p.student?.name || "N/A",
        Amount: p.amount,
        Status: p.status,
        Date: new Date(p.createdAt).toLocaleDateString(),
      })),
    ];

    const json2csv = new Parser();
    const csv = json2csv.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("report.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Error generating CSV", error: error.message });
  }
};
