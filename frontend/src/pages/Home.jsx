import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Home() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalEnrollments: 0,
    totalPayments: 0,
    pendingPayments: 0
  });
  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUser(payload);
          
          // Fetch dashboard data based on user role
          await fetchDashboardData(payload.role);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Separate useEffect to handle user changes
  useEffect(() => {
    if (user?.role) {
      fetchDashboardData(user.role);
    }
  }, [user]);

  const fetchDashboardData = async (role) => {
    try {
      const token = localStorage.getItem("token");
      
      if (role === "admin") {
        // Fetch admin dashboard data
        const [enrollmentsRes, paymentsRes] = await Promise.all([
          axiosClient.get("/enrollments", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axiosClient.get("/payments", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStats({
          totalCourses: 4, // Static for now
          totalEnrollments: enrollmentsRes.data.length,
          totalPayments: paymentsRes.data.length,
          pendingPayments: paymentsRes.data.filter(p => p.status === "Pending").length
        });

        console.log("Admin enrollments data:", enrollmentsRes.data);
        setRecentEnrollments(enrollmentsRes.data.slice(0, 5));
      } else if (role === "student") {
        // Fetch student dashboard data - use the correct endpoint for student enrollments
        const enrollmentsRes = await axiosClient.get("/enrollments/my-enrollments", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const studentEnrollments = enrollmentsRes.data || [];

        setStats({
          totalCourses: studentEnrollments.length,
          totalEnrollments: studentEnrollments.length,
          totalPayments: 0,
          pendingPayments: 0
        });

        console.log("Student enrollments data:", enrollmentsRes.data);
        setRecentEnrollments(studentEnrollments.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set default values on error
      setStats({
        totalCourses: 0,
        totalEnrollments: 0,
        totalPayments: 0,
        pendingPayments: 0
      });
      setRecentEnrollments([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getRoleBasedContent = () => {
    if (user?.role === "admin") {
      return (
        <>
          {/* Admin Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <div className="text-blue-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Enrollments</p>
                  <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                </div>
                <div className="text-green-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Payments</p>
                  <p className="text-3xl font-bold">{stats.totalPayments}</p>
                </div>
                <div className="text-purple-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Pending Payments</p>
                  <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                </div>
                <div className="text-orange-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/enrolments"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">View Enrollments</h3>
                  <p className="text-sm text-gray-600">Manage student enrollments</p>
                </div>
              </Link>

              <Link
                to="/payments"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-green-600 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Management</h3>
                  <p className="text-sm text-gray-600">Track payment status</p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <div className="text-purple-600 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Generate Reports</h3>
                  <p className="text-sm text-gray-600">View system analytics</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Enrollments */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Enrollments</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Student Name</th>
                    <th className="text-left py-2">Course</th>
                    <th className="text-left py-2">Batch</th>
                    <th className="text-left py-2">Payment Status</th>
                    <th className="text-left py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEnrollments.map((enrollment, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {enrollment.student?.name || enrollment.name || 'N/A'}
                      </td>
                      <td className="py-2">
                        {enrollment.course?.title || enrollment.course || 'N/A'}
                      </td>
                      <td className="py-2">{enrollment.batch || 'N/A'}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          enrollment.status === 'completed' || enrollment.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {enrollment.status === 'completed' ? 'Completed' : enrollment.paymentStatus || 'Pending'}
                        </span>
                      </td>
                      <td className="py-2">
                        {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    } else {
      // Student Dashboard
      return (
        <>
          {/* Student Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">My Courses</p>
                  <p className="text-3xl font-bold">{stats.totalCourses}</p>
                </div>
                <div className="text-blue-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Enrollments</p>
                  <p className="text-3xl font-bold">{stats.totalEnrollments}</p>
                </div>
                <div className="text-green-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Learning Progress</p>
                  <p className="text-3xl font-bold">85%</p>
                </div>
                <div className="text-purple-200">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/enrolment"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="text-blue-600 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Enroll in Course</h3>
                  <p className="text-sm text-gray-600">Register for new courses</p>
                </div>
              </Link>

              <Link
                to="/payment"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="text-green-600 mr-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Make Payment</h3>
                  <p className="text-sm text-gray-600">Pay course fees</p>
                </div>
              </Link>
            </div>
          </div>

          {/* My Courses */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">My Courses</h2>
            {recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {enrollment.course?.title || enrollment.course || 'Course Name'}
                        </h3>
                        <p className="text-gray-600">Batch: {enrollment.batch || 'N/A'}</p>
                        <p className="text-sm text-gray-500">
                          Course ID: {enrollment.course?._id || enrollment.courseId || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        enrollment.status === 'completed' || enrollment.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {enrollment.status === 'completed' ? 'Completed' : enrollment.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Enrolled: {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200">
                          View Course
                        </button>
                        {(enrollment.status !== 'completed' && enrollment.paymentStatus !== 'Paid') && (
                          <Link
                            to="/payment"
                            className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Courses Yet</h3>
                <p className="text-gray-500 mb-4">Start your learning journey by enrolling in a course!</p>
                <Link
                  to="/enrolment"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Enroll Now
                </Link>
              </div>
            )}
          </div>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name || 'User'}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your {user?.role === 'admin' ? 'Admin' : 'Student'} Dashboard
          </p>
          <div className="mt-2">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Role-based Content */}
        {getRoleBasedContent()}

        {/* System Features Overview */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Learning Management System Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Course Management</h3>
              <p className="text-sm text-gray-600">Comprehensive course catalog with modules and content</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Student Enrollment</h3>
              <p className="text-sm text-gray-600">Easy enrollment process with batch management</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Payment Processing</h3>
              <p className="text-sm text-gray-600">Secure payment handling with status tracking</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-sm text-gray-600">Detailed reports and system analytics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
