import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";

/**
 * UserProfile Component
 * 
 * This component displays and manages user profile information for all roles.
 * Features:
 * - View and edit profile information (name, email, phone, address, bio)
 * - Profile image upload and removal
 * - Role-based statistics and activity display
 * - Different content based on user role (student, lecturer, admin)
 * - Dynamic dashboard navigation based on role
 * 
 * @function fetchUserData - Fetches user profile from backend
 * @function fetchUserStats - Fetches role-specific statistics (enrollments/courses)
 * @function updateProfile - Updates user profile information
 * @function handleImageUpload - Uploads profile image
 * @function handleRemoveImage - Removes profile image
 * @function getRoleBasedContent - Returns role-specific content and stats
 */
export default function UserProfile() {
  // State management for user data
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  
  // State management for UI
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State management for statistics
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  
  const navigate = useNavigate();

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ✅ Fetch user data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
        setUserName(decoded.name);
        setUser(decoded);
        setEditForm({
          name: decoded.name || "",
          email: decoded.email || "",
          phone: decoded.phone || "",
          address: decoded.address || "",
          bio: decoded.bio || "",
        });
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setUserRole(res.data.role);
      setUserName(res.data.name);
      setEditForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        address: res.data.address || "",
        bio: res.data.bio || "",
      });
      setProfileImage(res.data.profileImage || null);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (userRole === "student") {
          const res = await axiosClient.get("/enrollments/my-enrollments", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEnrollments(res.data);
        } else if (userRole === "lecturer") {
          const res = await axiosClient.get("/lecturer/courses", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCourses(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    if (userRole) {
      fetchUserStats();
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      bio: user?.bio || "",
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put("/auth/profile", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!profileImage) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', profileImage);
      
      const token = localStorage.getItem("token");
      const res = await axiosClient.post("/auth/upload-profile-image", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      toast.success("Profile image updated successfully!");
      setProfileImage(res.data.profileImage);
      setImagePreview(null);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete("/auth/remove-profile-image", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success("Profile image removed successfully!");
      setProfileImage(null);
      setImagePreview(null);
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove image");
    }
  };

  const getRoleBasedContent = () => {
    switch (userRole) {
      case "student":
        return {
          title: "Student Profile",
          icon: "🎓",
          stats: [
            { label: "Enrolled Courses", value: enrollments.length, color: "blue" },
            { label: "Completed Courses", value: enrollments.filter(e => e.status === "completed").length, color: "green" },
            { label: "Pending Payments", value: enrollments.filter(e => e.paymentStatus === "Pending").length, color: "yellow" },
          ],
          recentActivity: enrollments.slice(0, 3).map(enrollment => ({
            title: enrollment.course?.title,
            date: new Date(enrollment.createdAt).toLocaleDateString(),
            status: enrollment.paymentStatus,
          })),
        };
      case "lecturer":
        return {
          title: "Lecturer Profile",
          icon: "👨‍🏫",
          stats: [
            { label: "Assigned Courses", value: courses.length, color: "blue" },
            { label: "Total Students", value: courses.reduce((sum, course) => sum + (course.students?.length || 0), 0), color: "green" },
            { label: "Active Courses", value: courses.filter(c => c.status === "active").length, color: "purple" },
          ],
          recentActivity: courses.slice(0, 3).map(course => ({
            title: course.title,
            date: new Date(course.createdAt).toLocaleDateString(),
            status: course.status,
          })),
        };
      case "admin":
        return {
          title: "Admin Profile",
          icon: "👨‍💼",
          stats: [
            { label: "System Users", value: "All Users", color: "blue" },
            { label: "Total Courses", value: "All Courses", color: "green" },
            { label: "System Status", value: "Active", color: "purple" },
          ],
          recentActivity: [
            { title: "System Management", date: "Ongoing", status: "Active" },
            { title: "User Management", date: "Ongoing", status: "Active" },
            { title: "Course Management", date: "Ongoing", status: "Active" },
          ],
        };
      default:
        return {
          title: "User Profile",
          icon: "👤",
          stats: [],
          recentActivity: [],
        };
    }
  };

  const content = getRoleBasedContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

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
              {userRole === "student" && (
                <>
                  <Link to="/student-home" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Browse Courses
                  </Link>
                  <Link to="/my-courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    My Courses
                  </Link>
                  <Link to="/payment" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Payments
                  </Link>
                </>
              )}
              {userRole === "lecturer" && (
                <>
                  <Link to="/lecturer-dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/my-courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    My Courses
                  </Link>
                </>
              )}
              {userRole === "admin" && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/admin/courses" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Manage Courses
                  </Link>
                  <Link to="/admin/enrollments" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Enrollments
                  </Link>
                  <Link to="/admin/payments" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">
                    Payments
                  </Link>
                </>
              )}
              <Link to="/profile" className="flex items-center text-blue-600 hover:text-blue-800 px-4 py-2 rounded-lg transition-colors font-semibold">
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
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Profile Image */}
                <div className="relative">
                  {profileImage || imagePreview ? (
                    <img
                      src={imagePreview || (profileImage && profileImage.startsWith('http') ? profileImage : `http://localhost:5000/${profileImage}`)}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                  
                  {/* Image Upload Overlay */}
                  <div className="absolute -bottom-2 -right-2">
                    <label className="bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {content.icon} {content.title}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {profileImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Image
                  </button>
                )}
                {imagePreview && (
                  <button
                    onClick={handleImageUpload}
                    disabled={isUploading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Save Image"}
                  </button>
                )}
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
                
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editForm.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editForm.address}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={editForm.bio}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <p className="text-gray-900">{user?.name || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900">{user?.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <p className="text-gray-900">{user?.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <p className="text-gray-900">{user?.address || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <p className="text-gray-900">{user?.bio || "No bio provided"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats and Activity */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Statistics</h3>
                <div className="space-y-3">
                  {content.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-600">{stat.label}</span>
                      <span className={`font-semibold text-${stat.color}-600`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {content.recentActivity.length > 0 ? (
                    content.recentActivity.map((activity, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.date}</p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          activity.status === "Paid" || activity.status === "Active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
