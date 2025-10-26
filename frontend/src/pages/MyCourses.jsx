import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

/**
 * MyCourses Component
 * 
 * This component displays all courses that a student has enrolled in.
 * Features:
 * - Display enrollment statistics (Total, Paid, Pending)
 * - Expandable course cards with detailed information
 * - Course schedule (enrolled date, start date, end date)
 * - Payment status and quick payment button for pending courses
 * - Access to course modules with download/view options
 * - Instructor information and course details
 * 
 * @function fetchMyCourses - Fetches enrolled courses with full details
 * @function toggleExpand - Toggles course card expansion to show/hide details
 */
export default function MyCourses() {
  // State management for courses and UI
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null); // ID of expanded course card
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

  const toggleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your courses...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate stats
  const totalCourses = courses.length;
  const paidCourses = courses.filter(c => c.paymentStatus === "Paid").length;
  const pendingCourses = courses.filter(c => c.paymentStatus !== "Paid").length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">📘 My Enrolled Courses</h1>
            <p className="text-gray-600 mt-2">View and manage all your enrolled courses</p>
          </div>

          {/* Stats Cards */}
          {courses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border-2 border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Courses</p>
                    <p className="text-3xl font-bold mt-1 text-gray-900">{totalCourses}</p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>
              <div className="bg-white border-2 border-green-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Paid Courses</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{paidCourses}</p>
                  </div>
                  <div className="text-4xl">✅</div>
                </div>
              </div>
              <div className="bg-white border-2 border-yellow-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Payment</p>
                    <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingCourses}</p>
                  </div>
                  <div className="text-4xl">⏳</div>
                </div>
              </div>
            </div>
          )}

          {/* Course Cards */}
          {courses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h3>
              <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
              <Link
                to="/student-home"
                className="inline-block bg-white border-2 border-gray-400 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition font-medium shadow-sm hover:shadow-md"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(course._id)}
                    className="w-full flex justify-between items-center bg-white border-b-2 border-gray-200 px-6 py-4 text-left font-semibold hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📘</span>
                      <div className="text-left">
                        <div className="font-bold text-lg text-gray-900">{course.title}</div>
                        <div className="text-sm font-normal text-gray-600">{course.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {course.paymentStatus === "Paid" && (
                        <span className="bg-green-100 text-green-700 border border-green-300 px-3 py-1 rounded-full text-sm font-medium">
                          ✓ Paid
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-600">
                        {expanded === course._id ? "▲ Hide Details" : "▼ Show Details"}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expanded === course._id && (
                    <div className="p-6 space-y-5">
                      {/* Course Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Course Description</p>
                          <p className="text-gray-800 font-medium">{course.description}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Instructor</p>
                          <p className="text-gray-800 font-semibold flex items-center gap-2">
                            👨‍🏫 {course.instructor?.name || "TBA"}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Course Fee</p>
                          <p className="text-2xl font-bold text-gray-900">Rs. {course.price}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                          <p className="text-sm text-gray-600 mb-1">Duration</p>
                          <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-full text-sm font-medium inline-block">
                            {course.duration || '3 months'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Course Dates */}
                      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-xl">📅</span>
                          Course Schedule
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Enrolled On</p>
                            <p className="font-semibold text-gray-900">
                              {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">Starting Date</p>
                            <p className="font-semibold text-gray-900">
                              {course.startingDate ? new Date(course.startingDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Not set'}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1">End Date</p>
                            <p className="font-semibold text-gray-900">
                              {course.endDate ? new Date(course.endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Not calculated'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Payment Status */}
                      <div className={`p-5 rounded-lg border-2 ${
                        course.paymentStatus === "Paid" 
                          ? "bg-green-50 border-green-300" 
                          : "bg-yellow-50 border-yellow-300"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-2xl ${course.paymentStatus === "Paid" ? "animate-bounce" : ""}`}>
                              {course.paymentStatus === "Paid" ? "✅" : "⏳"}
                            </span>
                            <div>
                              <p className="text-sm text-gray-600">Payment Status</p>
                              <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                                course.paymentStatus === "Paid" 
                                  ? "bg-green-500 text-white" 
                                  : "bg-yellow-500 text-white"
                              }`}>
                                {course.paymentStatus === "Paid" ? "Paid" : "Pending Payment"}
                              </span>
                            </div>
                          </div>
                          
                          {course.paymentStatus !== "Paid" && (
                            <button
                              onClick={() => navigate("/otp-payment", { 
                                state: { 
                                  enrollment: {
                                    _id: course.enrollmentId,
                                    course: {
                                      _id: course._id,
                                      title: course.title,
                                      price: course.price
                                    }
                                  }
                                } 
                              })}
                              className="bg-white border-2 border-gray-400 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 hover:border-gray-500 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                              💳 Pay Now
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Modules Section */}
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-xl">📚</span>
                          Course Modules {course.modules?.length > 0 && `(${course.modules.length})`}
                        </h4>

                        {course.modules?.length > 0 ? (
                          <div className="grid gap-3">
                            {course.modules.map((mod) => (
                              <div
                                key={mod._id}
                                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {mod.contentType === "video" ? "🎥" : mod.contentType === "pdf" ? "📄" : mod.contentType === "link" ? "🔗" : "📝"}
                                  </span>
                                  <div>
                                    <p className="font-semibold text-gray-800">{mod.title}</p>
                                    <p className="text-sm text-gray-500">{mod.contentType}</p>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2">
                                  {mod.contentUrl && (
                                    <a
                                      href={mod.contentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition text-sm font-medium"
                                    >
                                      👁️ View
                                    </a>
                                  )}
                                  {mod.contentType === "pdf" && mod.contentUrl && (
                                    <a
                                      href={mod.contentUrl}
                                      download
                                      className="bg-white border-2 border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 hover:border-green-400 transition text-sm font-medium"
                                    >
                                      📥 Download
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <span className="text-4xl block mb-2">📭</span>
                            <p>Modules not added yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
