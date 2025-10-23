import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const paid = enrollments.filter((e) => e.paymentStatus === "Paid").length;
  const pending = enrollments.filter((e) => e.paymentStatus !== "Paid").length;

  const pieData = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
  ];

  const COLORS = ["#10B981", "#F59E0B"];

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
  );
}
