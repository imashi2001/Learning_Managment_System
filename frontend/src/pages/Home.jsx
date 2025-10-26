import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

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
      <Navbar />

      {/* Hero Section */}
      <Hero content={content} userName={userName} colorScheme={userRole || "student"} />

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