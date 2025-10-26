import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Enrolment() {
  const [courses, setCourses] = useState([]);
  const [step, setStep] = useState(1); // 1: Course Details, 2: Payment, 3: Final Enrollment
  const [formData, setFormData] = useState({
    courseId: "",
    phone: "",
    startingDate: "",
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
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

    // Check if payment was completed (coming back from OTP payment)
    const paymentCompleted = localStorage.getItem('paymentCompleted');
    
    if (paymentCompleted === 'true') {
      // ✅ Payment completed and enrollment auto-created, redirect to my-courses
      toast.success("🎉 Enrollment completed successfully!");
      
      // Clean up localStorage
      localStorage.removeItem('paymentCompleted');
      localStorage.removeItem('paymentData');
      localStorage.removeItem('enrollmentFormData');
      localStorage.removeItem('enrollmentStep');
      
      // Redirect to my courses
      setTimeout(() => {
        navigate("/my-courses");
      }, 1500);
    }
  }, [courses, navigate]); // Add courses and navigate as dependencies

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

  // 🚀 Handle form submission based on step
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      // Step 1: Validate course details and proceed to payment
      if (!formData.courseId || !formData.phone || !formData.startingDate) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      // Basic phone validation (supports + prefix and formatting characters)
      const phoneRegex = /^\+?[0-9\s\-()]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid phone number");
        return;
      }
      
      // Find selected course
      const course = courses.find(c => c._id === formData.courseId);
      if (!course) {
        toast.error("Selected course not found");
        return;
      }
      
      setSelectedCourse(course);
      setStep(2); // Move to payment step
      
    } else if (step === 2) {
      // Step 2: Handle payment (this will be handled by OTP payment component)
      // Enrollment is automatically created after successful payment
    }
  };


  // 🔙 Go back to previous step
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // 🧹 Cleanup function to remove localStorage data when component unmounts
  useEffect(() => {
    return () => {
      // Only clean up if we're not in the middle of a payment flow
      const enrollmentStep = localStorage.getItem('enrollmentStep');
      if (enrollmentStep !== '2') {
        localStorage.removeItem('enrollmentFormData');
        localStorage.removeItem('enrollmentStep');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">
                {step === 1 ? "🎓" : "💳"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {step === 1 ? "Course Enrollment" : "Payment"}
            </h1>
            <p className="text-gray-600">
              {step === 1 ? "Complete your enrollment in just a few steps" : 
               "Secure payment with OTP verification"}
            </p>
            
            {/* Progress Steps */}
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>1</div>
                <div className={`w-32 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>2</div>
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Step 1: Course Details */}
            {step === 1 && (
              <>
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
                        {course.title} - Rs. {course.price || 0} ({course.duration || '3 months'})
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

                {/* Starting Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preferred Starting Date
                  </label>
                  <input
                    type="date"
                    name="startingDate"
                    value={formData.startingDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When would you like to start this course?
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                >
                  Proceed to Payment
                </button>
              </>
            )}

            {/* Step 2: Payment */}
            {step === 2 && selectedCourse && (
              <>
                {/* Course Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Course Details</h3>
                  <p><strong>Course:</strong> {selectedCourse.title}</p>
                  <p><strong>Duration:</strong> {selectedCourse.duration || '3 months'}</p>
                  <p><strong>Starting Date:</strong> {new Date(formData.startingDate).toLocaleDateString()}</p>
                  <p><strong>Amount:</strong> Rs. {selectedCourse.price}</p>
                </div>

                {/* Payment Component */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Click below to proceed with secure OTP payment</p>
                  <button
                    type="button"
                    onClick={() => {
                      // Create a temporary enrollment object for payment
                      const tempEnrollment = {
                        _id: `temp_${Date.now()}`, // Temporary ID
                        course: {
                          _id: selectedCourse._id,
                          title: selectedCourse.title,
                          price: selectedCourse.price
                        }
                      };
                      
                      // Store enrollment data in localStorage for callback
                      localStorage.setItem('enrollmentFormData', JSON.stringify(formData));
                      localStorage.setItem('enrollmentStep', '2'); // Mark that we're in enrollment flow
                      
                      // Navigate to OTP payment with enrollment data
                      navigate("/otp-payment", { 
                        state: { 
                          enrollment: tempEnrollment,
                          enrollmentData: formData, // Pass enrollment form data
                          isEnrollmentFlow: true // Flag to indicate this is from enrollment
                        } 
                      });
                    }}
                    className="w-full py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                  >
                    💳 Pay with OTP Verification
                  </button>
                </div>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={goBack}
                  className="w-full py-2 rounded-lg transition-all duration-200 font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  ← Back to Course Details
                </button>
              </>
            )}

          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {step === 1 ? "After filling details, you'll proceed to payment" :
               "Complete payment to finish enrollment"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
