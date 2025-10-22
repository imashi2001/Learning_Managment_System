import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Enrolment from "./pages/Enrolment";
import EnrolmentList from "./pages/EnrolmentList";
import PaymentForm from "./pages/PaymentForm";
import PaymentList from "./pages/PaymentList";
import Reports from "./pages/Reports"; // if you already have reports page

function App() {
  return (
    <Routes>
      {/* 🏠 Home (Protected) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Home />
            </>
          </ProtectedRoute>
        }
      />

      {/* 🧾 Enrolment (Student View) */}
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

      {/* 📋 Enrolment List (Admin View) */}
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

      {/* 💳 Payment Form (Student View) */}
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

      {/* 🧾 Payment List (Admin View) */}
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

      {/* 📊 Reports (Admin View — optional) */}
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
