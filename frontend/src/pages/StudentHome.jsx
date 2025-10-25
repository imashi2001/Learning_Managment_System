import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();


  // ✅ Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axiosClient.get("/courses");
        setCourses(res.data);
      } catch (error) {
        toast.error("Failed to load courses",error  );
      }
    };
    fetchCourses();
  }, []);

  // ✅ Decode student info and fetch enrollments
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setStudentId(decoded.id);
        setUserRole(decoded.role);
        setUserName(decoded.name);
      } catch (err) {
        console.error("Invalid token", err);
      }
      
      // Fetch student's enrollments
      const fetchEnrollments = async () => {
        try {
          const res = await axiosClient.get("/enrollments/my-enrollments", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEnrolledCourses(res.data.map(enrollment => enrollment.course._id));
        } catch (error) {
          console.error("Failed to fetch enrollments:", error);
        }
      };
      
      fetchEnrollments();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // ✅ Check enrollment status and navigate accordingly
  const handleEnroll = (courseId) => {
    // Check if student is already enrolled in this course
    if (enrolledCourses.includes(courseId)) {
      toast.info("You are already enrolled in this course!");
      return;
    }
    
    // Store the selected course ID for the enrollment form
    localStorage.setItem("selectedCourseId", courseId);
    navigate("/enrolment");
  };

  // ✅ Filter courses
  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.category.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex-1 bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Student Instructions Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 mb-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-4 text-center">
              🎓 Welcome to Course Browser
            </h1>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">📚 How to Browse Courses</h2>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-start">
                    <span className="mr-2">🔍</span>
                    <span>Use the search bar to find courses by title or category</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">👁️</span>
                    <span>Click "View Details" to see course information and modules</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">📝</span>
                    <span>Click "Enroll" to register for a course</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Green badges show courses you're already enrolled in</span>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">🚀 Getting Started</h2>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-start">
                    <span className="mr-2">1️⃣</span>
                    <span>Browse available courses below</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">2️⃣</span>
                    <span>Read course descriptions and requirements</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">3️⃣</span>
                    <span>Enroll in courses that interest you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">4️⃣</span>
                    <span>Complete payment to access course materials</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
            🎓 Available Courses
          </h2>

        {/* 🔍 Search bar */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* 📘 Course Cards */}
        {filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourses.includes(course._id);
              return (
                <div
                  key={course._id}
                  className={`bg-white shadow-md rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-all ${
                    isEnrolled ? 'ring-2 ring-green-200 bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-blue-600">
                      {course.title}
                    </h2>
                    {isEnrolled && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Enrolled
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{course.category}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                  <p className="mt-2 font-semibold text-green-600">
                    Rs. {course.price || 0}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={isEnrolled}
                      className={`flex-1 py-1 rounded text-sm ${
                        isEnrolled
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isEnrolled ? 'Already Enrolled' : 'Enroll'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No courses found.</p>
        )}
        </div>
      </div>

      {/* 📋 Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 shadow-lg relative">
            <button
              onClick={() => setSelectedCourse(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-3 text-blue-700">
              {selectedCourse.title}
            </h2>
            <p className="text-gray-700 mb-2">{selectedCourse.description}</p>
            <p className="text-sm text-gray-600 mb-2">
              Category: {selectedCourse.category}
            </p>
            <p className="font-semibold text-green-600 mb-3">
              Price: Rs. {selectedCourse.price || 0}
            </p>

            {/* 👩‍🏫 Lecturer info + Contact */}
            {selectedCourse.instructor && (
              <div className="mb-3 bg-blue-50 p-3 rounded">
                <p className="font-semibold text-blue-700">
                  Instructor: {selectedCourse.instructor.name}
                </p>
                <p className="text-sm text-blue-600 mb-2">
                  Contact: {selectedCourse.instructor.email}
                </p>
                <a
                  href={`mailto:${selectedCourse.instructor.email}`}
                  className="inline-block bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                >
                  📧 Contact Lecturer
                </a>
              </div>
            )}

            {/* 📚 Modules Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Modules</h3>
              {selectedCourse.modules?.length > 0 ? (
                <ul className="list-disc ml-5 space-y-1 text-gray-700">
                  {selectedCourse.modules.map((mod) => (
                    <li key={mod._id}>
                      <strong>{mod.title}</strong> ({mod.contentType}){" "}
                      {mod.contentUrl && (
                        <a
                          href={mod.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline ml-1"
                        >
                          View
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">
                  Modules not available yet.
                </p>
              )}
            </div>

            <div className="mt-5 text-right">
              {enrolledCourses.includes(selectedCourse._id) ? (
                <div className="text-center">
                  <span className="bg-green-500 text-white px-4 py-2 rounded">
                    ✓ Already Enrolled
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => handleEnroll(selectedCourse._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
