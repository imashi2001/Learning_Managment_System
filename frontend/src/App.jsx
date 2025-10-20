import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Enrolment from "./pages/Enrolment";
import EnrolmentList from "./pages/EnrolmentList";

function App() {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <>
              <Navbar />
              <h1 className="text-center mt-10">Home Page (Protected)</h1>
            </>
          </ProtectedRoute>
        }
      />

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


      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
