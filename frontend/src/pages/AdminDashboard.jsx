import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
import { Dialog } from "@headlessui/react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch user info and dashboard data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserName(decoded.name);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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

  // 📈 Enrollments per month
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthName = new Date(0, i).toLocaleString("default", { month: "short" });
    const count = enrollments.filter(
      (e) => new Date(e.createdAt).getMonth() === i
    ).length;
    return { month: monthName, enrollments: count };
  });

  // 🧾 Latest enrollments
  const latestEnrollments = enrollments.slice(-5).map((e) => ({
    student: e.student?.name,
    course: e.course?.title,
    status: e.paymentStatus,
    date: new Date(e.createdAt).toLocaleDateString(),
  }));

  // 🧭 Filter + search logic
  const filteredCourses = courses.filter(
    (c) =>
      (categoryFilter === "All" || c.category === categoryFilter) &&
      c.title.toLowerCase().includes(search.toLowerCase())
  );

  // 🧾 Export PDF
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
      body: latestEnrollments.map((e) => [e.student, e.course, e.status, e.date]),
    });

    doc.save("Admin_Report.pdf");
  };

  // 📊 Export CSV
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">LMS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EduLearn</h1>
            </Link>
            <nav className="flex space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Home
              </Link>
              <Link to="/admin/courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Manage Courses
              </Link>
              <Link to="/admin/enrollments" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Enrollments
              </Link>
              <Link to="/admin/payments" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Payments
              </Link>
              <Link to="/admin/reports" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Reports
              </Link>
              <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              {userName && (
                <div className="flex items-center text-gray-600 px-4 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>Welcome, {userName}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100 text-gray-900">
        {/* Dashboard Header */}
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

      {/* Charts */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {/* Pie */}
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

        {/* Bar */}
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

        {/* Line */}
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

      {/* 🔍 Course Management Section */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Manage Courses</h2>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-1/2"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option>All</option>
            {[...new Set(courses.map((c) => c.category))].map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <div key={course._id} className="p-4 border rounded shadow-sm bg-gray-50">
              <h3 className="text-lg font-semibold">{course.title}</h3>
              <p className="text-gray-500">{course.category}</p>
              <p className="text-gray-600 mt-2">{course.description?.slice(0, 70)}...</p>
              <button
                onClick={() => {
                  setSelectedCourse(course);
                  setIsModalOpen(true);
                }}
                className="mt-3 text-blue-600 hover:underline"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 📋 Recent Enrollments Table */}
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

      {/* 🪟 Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 max-w-lg w-full shadow-lg">
            <Dialog.Title className="text-2xl font-bold mb-2">
              {selectedCourse?.title}
            </Dialog.Title>
            <p className="text-gray-600 mb-3">{selectedCourse?.description}</p>

            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>Category:</strong> {selectedCourse?.category}</p>
              <p><strong>Price:</strong> Rs. {selectedCourse?.price || 0}</p>
              <p>
                <strong>Lecturer:</strong>{" "}
                {selectedCourse?.instructor?.name || "Not assigned"}
              </p>

              {selectedCourse?.modules?.length > 0 ? (
                <>
                  <strong>Modules:</strong>
                  <ul className="list-disc pl-6">
                    {selectedCourse.modules.map((m) => (
                      <li key={m._id}>
                        {m.title} ({m.contentType})
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-gray-500">No modules added yet.</p>
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
