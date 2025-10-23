import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Enrolment() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    batch: "",
    phone: "",
  });
  const navigate = useNavigate();

  // 🧠 Auto-fetch student info silently (name/email from token, no input fields)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      jwtDecode(token); // We don’t need to store student info here
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }, []);

  // 📚 Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("/courses");
        setCourses(res.data);
      } catch (error) {
        toast.error("Failed to load courses",error);
      }
    };
    fetchCourses();
  }, []);

  // 📋 Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 Submit enrollment
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosClient.post(
        "/enrollments",
        {
          courseId: formData.courseId,
          batch: formData.batch,
          phone: formData.phone,
          paymentStatus: "Pending", // ✅ Set automatically
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Enrolment successful! Please proceed to payment.");
      navigate("/payment"); // ✅ Redirect student to payment page
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrolment failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Enrolment
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Course Selection */}
          <div>
            <label className="block text-gray-700 mb-1">Course</label>
            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title} – Rs.{course.price || 0}
                </option>
              ))}
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-gray-700 mb-1">Batch</label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="">-- Select Batch --</option>
              <option>Y1S1</option>
              <option>Y1S2</option>
              <option>Y2S1</option>
              <option>Y2S2</option>
              <option>Y3S1</option>
              <option>Y3S2</option>
              <option>Y4S1</option>
              <option>Y4S2</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Enrolment
          </button>
        </form>
      </div>
    </div>
  );
}
