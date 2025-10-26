import { Outlet, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function DashboardLayout() {
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      role = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 space-y-6">
        <h1 className="text-xl font-bold border-b border-blue-700 pb-3">
          Learning Management System
        </h1>

        <nav className="space-y-3">
          {/* Home Link */}
          <Link to="/dashboard" className="block hover:text-gray-300 font-semibold">
            🏠 Home
          </Link>
          
          {/* Student Links */}
          {role === "student" && (
            <>
              <Link to="/student-home" className="hover:text-gray-300">
                Browse Courses
              </Link>
              <Link to="/student-dashboard" className="block hover:text-gray-300">
                Dashboard
              </Link>
              <Link to="/enrolment" className="block hover:text-gray-300">
                Enrol Course
              </Link>
              <Link to="/my-courses" className="block hover:text-gray-300">
                My Courses
              </Link>
              <Link to="/payment" className="block hover:text-gray-300">
                Payments
              </Link>
            </>
          )}

          {/* Lecturer Links */}
          {role === "lecturer" && (
            <>
              <Link to="/lecturer-dashboard" className="block hover:text-gray-300">
                Lecturer Dashboard
              </Link>
            </>
          )}

          {/* Admin Links */}
          {role === "admin" && (
            <>
              <Link to="/admin/dashboard" className="block hover:text-gray-300">
                Admin Dashboard
              </Link>
  
              <Link to="/courses" className="block hover:text-gray-300">
                Manage Courses
              </Link>
              <Link to="/enrolments" className="block hover:text-gray-300">
                Enrolments
              </Link>
              <Link to="/payments" className="block hover:text-gray-300">
                Payments
              </Link>
              
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-100 p-6">
        <Outlet />
      </main>
    </div>
  );
}
