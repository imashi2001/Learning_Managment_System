import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Enrolment() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
    courseId: "",
    batch: "",
    phone: "",
    paymentStatus: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const res = await axiosClient.post(
        "/enrollments",
        { ...formData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Enrolment successful ✅");
      setFormData({
        name: "",
        email: "",
        course: "",
        courseId: "",
        batch: "",
        phone: "",
        paymentStatus: "",
      });
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
          "Enrolment failed. Please try again."
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Student Enrolment</h1>

      {message && (
        <p className="text-center mb-4 text-blue-600 font-medium">{message}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Student Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Student Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Course Selection</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Course</option>
            <option value="IT Fundamentals">IT Fundamentals</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Database Management">Database Management</option>
            <option value="Network Design">Network Design</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Course ID</label>
          <input
            type="text"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Batch</label>
          <select
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Batch</option>
            <option value="Y1S1">Y1S1</option>
            <option value="Y1S2">Y1S2</option>
            <option value="Y2S1">Y2S1</option>
            <option value="Y2S2">Y2S2</option>
            <option value="Y3S1">Y3S1</option>
            <option value="Y3S2">Y3S2</option>
            <option value="Y4S1">Y4S1</option>
            <option value="Y4S2">Y4S2</option>
          </select>
        </div>

        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Status</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit Enrolment
        </button>
      </form>
    </div>
  );
}
