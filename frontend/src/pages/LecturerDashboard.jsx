import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function LecturerDashboard() {
  const [courses, setCourses] = useState([]);
  const [studentsByCourse, setStudentsByCourse] = useState({});
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [error, setError] = useState("");
  const [moduleForm, setModuleForm] = useState({ title: "", contentType: "text", contentUrl: "" });
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");

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

  if (error) return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">🎓 Lecturer Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your courses, modules, and enrolled students</p>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600 text-lg">No courses assigned yet.</p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
                {/* Course Header */}
                <button
                  onClick={() => toggleCourse(course._id)}
                  className="w-full flex justify-between items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 text-left font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <div className="font-bold">{course.title}</div>
                      <div className="text-sm font-normal opacity-90">{course.category}</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium">
                    {expandedCourse === course._id ? "▲ Hide Details" : "▼ Show Details"}
                  </span>
                </button>

                {/* Expanded section */}
                {expandedCourse === course._id && (
                  <div className="p-6 space-y-6">
                    {/* Course Info */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Course Fee</span>
                          <p className="text-2xl font-bold text-green-600">Rs.{course.price || 0}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-sm text-gray-600">Duration</span>
                          <p className="text-lg font-semibold text-blue-700">{course.duration || "3 months"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Module Form */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border border-green-200">
                      <h4 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                        <span className="text-xl">➕</span>
                        Add New Module
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <input
                          type="text"
                          placeholder="Module Title"
                          value={moduleForm.title}
                          onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-green-400"
                        />
                        <select
                          value={moduleForm.contentType}
                          onChange={(e) => setModuleForm({ ...moduleForm, contentType: e.target.value })}
                          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-green-400"
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
                          className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-green-400"
                        />
                      </div>
                      <button
                        onClick={() => handleAddModule(course._id)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        ➕ Add Module
                      </button>
                    </div>

                    {/* Module List */}
                    {course.modules?.length > 0 && (
                      <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                        <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                          <span className="text-xl">📚</span>
                          Existing Modules ({course.modules.length})
                        </h5>
                        <div className="grid gap-2">
                          {course.modules.map((m) => (
                            <div key={m._id} className="bg-white p-3 rounded-lg border flex justify-between items-center hover:shadow-sm transition">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">
                                  {m.contentType === "video" ? "🎥" : m.contentType === "pdf" ? "📄" : m.contentType === "link" ? "🔗" : "📝"}
                                </span>
                                <div>
                                  <span className="font-medium text-gray-800">{m.title}</span>
                                  <span className="ml-2 text-sm text-gray-500">({m.contentType})</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteModule(course._id, m._id)}
                                className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition text-sm"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enrolled Students */}
                    <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        Enrolled Students ({studentsByCourse[course._id]?.length || 0})
                      </h4>
                      {studentsByCourse[course._id]?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="border p-3 font-semibold text-gray-700">Name</th>
                                <th className="border p-3 font-semibold text-gray-700">Email</th>
                                <th className="border p-3 font-semibold text-gray-700">Batch</th>
                                <th className="border p-3 font-semibold text-gray-700">Payment Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentsByCourse[course._id].map((enroll) => (
                                <tr key={enroll._id} className="hover:bg-gray-50 transition-colors">
                                  <td className="border p-3 font-medium">{enroll.student?.name}</td>
                                  <td className="border p-3">{enroll.student?.email}</td>
                                  <td className="border p-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                      {enroll.batch}
                                    </span>
                                  </td>
                                  <td className="border p-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      enroll.paymentStatus === "Paid" 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}>
                                      {enroll.paymentStatus === "Paid" ? "✅ Paid" : "⏳ Pending"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No students enrolled yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
