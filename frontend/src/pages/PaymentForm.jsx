import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";

export default function PaymentForm() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");

  // 🧠 Fetch all pending enrollments for the logged-in student
  useEffect(() => {
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
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
  );
}
