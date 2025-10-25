import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

export default function LecturerDashboard() {
  const [courses, setCourses] = useState([]);
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [error, setError] = useState("");
  const [moduleForm, setModuleForm] = useState({ title: "", contentType: "text", contentUrl: "" });
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

    const fetchLecturerData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch assigned courses
        const resCourses = await axiosClient.get("/lecturer/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(resCourses.data);

        // Fetch enrolled students
        const resStudents = await axiosClient.get("/lecturer/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Group students by course
        const grouped = {};
        resStudents.data.forEach((enroll) => {
          const courseId = enroll.course?._id;
          if (!grouped[courseId]) grouped[courseId] = [];
          grouped[courseId].push(enroll);
        });
        setStudentsByCourse(grouped);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load lecturer data");
      }
    };

    fetchLecturerData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  const handleAddModule = async (courseId) => {
    const { title, contentType, contentUrl } = moduleForm;
    if (!title.trim() || !contentUrl.trim()) {
      toast.warn("Please fill in all module details");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.post(
        `/lecturer/courses/${courseId}/modules`,
        { title, contentType, contentUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, modules: [...(c.modules || []), res.data.module] }
            : c
        )
      );

      setModuleForm({ title: "", contentType: "text", contentUrl: "" });
      toast.success("✅ Module added successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add module");
    }
  };

  const handleDeleteModule = async (courseId, moduleId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/lecturer/courses/${courseId}/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId
            ? { ...c, modules: c.modules.filter((m) => m._id !== moduleId) }
            : c
        )
      );

      toast.success("🗑️ Module deleted successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete module");
    }
  };

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

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
              <Link to="/lecturer-dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                Dashboard
              </Link>
              <Link to="/my-courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                My Courses
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
        <h1 className="text-2xl font-bold mb-6 text-center">🎓 Lecturer Dashboard</h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-600">No courses assigned yet.</p>
      ) : (
        courses.map((course) => (
          <div key={course._id} className="border rounded-lg mb-4 shadow-sm">
            {/* Course Header */}
            <button
              onClick={() => toggleCourse(course._id)}
              className="w-full flex justify-between items-center bg-gray-100 px-4 py-3 text-left font-semibold text-lg hover:bg-gray-200"
            >
              <span>
                {course.title}{" "}
                <span className="text-sm text-gray-500">({course.category})</span>
              </span>
              <span className="text-sm text-gray-600">
                {expandedCourse === course._id ? "▲ Hide" : "▼ Show"}
              </span>
            </button>

            {/* Expanded section */}
            {expandedCourse === course._id && (
              <div className="p-4 space-y-4">
                <p className="text-gray-700">
                  <strong>Course Fee:</strong> Rs.{course.price || 0}
                </p>

                {/* Add Module Form */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-2">Add New Module</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Module Title"
                      value={moduleForm.title}
                      onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                      className="border p-2 rounded w-full"
                    />
                    <select
                      value={moduleForm.contentType}
                      onChange={(e) => setModuleForm({ ...moduleForm, contentType: e.target.value })}
                      className="border p-2 rounded w-full"
                    >
                      <option value="text">Text</option>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="link">Link</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Content URL"
                      value={moduleForm.contentUrl}
                      onChange={(e) => setModuleForm({ ...moduleForm, contentUrl: e.target.value })}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  <button
                    onClick={() => handleAddModule(course._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    ➕ Add Module
                  </button>
                </div>

                {/* Module List */}
                {course.modules?.length > 0 && (
                  <div className="mt-4">
                    <h5 className="font-semibold mb-1">Existing Modules:</h5>
                    <ul className="list-disc pl-6 text-gray-700 space-y-1">
                      {course.modules.map((m) => (
                        <li key={m._id} className="flex justify-between items-center">
                          <span>
                            {m.title} ({m.contentType})
                          </span>
                          <button
                            onClick={() => handleDeleteModule(course._id, m._id)}
                            className="text-red-600 text-sm hover:underline"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enrolled Students */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Enrolled Students</h4>
                  {studentsByCourse[course._id]?.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-2">Name</th>
                          <th className="border p-2">Email</th>
                          <th className="border p-2">Batch</th>
                          <th className="border p-2">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsByCourse[course._id].map((enroll) => (
                          <tr key={enroll._id} className="hover:bg-gray-50">
                            <td className="border p-2">{enroll.student?.name}</td>
                            <td className="border p-2">{enroll.student?.email}</td>
                            <td className="border p-2">{enroll.batch}</td>
                            <td className="border p-2">{enroll.paymentStatus || "Pending"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-gray-500">No students enrolled yet.</p>
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
