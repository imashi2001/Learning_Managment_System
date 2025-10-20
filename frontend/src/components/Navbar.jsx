import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Learning Managment System</h1>

      <div className="space-x-4 flex items-center">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/enrolment" className="hover:text-gray-300">Enrolment</Link>
        <Link to="/enrolments" className="hover:text-gray-300">Enrolment List</Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
