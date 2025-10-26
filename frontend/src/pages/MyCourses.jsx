import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [expanded, setExpanded] = useState(null);
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

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
                <p><strong>Duration:</strong> 
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium ml-2">
                    {course.duration || '3 months'}
                  </span>
                </p>
                
                {/* Course Dates */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📅 Course Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Enrolled On:</p>
                      <p className="font-medium text-blue-700">
                        {course.enrolledAt ? new Date(course.enrolledAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not available'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Starting Date:</p>
                      <p className="font-medium text-green-700">
                        {course.startingDate ? new Date(course.startingDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Date:</p>
                      <p className="font-medium text-red-700">
                        {course.endDate ? new Date(course.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Not calculated'}
                      </p>
                    </div>
                  </div>
                </div>
                
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
