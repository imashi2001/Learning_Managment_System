import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get("/payments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    let data = [...payments];
    if (search.trim() !== "") {
      data = data.filter(
        (p) =>
          p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
          p.studentEmail?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (courseFilter !== "") data = data.filter((p) => p.course === courseFilter);
    if (statusFilter !== "") data = data.filter((p) => p.paymentStatus === statusFilter);
    setFiltered(data);
  }, [search, courseFilter, statusFilter, payments]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (error)
    return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Payment Records
      </h1>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Courses</option>
          <option value="IT Fundamentals">IT Fundamentals</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Database Management">Database Management</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* 📋 Table */}
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Amount (LKR)</th>
            <th className="border p-2">Method</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((p, i) => (
              <tr key={i} className="hover:bg-gray-100">
                <td className="border p-2">{p.studentName}</td>
                <td className="border p-2">{p.studentEmail}</td>
                <td className="border p-2">{p.course}</td>
                <td className="border p-2">{p.amount}</td>
                <td className="border p-2">{p.paymentMethod}</td>
                <td
                  className={`border p-2 font-semibold ${
                    p.paymentStatus === "Paid" ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {p.paymentStatus}
                </td>
                <td className="border p-2">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-3 text-gray-500 italic">
                No payment records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
