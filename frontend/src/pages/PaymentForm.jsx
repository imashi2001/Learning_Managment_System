import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

export default function PaymentForm() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch user info and enrollments
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

        // Filter only Pending payments
        const pending = res.data.filter(
          (e) => e.paymentStatus === "Pending" || !e.paymentStatus
        );

        setEnrollments(pending);
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

  // 💳 Simulate payment process
  const handlePayment = async () => {
    if (!selected) {
      toast.warn("Please select a course to pay for.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(
        `/enrollments/${selected}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Payment successful!");
      setEnrollments((prev) => prev.filter((e) => e._id !== selected));
      setSelected("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
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
      <div className="flex-1 flex justify-center items-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-6 text-center">💳 Payment Portal</h2>

        {enrollments.length === 0 ? (
          <p className="text-center text-gray-600">
            You have no pending payments.
          </p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select Course</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Select Pending Course --</option>
                {enrollments.map((enroll) => (
                  <option key={enroll._id} value={enroll._id}>
                    {enroll.course?.title} — Rs.{enroll.course?.price || 0}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePayment}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
            >
              Pay Now
            </button>
          </>
        )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
