import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function EnrolmentList() {
  const [enrolments, setEnrolments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized access — please log in again.");
          setLoading(false);
          return;
        }

        // Decode token to check role
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;

        const endpoint =
          role === "admin"
            ? "/enrollments"
            : "/enrollments/my-enrollments";

        const res = await axiosClient.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEnrolments(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load enrolments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let data = [...enrolments];

    // Search by name or email
    if (search.trim() !== "") {
      data = data.filter(
        (e) =>
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          e.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by course
    if (courseFilter !== "") {
      data = data.filter(
        (e) =>
          e.course?.title === courseFilter ||
          e.course === courseFilter
      );
    }

    // Filter by payment status
    if (paymentFilter !== "") {
      data = data.filter((e) => e.paymentStatus === paymentFilter);
    }

    setFiltered(data);
  }, [search, courseFilter, paymentFilter, enrolments]);

  if (loading)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  
  if (error)
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-6xl mx-auto mt-10 bg-white shadow-md p-6 rounded-lg mb-10">
        <h1 className="text-2xl font-bold mb-4 text-center">Enrolments</h1>

      {/* 🔎 Search and Filters */}
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
          <option value="Network Design">Network Design</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Payment Status</option>
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* 📋 Table */}
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Student Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Course</th>
            <th className="border p-2">Course ID</th>
            <th className="border p-2">Batch</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((e, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border p-2">{e.name || "N/A"}</td>
                <td className="border p-2">{e.email || "N/A"}</td>
                <td className="border p-2">
                  {e.course?.title || e.course || "N/A"}
                </td>
                <td className="border p-2">{e.courseId || "N/A"}</td>
                <td className="border p-2">{e.batch || "N/A"}</td>
                <td className="border p-2">{e.phone || "N/A"}</td>
                <td className="border p-2">{e.paymentStatus || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-3 text-gray-500 italic">
                No enrolments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      
      <Footer />
    </div>
  );
}
