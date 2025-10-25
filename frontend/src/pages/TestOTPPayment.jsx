import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function TestOTPPayment() {
  const navigate = useNavigate();
  const [testEnrollment] = useState({
    _id: "test-enrollment-id",
    course: {
      title: "Test Course",
      price: 1000
    },
    paymentStatus: "Pending"
  });

  const goToOTPPayment = () => {
    navigate("/otp-payment", { 
      state: { 
        enrollment: testEnrollment 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">LMS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EduLearn - Test OTP Payment</h1>
            </div>
            <button
              onClick={() => navigate("/my-courses")}
              className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Courses
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧪</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Test OTP Payment
          </h1>
          
          <p className="text-gray-600 mb-6">
            This is a test page to verify the OTP payment functionality.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Test Data:</h3>
            <p className="text-gray-700 mb-1">
              <strong>Course:</strong> {testEnrollment.course.title}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Amount:</strong> Rs. {testEnrollment.course.price}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong> {testEnrollment.paymentStatus}
            </p>
          </div>
          
          <button
            onClick={goToOTPPayment}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            🧪 Test OTP Payment Page
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            This will navigate to the OTP payment page with test data
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
