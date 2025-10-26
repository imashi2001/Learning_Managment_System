import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function PaymentList() {
  const [enrollments, setEnrollments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [animate, setAnimate] = useState(false);

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalStudents: 0,
  });

  useEffect(() => {
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

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600">Loading payments...</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">💰 Student Payments</h1>
            <p className="text-gray-600 mt-2">Manage and track student payment status</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-6 rounded-lg text-center shadow-md border transition-all duration-500 ${
                animate
                  ? "bg-green-200 text-green-900 scale-105"
                  : "bg-green-100 text-green-800"
              }`}
            >
              <h3 className="font-bold text-lg mb-2">Total Revenue</h3>
              <p className="text-3xl font-semibold">
                Rs.{stats.totalPaid.toLocaleString()}
              </p>
            </div>

            <div className="bg-yellow-100 text-yellow-800 p-6 rounded-lg text-center shadow-md border">
              <h3 className="font-bold text-lg mb-2">Pending Amount</h3>
              <p className="text-3xl font-semibold">
                Rs.{stats.totalPending.toLocaleString()}
              </p>
            </div>

            <div className="bg-blue-100 text-blue-800 p-6 rounded-lg text-center shadow-md border">
              <h3 className="font-bold text-lg mb-2">Total Students</h3>
              <p className="text-3xl font-semibold">{stats.totalStudents}</p>
            </div>
          </div>

          {/* Payment Table Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">📋 Payment Records</h2>
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-3 font-semibold text-gray-700">Student</th>
                    <th className="border p-3 font-semibold text-gray-700">Email</th>
                    <th className="border p-3 font-semibold text-gray-700">Course</th>
                    <th className="border p-3 font-semibold text-gray-700">Batch</th>
                    <th className="border p-3 font-semibold text-gray-700">Phone</th>
                    <th className="border p-3 font-semibold text-gray-700">Amount</th>
                    <th className="border p-3 font-semibold text-gray-700">Status</th>
                    <th className="border p-3 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length > 0 ? (
                    filtered.map((enroll) => (
                      <tr key={enroll._id} className="hover:bg-gray-50 transition-colors">
                        <td className="border p-3 font-medium">{enroll.student?.name}</td>
                        <td className="border p-3">{enroll.student?.email}</td>
                        <td className="border p-3">{enroll.course?.title}</td>
                        <td className="border p-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {enroll.batch || "-"}
                          </span>
                        </td>
                        <td className="border p-3">{enroll.phone || "-"}</td>
                        <td className="border p-3 font-semibold text-green-600">
                          Rs.{enroll.course?.price?.toLocaleString() || "0"}
                        </td>
                        <td className="border p-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            enroll.paymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {enroll.paymentStatus === "Paid" ? "✅ Paid" : "⏳ Pending"}
                          </span>
                        </td>
                        <td className="border p-3 text-center">
                          {enroll.paymentStatus === "Paid" ? (
                            <span className="text-green-600 font-semibold">✓ Paid</span>
                          ) : (
                            <button
                              onClick={() => markAsPaid(enroll._id)}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center p-6 text-gray-500 italic">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
