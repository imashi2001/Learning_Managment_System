import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Papa from "papaparse";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ✅ Fetch all required data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          axiosClient.get("/auth/users", { headers }),
          axiosClient.get("/courses", { headers }),
          axiosClient.get("/enrollments", { headers }),
        ]);

        setUsers(usersRes.data);
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes.data);
      } catch (error) {
        toast.error("Failed to load dashboard data",error);
      }
    };
    fetchData();
  }, []);

  // 📊 Summary Stats
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalLecturers = users.filter((u) => u.role === "lecturer").length;
  const totalAdmins = users.filter((u) => u.role === "admin").length;

  // 📘 Course-wise enrollments
  const courseData = courses.map((course) => ({
    name: course.title,
    students: enrollments.filter((e) => e.course._id === course._id).length,
  }));

  // 💰 Payment status breakdown
  const paymentStats = [
    { name: "Paid", value: enrollments.filter((e) => e.paymentStatus === "Paid").length },
    { name: "Pending", value: enrollments.filter((e) => e.paymentStatus !== "Paid").length },
  ];

  const COLORS = ["#10B981", "#FBBF24"];

  // 📈 Enrollments per month (for line chart)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
    const count = enrollments.filter(
      (e) => new Date(e.createdAt).getMonth() === i
    ).length;
    return { month: monthName, enrollments: count };
  });

  // 🧾 Latest 5 enrollments
  const latestEnrollments = enrollments.slice(-5).map((e) => ({
    student: e.student?.name,
    course: e.course?.title,
    status: e.paymentStatus,
    date: new Date(e.createdAt).toLocaleDateString(),
  }));

  // 📄 PDF Export
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Learning Management System - Admin Report", 14, 16);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    doc.text("Summary:", 14, 40);
    doc.autoTable({
      startY: 45,
      head: [["Category", "Count"]],
      body: [
        ["Total Students", totalStudents],
        ["Total Lecturers", totalLecturers],
        ["Total Admins", totalAdmins],
        ["Total Courses", courses.length],
        ["Total Enrollments", enrollments.length],
      ],
    });

    doc.text("Recent Enrollments:", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [["Student", "Course", "Payment", "Date"]],
      body: latestEnrollments.map((e) => [
        e.student,
        e.course,
        e.status,
        e.date,
      ]),
    });

    doc.save("Admin_Report.pdf");
  };

  // 📊 CSV Export
  const handleDownloadCSV = () => {
    const csv = Papa.unparse(
      latestEnrollments.map((e) => ({
        Student: e.student,
        Course: e.course,
        PaymentStatus: e.status,
        Date: e.date,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Admin_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            📄 Download PDF
          </button>
          <button
            onClick={handleDownloadCSV}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            📊 Download CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Students</h2>
          <p className="text-2xl font-bold">{totalStudents}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Lecturers</h2>
          <p className="text-2xl font-bold">{totalLecturers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Courses</h2>
          <p className="text-2xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Enrollments</h2>
          <p className="text-2xl font-bold">{enrollments.length}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow col-span-1">
          <h2 className="text-lg font-semibold mb-4">Payment Status Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={paymentStats} dataKey="value" nameKey="name" label>
                {paymentStats.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow col-span-1">
          <h2 className="text-lg font-semibold mb-4">Enrollments per Course</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-white p-4 rounded-lg shadow col-span-1">
          <h2 className="text-lg font-semibold mb-4">Enrollments per Month</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="enrollments" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Enrollments Table */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Enrollments</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Student</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-left">Payment</th>
              <th className="p-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {latestEnrollments.map((en, i) => (
              <tr key={i} className="border-b border-gray-300">
                <td className="p-2">{en.student}</td>
                <td className="p-2">{en.course}</td>
                <td className="p-2">{en.status}</td>
                <td className="p-2">{en.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
