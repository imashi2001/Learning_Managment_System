import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Enrolment from "./pages/Enrolment";
import EnrolmentList from "./pages/EnrolmentList";
import PaymentForm from "./pages/PaymentForm";
import PaymentList from "./pages/PaymentList";
import Reports from "./pages/Reports";
import LecturerDashboard from "./pages/LecturerDashboard";
import AssignCourses from "./pages/AssignCourses";
import MyCourses from "./pages/MyCourses";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* ✅ Default route: detect role in Navbar and redirect */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="text-center mt-10 text-gray-700">
                <h2>Welcome to Learning Management System</h2>
                <p>Select your role’s dashboard from the navigation bar.</p>
              </div>
            </>
          </ProtectedRoute>
        }
      />

      {/* 👩‍🎓 Student Routes */}
      <Route
        path="/enrolment"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Enrolment />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <PaymentForm />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <MyCourses />
            </>
          </ProtectedRoute>
        }
      />

      {/* 👨‍🏫 Lecturer Routes */}
      <Route
        path="/lecturer-dashboard"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <LecturerDashboard />
            </>
          </ProtectedRoute>
        }
      />

      {/* 🧑‍💼 Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <AdminDashboard />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/assign-courses"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <AssignCourses />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/enrolments"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <EnrolmentList />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <PaymentList />
            </>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Reports />
            </>
          </ProtectedRoute>
        }
      />

      {/* 🔐 Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
