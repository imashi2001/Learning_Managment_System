import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    studentName: "",
    studentEmail: "",
    course: "",
    amount: "",
    paymentMethod: "",
    paymentStatus: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.post("/payments", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(res.data.message || "Payment recorded successfully!");
      setFormData({
        studentName: "",
        studentEmail: "",
        course: "",
        amount: "",
        paymentMethod: "",
        paymentStatus: "",
      });
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Payment Form
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Name */}
        <div>
          <label className="block font-medium mb-1">Student Name</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Student Email */}
        <div>
          <label className="block font-medium mb-1">Student Email</label>
          <input
            type="email"
            name="studentEmail"
            value={formData.studentEmail}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Course */}
        <div>
          <label className="block font-medium mb-1">Course</label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select Course</option>
            <option value="IT Fundamentals">IT Fundamentals</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="Database Management">Database Management</option>
            <option value="Network Design">Network Design</option>
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block font-medium mb-1">Amount (LKR)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-medium mb-1">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select Method</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block font-medium mb-1">Payment Status</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">Select Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } text-white font-semibold py-2 rounded transition`}
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>

        {message && (
          <p className="text-center mt-4 font-medium text-green-700">{message}</p>
        )}
      </form>
    </div>
  );
}
