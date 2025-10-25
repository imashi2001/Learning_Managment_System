import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
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

    const fetchMyCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosClient.get("/enrollments/my-courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">LMS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EduLearn</h1>
            </Link>
            <nav className="flex space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Home
              </Link>
              <Link to="/student-home" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Browse Courses
              </Link>
              <Link to="/my-courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                My Courses
              </Link>
              <Link to="/payment" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Payments
              </Link>
              <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
              {userName && (
                <div className="flex items-center text-gray-600 px-4 py-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                    {userName ? userName.charAt(0).toUpperCase() : 'U'}
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

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">📘 My Enrolled Courses</h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600">You have not enrolled in any courses yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course._id} className="border rounded-lg mb-4 shadow-sm">
            {/* Header */}
            <button
              onClick={() => toggleExpand(course._id)}
              className="w-full flex justify-between items-center bg-gray-100 px-4 py-3 text-left font-semibold text-lg hover:bg-gray-200"
            >
              <span>
                {course.title}{" "}
                <span className="text-sm text-gray-500">({course.category})</span>
              </span>
              <span className="text-sm text-gray-600">
                {expanded === course._id ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {/* Expanded Content */}
            {expanded === course._id && (
              <div className="p-4 space-y-3">
                <p><strong>Description:</strong> {course.description}</p>
                <p><strong>Instructor:</strong> {course.instructor?.name || "TBA"}</p>
                <p><strong>Course Fee:</strong> Rs.{course.price}</p>
                
                {/* Payment Status */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div>
                    <p><strong>Payment Status:</strong></p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      course.paymentStatus === "Paid" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {course.paymentStatus === "Paid" ? "✅ Paid" : "⏳ Pending"}
                    </span>
                  </div>
                  
                  {course.paymentStatus !== "Paid" && (
                    <button
                      onClick={() => navigate("/otp-payment", { 
                        state: { 
                          enrollment: course 
                        } 
                      })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      💳 Pay Now
                    </button>
                  )}
                </div>

                {/* Modules Section */}
                <div className="mt-3">
                  <h4 className="font-semibold mb-2">Modules</h4>

                  {course.modules?.length > 0 ? (
                    <ul className="list-disc pl-6 text-gray-700 space-y-2">
                      {course.modules.map((mod) => (
                        <li
                          key={mod._id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <strong>{mod.title}</strong> ({mod.contentType})
                            {mod.contentUrl && (
                              <a
                                href={mod.contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-1"
                              >
                                [Open]
                              </a>
                            )}
                          </div>

                          {/* 📄 Download PDF Button */}
                          {mod.contentType === "pdf" && mod.contentUrl && (
                            <a
                              href={mod.contentUrl}
                              download
                              className="mt-1 md:mt-0 bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700 transition"
                            >
                              📄 Download PDF
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Modules not added yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
