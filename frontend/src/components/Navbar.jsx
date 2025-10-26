import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 🎯 Role-based navigation links
  const getNavLinks = () => {
    if (userRole === "admin") {
      return [
        { name: "Home", path: "/dashboard" },
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
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 overflow-visible">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 relative">
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">LMS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">EduLearn</h1>
          </Link>
          
          <nav className="flex items-center space-x-1 relative">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="relative z-10">{link.name}</span>
                  
                  {/* Active indicator - Gradient underline */}
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-t-full animate-pulse"></div>
                  )}
                  
                  {/* Hover effect */}
                  {!active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
                  )}
                </Link>
              );
            })}
            
            {/* Profile Dropdown */}
            <div className="profile-dropdown relative ml-4" style={{ minWidth: '48px', minHeight: '48px' }}>
              <button
                onClick={toggleDropdown}
                className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="button"
                aria-label="Profile menu"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-base font-semibold relative ring-2 ring-blue-200 hover:ring-blue-300 transition-all shadow-md">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                  <svg 
                    className={`w-3 h-3 absolute -bottom-0.5 -right-0.5 text-blue-600 bg-white rounded-full transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[60] animate-fadeIn" style={{ top: '100%' }}>
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{userName || "User"}</p>
                      <p className="text-xs text-gray-500 capitalize">{userRole || "Unknown"}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
