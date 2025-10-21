import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // Get user role from JWT (if logged in)
  const token = localStorage.getItem("token");
  let role = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      role = payload.role;
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Learning Management System</h1>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-gray-300">Home</Link>

        {/* Common Links */}
        <Link to="/enrolment" className="hover:text-gray-300">Enrolment</Link>

        {/* Student-specific link */}
        {role === "student" && (
          <Link to="/payment" className="hover:text-gray-300">Payment</Link>
        )}

        {/* Admin-specific links */}
        {role === "admin" && (
          <>
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
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
