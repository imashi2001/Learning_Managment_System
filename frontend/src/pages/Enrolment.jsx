import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "../components/Footer";

export default function Enrolment() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseId: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // 🧠 Auto-fetch student info silently (name/email from token, no input fields)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      jwtDecode(token); // We don't need to store student info here
    } catch (err) {
      console.error("Invalid token:", err);
    }

    // Auto-select course if coming from StudentHome
    const selectedCourseId = localStorage.getItem("selectedCourseId");
    if (selectedCourseId) {
      setFormData(prev => ({ ...prev, courseId: selectedCourseId }));
      localStorage.removeItem("selectedCourseId"); // Clean up
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
    
    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axiosClient.post(
        "/enrollments",
        {
          courseId: formData.courseId,
          phone: formData.phone,
          paymentStatus: "Pending", // ✅ Set automatically
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("🎉 Enrollment successful! Redirecting to payment...");
      setTimeout(() => {
        navigate("/student-home"); // ✅ Redirect back to student home to see updated status
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Enrollment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎓</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Course Enrollment
            </h1>
            <p className="text-gray-600">
              Complete your enrollment in just a few steps
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Course
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              >
                <option value="">-- Choose a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} - Rs. {course.price || 0}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this to contact you about your enrollment
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                isSubmitting
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Complete Enrollment'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              After enrollment, you'll be redirected to the payment page
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
