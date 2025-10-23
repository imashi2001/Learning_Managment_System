import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex flex-wrap justify-between items-center shadow-md">
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => {
          if (role === "admin") navigate("/admin/dashboard");
          else if (role === "lecturer") navigate("/lecturer-dashboard");
          else if (role === "student") navigate("/my-courses");
          else navigate("/login");
        }}
      >
        Learning Management System
      </h1>

      <div className="flex flex-wrap gap-4 items-center">
        {/* ✅ Student Navigation */}
        {role === "student" && (
          <>
            <Link to="/enrolment" className="hover:text-gray-300">
              Enrolment
            </Link>
            <Link to="/payment" className="hover:text-gray-300">
              Payment
            </Link>
            <Link to="/my-courses" className="hover:text-gray-300">
              My Courses
            </Link>
          </>
        )}

        {/* ✅ Lecturer Navigation */}
        {role === "lecturer" && (
          <>
            <Link to="/lecturer-dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/lecturer-dashboard" className="hover:text-gray-300">
              My Students
            </Link>
          </>
        )}

        {/* ✅ Admin Navigation */}
        {role === "admin" && (
          <>
            <Link to="/admin/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/enrolments" className="hover:text-gray-300">
              Enrolment List
            </Link>
            <Link to="/payments" className="hover:text-gray-300">
              Payments
            </Link>
            <Link to="/reports" className="hover:text-gray-300">
              Reports
            </Link>
          </>
        )}

        {/* Logout Button */}
        {token ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
