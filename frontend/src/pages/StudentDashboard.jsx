import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Footer from "../components/Footer";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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

    const fetchEnrollments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get("/enrollments/my-enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollments(res.data);
      } catch (error) {
        toast.error("Failed to load your enrollments",error);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const paid = enrollments.filter((e) => e.paymentStatus === "Paid").length;
  const pending = enrollments.filter((e) => e.paymentStatus !== "Paid").length;

  const pieData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
  ];

  const COLORS = ["#10B981", "#F59E0B"];

  if (loading) return <p className="text-center mt-10">Loading...</p>;

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
              <Link to="/student-home" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Browse Courses
              </Link>
              <Link to="/my-courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                My Courses
              </Link>
              <Link to="/payment" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Payments
              </Link>
              {userName && (
                <span className="text-gray-600 px-4 py-2">
                  Welcome, {userName}
                </span>
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
      <div className="flex-1 bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Student Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Total Enrollments</h2>
          <p className="text-2xl font-bold">{enrollments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Paid Courses</h2>
          <p className="text-2xl font-bold text-green-600">{paid}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm">Pending Payments</h2>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Payment Status Overview</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Enrolled Courses List */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">My Enrolled Courses</h2>
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Course</th>
              <th className="border p-2">Batch</th>
              <th className="border p-2">Payment</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length > 0 ? (
              enrollments.map((en) => (
                <tr key={en._id} className="hover:bg-gray-50">
                  <td className="border p-2">{en.course?.title}</td>
                  <td className="border p-2">{en.batch}</td>
                  <td className="border p-2">{en.paymentStatus}</td>
                  <td className="border p-2">
                    {new Date(en.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No enrollments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
