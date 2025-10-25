import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

export default function PaymentList() {
  const [enrollments, setEnrollments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [animate, setAnimate] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalStudents: 0,
  });

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

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get("/enrollments", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setEnrollments(data);
        setFiltered(data);
        calculateStats(data);
      } catch (error) {
        toast.error("Failed to load payments",error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const calculateStats = (data) => {
    const totalPaid = data
      .filter((e) => e.paymentStatus === "Paid")
      .reduce((sum, e) => sum + (e.course?.price || 0), 0);

    const totalPending = data
      .filter((e) => e.paymentStatus === "Pending" || !e.paymentStatus)
      .reduce((sum, e) => sum + (e.course?.price || 0), 0);

    const uniqueStudents = new Set(data.map((e) => e.student?._id)).size;

    setStats({
      totalPaid,
      totalPending,
      totalStudents: uniqueStudents,
    });
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === "all") {
      setFiltered(enrollments);
    } else {
      const filteredData = enrollments.filter(
        (e) => e.paymentStatus === value
      );
      setFiltered(filteredData);
    }
  };

  const markAsPaid = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(
        `/enrollments/${id}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment marked as Paid!");
      const updated = enrollments.map((e) =>
        e._id === id ? { ...e, paymentStatus: "Paid" } : e
      );
      setEnrollments(updated);
      calculateStats(updated);

      // ✨ Animate Total Revenue update
      setAnimate(true);
      setTimeout(() => setAnimate(false), 800);

      const filteredUpdated = filtered.map((e) =>
        e._id === id ? { ...e, paymentStatus: "Paid" } : e
      );
      setFiltered(filteredUpdated);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payment");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading payments...</p>;

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
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Dashboard
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
      <div className="flex-1 max-w-6xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">💰 Student Payments</h1>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-all duration-500">
        <div
          className={`p-4 rounded-lg text-center shadow-sm border ${
            animate
              ? "bg-green-300 text-green-900 scale-105"
              : "bg-green-100 text-green-800"
          } transition-all duration-500`}
        >
          <h3 className="font-bold text-lg">Total Revenue</h3>
          <p className="text-2xl font-semibold">
            Rs.{stats.totalPaid.toLocaleString()}
          </p>
        </div>

        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg text-center shadow-sm border">
          <h3 className="font-bold text-lg">Pending Amount</h3>
          <p className="text-2xl font-semibold">
            Rs.{stats.totalPending.toLocaleString()}
          </p>
        </div>

        <div className="bg-blue-100 text-blue-800 p-4 rounded-lg text-center shadow-sm border">
          <h3 className="font-bold text-lg">Total Students</h3>
          <p className="text-2xl font-semibold">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
        >
          <option value="all">All</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Payment Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Student</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Course</th>
              <th className="border p-2">Batch</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((enroll) => (
                <tr key={enroll._id} className="hover:bg-gray-50">
                  <td className="border p-2">{enroll.student?.name}</td>
                  <td className="border p-2">{enroll.student?.email}</td>
                  <td className="border p-2">{enroll.course?.title}</td>
                  <td className="border p-2">{enroll.batch || "-"}</td>
                  <td className="border p-2">{enroll.phone || "-"}</td>
                  <td className="border p-2">
                    Rs.{enroll.course?.price?.toLocaleString() || "0"}
                  </td>
                  <td
                    className={`border p-2 font-semibold ${
                      enroll.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {enroll.paymentStatus || "Pending"}
                  </td>
                  <td className="border p-2 text-center">
                    {enroll.paymentStatus === "Paid" ? (
                      <span className="text-gray-400">✔ Paid</span>
                    ) : (
                      <button
                        onClick={() => markAsPaid(enroll._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-3 text-gray-500 italic">
                  No records found.
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
