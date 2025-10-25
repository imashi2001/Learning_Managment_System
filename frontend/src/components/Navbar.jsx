import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [userRole, setUserRole] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🎯 Role-based links
  const navLinks = {
    admin: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Assign Courses", path: "/assign-courses" },
      { name: "Enrolments", path: "/enrolments" },
      { name: "Payments", path: "/payments" },
      { name: "Reports", path: "/reports" },
      { name: "Manage Users", path: "/users" },
    ],
    lecturer: [
      { name: "Dashboard", path: "/lecturer-dashboard" },
      { name: "My Courses", path: "/my-courses" },
    ],
    student: [
      { name: "Dashboard", path: "/student/dashboard" },
      { name: "Enrolment", path: "/enrolment" },
      { name: "My Courses", path: "/my-courses" },
      { name: "Payment", path: "/payment" },
    ],
  };

  const currentLinks = navLinks[userRole] || [];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white w-64 flex flex-col transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1
            className={`font-bold text-lg tracking-wide ${
              isCollapsed ? "hidden" : "block"
            }`}
          >
            Learning Management System
          </h1>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white text-xl focus:outline-none"
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-4 space-y-2">
          {currentLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center px-6 py-2 text-sm font-medium transition-colors duration-200 hover:bg-blue-700 ${
                location.pathname === link.path
                  ? "bg-blue-700 border-l-4 border-blue-400"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              {!isCollapsed && <span>{link.name}</span>}
              {isCollapsed && (
                <div className="mx-auto text-center">{link.name[0]}</div>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 py-2 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        {/* Blue highlight line under the heading */}
        <div className="border-b-4 border-blue-600 mb-6 pb-2">
          <h2 className="text-2xl font-semibold text-gray-800">
            {document.title || "Learning Management System"}
          </h2>
        </div>

        {/* Children (page content will render here) */}
      </main>
    </div>
  );
}
