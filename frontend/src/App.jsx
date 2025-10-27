import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout"; // 🆕 Layout with sidebar

// 📄 Pages
import Landing from "./pages/Landing"; // 🆕 New Landing page
import Home from "./pages/Home"; // 🆕 Dashboard Home page
import Enrolment from "./pages/Enrolment";
import EnrolmentList from "./pages/EnrolmentList";
import PaymentForm from "./pages/PaymentForm";
import PaymentList from "./pages/PaymentList";
import Reports from "./pages/Reports";
import LecturerDashboard from "./pages/LecturerDashboard";
import AssignCourses from "./pages/AssignCourses";
import MyCourses from "./pages/MyCourses";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CourseManager from "./pages/CourseManager"; // new page for admin (add/edit courses)
import StudentHome from "./pages/StudentHome";
import UserProfile from "./pages/UserProfile"; // User Profile page
import OTPPayment from "./pages/OTPPayment"; // OTP Payment page
import TestOTPPayment from "./pages/TestOTPPayment"; // Test OTP Payment page
function App() {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 🔐 Protected Dashboard Route */}
      <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />

      {/* 🔐 Protected Routes - Standalone Pages */}
      <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/enrolment" element={<ProtectedRoute><Enrolment /></ProtectedRoute>} />
      <Route path="/payment" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />
      <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
      <Route path="/student-home" element={<ProtectedRoute><StudentHome /></ProtectedRoute>} />
      <Route path="/lecturer-dashboard" element={<ProtectedRoute><LecturerDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/assign-courses" element={<ProtectedRoute><AssignCourses /></ProtectedRoute>} />
      <Route path="/enrolments" element={<ProtectedRoute><EnrolmentList /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><PaymentList /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/courses" element={<ProtectedRoute><CourseManager /></ProtectedRoute>} />
      <Route path="/course-manager" element={<ProtectedRoute><CourseManager /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute><CourseManager /></ProtectedRoute>} />
      <Route path="/admin/enrollments" element={<ProtectedRoute><EnrolmentList /></ProtectedRoute>} />
      <Route path="/admin/payments" element={<ProtectedRoute><PaymentList /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/otp-payment" element={<ProtectedRoute><OTPPayment /></ProtectedRoute>} />
      <Route path="/test-otp-payment" element={<ProtectedRoute><TestOTPPayment /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
