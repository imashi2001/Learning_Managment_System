import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

/**
 * OTPPayment Component
 * 
 * This component handles secure payment processing using OTP (One-Time Password) verification.
 * Features:
 * - Two-step payment flow (Generate OTP → Verify OTP)
 * - OTP sent to registered email address
 * - Timer countdown showing OTP expiration
 * - Limited OTP verification attempts (max 3)
 * - Support for both enrollment flow and regular payment flow
 * - Resend OTP functionality after expiration
 * - Automatic enrollment creation after successful payment
 * 
 * @function handleGenerateOTP - Generates and sends OTP to user's email
 * @function handleVerifyOTP - Verifies OTP and completes payment
 * @function handleResendOTP - Resends new OTP after expiration
 * @function formatTime - Formats seconds into MM:SS format
 */
export default function OTPPayment() {
  // State management for payment flow
  const [step, setStep] = useState(1); // 1: Generate OTP, 2: Verify OTP
  const [paymentData, setPaymentData] = useState(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Timer countdown in seconds
  const [attemptsLeft, setAttemptsLeft] = useState(3); // Remaining OTP attempts
  const navigate = useNavigate();
  const location = useLocation();

  // Get enrollment data from navigation state
  const enrollmentData = location.state?.enrollment;
  const enrollmentFormData = location.state?.enrollmentData;
  const isEnrollmentFlow = location.state?.isEnrollmentFlow;

  useEffect(() => {
    if (!enrollmentData) {
      toast.error("No enrollment data found. Please try again.");
      navigate("/my-courses");
      return;
    }
    
    // Debug: Log enrollment data
    console.log("Enrollment data:", enrollmentData);
  }, [enrollmentData, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Generate OTP
  const handleGenerateOTP = async () => {
    if (!enrollmentData) return;

    console.log("Generating OTP for enrollment:", enrollmentData._id);
    setIsLoading(true);
    try {
      let response;
      
      // Check if this is from enrollment flow
      if (isEnrollmentFlow && enrollmentFormData) {
        response = await axiosClient.post("/payments/generate-enrollment-otp", {
          courseId: enrollmentData.course._id,
          paymentMethod: "card",
          enrollmentData: enrollmentFormData
        });
      } else {
        // Normal payment flow
        response = await axiosClient.post("/payments/generate-otp", {
          enrollmentId: enrollmentData._id,
          paymentMethod: "card"
        });
      }

      console.log("OTP response:", response.data);
      setPaymentData({
        paymentId: response.data.paymentId,
        expiresIn: response.data.expiresIn
      });
      
      setTimeLeft(response.data.expiresIn);
      setStep(2);
      toast.success("OTP sent to your email! Please check your inbox.");
    } catch (error) {
      console.error("OTP generation error:", error);
      toast.error(error.response?.data?.message || "Failed to generate OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    if (!paymentData || !otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/payments/verify-otp", {
        paymentId: paymentData.paymentId,
        otp: otp
      });

      toast.success("Payment completed successfully!",response);
      
      // ✅ Navigate to my-courses for both flows (enrollment is auto-created)
      setTimeout(() => {
        navigate("/my-courses", { 
          state: { 
            message: "Payment completed successfully! You now have access to your course." 
          }
        });
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to verify OTP";
      toast.error(errorMessage);
      
      // Update attempts left if provided
      if (error.response?.data?.attemptsLeft !== undefined) {
        setAttemptsLeft(error.response.data.attemptsLeft);
      }
      
      // Clear OTP input
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!paymentData) return;

    setIsLoading(true);
    try {
      const response = await axiosClient.post("/payments/resend-otp", {
        paymentId: paymentData.paymentId
      });

      setTimeLeft(response.data.expiresIn);
      setAttemptsLeft(3); // Reset attempts
      setOtp(""); // Clear current OTP
      toast.success("New OTP sent to your email!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!enrollmentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-100">
          
          {/* Step 1: Generate OTP */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔐</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Secure Payment
                </h1>
                <p className="text-gray-600">
                  Complete your payment with OTP verification
                </p>
              </div>

              {/* Course Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Course Details</h3>
                <p className="text-gray-700 mb-1">
                  <strong>Course:</strong> {enrollmentData.course?.title}
                </p>
                <p className="text-gray-700 mb-1">
                  <strong>Amount:</strong> Rs. {enrollmentData.course?.price || 0}
                </p>
                <p className="text-gray-700">
                  <strong>Payment Method:</strong> Card
                </p>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Security Notice:</strong> We'll send a 6-digit OTP to your registered email address for payment verification.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateOTP}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                  isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP to Email'
                )}
              </button>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📧</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Enter OTP
                </h1>
                <p className="text-gray-600">
                  Check your email and enter the 6-digit code
                </p>
              </div>

              {/* Timer */}
              {timeLeft > 0 && (
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-semibold">
                      OTP expires in: {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              )}

              {/* Attempts Left */}
              {attemptsLeft < 3 && (
                <div className="text-center mb-4">
                  <div className="inline-flex items-center px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-700 text-sm">
                      Attempts left: {attemptsLeft}
                    </span>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  placeholder="123456"
                  className="w-full p-4 text-center text-2xl font-mono border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all tracking-widest"
                  maxLength="6"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={isLoading || otp.length !== 6 || timeLeft === 0}
                  className={`w-full py-3 rounded-lg transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                    isLoading || otp.length !== 6 || timeLeft === 0
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Complete Payment'
                  )}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={isLoading || timeLeft > 0}
                  className={`w-full py-2 rounded-lg transition-all duration-200 font-medium ${
                    isLoading || timeLeft > 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend OTP'}
                </button>
              </div>

              {/* Back Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  ← Back to Payment Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
