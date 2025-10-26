import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserName(decoded.name);
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // 🎯 Role-based navigation links
  const getNavLinks = () => {
    if (userRole === "admin") {
      return [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Manage Courses", path: "/course-manager" },
        { name: "Enrollments", path: "/admin/enrollments" },
        { name: "Payments", path: "/admin/payments" },
        { name: "Reports", path: "/admin/reports" },
      ];
    } else if (userRole === "lecturer") {
      return [
        { name: "Home", path: "/dashboard" },
        { name: "Dashboard", path: "/lecturer-dashboard" },
      ];
    } else if (userRole === "student") {
      return [
        { name: "Home", path: "/dashboard" },
        { name: "Browse Courses", path: "/student-home" },
        { name: "My Courses", path: "/my-courses" },
        { name: "Profile", path: "/profile" },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">LMS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EduLearn</h1>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
            
            {userName && (
              <div className="flex items-center text-gray-600 px-4 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <span>Welcome, {userName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
