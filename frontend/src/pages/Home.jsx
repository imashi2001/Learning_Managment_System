import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";

export default function Home() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  const getRoleBasedContent = () => {
    switch (userRole) {
      case "student":
        return {
          title: "Welcome Back, Student!",
          subtitle: "Continue your learning journey",
          primaryAction: { text: "Browse Courses", link: "/student-home" },
          secondaryAction: { text: "My Courses", link: "/my-courses" },
          features: [
            { icon: "📚", title: "Browse Courses", desc: "Explore available courses" },
            { icon: "📝", title: "Easy Enrollment", desc: "Simple course enrollment process" },
            { icon: "💳", title: "Secure Payments", desc: "Safe and secure payment system" },
            { icon: "📊", title: "Track Progress", desc: "Monitor your learning progress" }
          ]
        };
      case "lecturer":
        return {
          title: "Welcome Back, Lecturer!",
          subtitle: "Manage your courses and students",
          primaryAction: { text: "Dashboard", link: "/lecturer-dashboard" },
          secondaryAction: { text: "My Courses", link: "/my-courses" },
          features: [
            { icon: "👨‍🏫", title: "Course Management", desc: "Create and manage courses" },
            { icon: "👥", title: "Student Management", desc: "Track student progress" },
            { icon: "📋", title: "Content Creation", desc: "Add modules and materials" },
            { icon: "📈", title: "Analytics", desc: "View course analytics" }
          ]
        };
      case "admin":
        return {
          title: "Welcome Back, Admin!",
          subtitle: "Manage the entire system",
          primaryAction: { text: "Admin Dashboard", link: "/admin/dashboard" },
          secondaryAction: { text: "Manage Courses", link: "/courses" },
          features: [
            { icon: "⚙️", title: "System Management", desc: "Manage users and courses" },
            { icon: "📊", title: "Reports & Analytics", desc: "View system-wide reports" },
            { icon: "👥", title: "User Management", desc: "Manage students and lecturers" },
            { icon: "💰", title: "Payment Tracking", desc: "Monitor payment status" }
          ]
        };
      default:
        return {
          title: "Welcome to Learning Management System",
          subtitle: "Your gateway to quality education",
          primaryAction: { text: "Get Started", link: "/login" },
          secondaryAction: { text: "Learn More", link: "#features" },
          features: [
            { icon: "🎓", title: "Quality Education", desc: "Access to top-quality courses" },
            { icon: "👨‍🏫", title: "Expert Instructors", desc: "Learn from experienced professionals" },
            { icon: "💻", title: "Online Learning", desc: "Learn from anywhere, anytime" },
            { icon: "📱", title: "Mobile Friendly", desc: "Access courses on any device" }
          ]
        };
    }
  };

  const content = getRoleBasedContent();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">LMS</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">EduLearn</h1>
            </Link>
            
            <div className="flex items-center space-x-4">
              {/* Role-based navigation */}
              {userRole === "student" && (
                <>
                  <Link
                    to="/student-home"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Browse Courses
                  </Link>
                  <Link
                    to="/my-courses"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    My Courses
                  </Link>
                  <Link
                    to="/enrolment"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Enroll
                  </Link>
                  <Link
                    to="/payment"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Payments
                  </Link>
                </>
              )}
              
              {userRole === "lecturer" && (
                <>
                  <Link
                    to="/lecturer-dashboard"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/my-courses"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    My Courses
                  </Link>
                </>
              )}
              
              {userRole === "admin" && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/courses"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Manage Courses
                  </Link>
                  <Link
                    to="/enrolments"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Enrollments
                  </Link>
                  <Link
                    to="/payments"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Payments
                  </Link>
                </>
              )}

              {/* User info and logout */}
              {userRole && (
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <div className="flex items-center text-gray-600 px-4 py-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>Welcome, {userName || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}

              {!userRole && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                {content.title}
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
                {content.subtitle}
              </p>
              {userName && (
                <p className="text-lg text-blue-200 mb-8">
                  Hello, <span className="font-semibold">{userName}</span>!
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to={content.primaryAction.link}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {content.primaryAction.text}
              </Link>
              <Link
                to={content.secondaryAction.link}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                {content.secondaryAction.text}
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200">500+</div>
                <div className="text-blue-100">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200">50+</div>
                <div className="text-blue-100">Expert Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-200">100+</div>
                <div className="text-blue-100">Courses Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,8.19,156.40,25.66C217.19,72.43,272,90,327.67,90C381.4,90,435.22,72.43,489,46.29c53.78-26.14,107.56-8.19,156.40,25.66C698.22,72.43,752,90,806.67,90C860.4,90,914.22,72.43,968,46.29c53.78-26.14,107.56-8.19,156.40,25.66C1180.22,72.43,1234,90,1288.67,90c44.44,0,88.89-17.57,133.33-35.33V0Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of online learning with our comprehensive features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already advancing their careers with our courses
          </p>
          {!userRole && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started Today
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}