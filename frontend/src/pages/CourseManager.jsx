import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { toast } from "react-toastify";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [assigningCourse, setAssigningCourse] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    duration: "3 months",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  // ✅ Fetch all courses
  const fetchCourses = async () => {
    try {
      const res = await axiosClient.get("/courses");
      setCourses(res.data);
    } catch (error) {
      toast.error("Failed to fetch courses",error);
    }
  };

  // ✅ Fetch lecturers
  const fetchLecturers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const onlyLecturers = res.data.filter((u) => u.role === "lecturer");
      setLecturers(onlyLecturers);
    } catch (error) {
      toast.error("Failed to load lecturers",error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLecturers();
  }, []);

  // ✅ Handle new course form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axiosClient.post("/courses", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course added successfully");
      setFormData({ title: "", category: "", description: "", price: "", duration: "3 months" });
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding course");
    }
  };

  // ✅ Delete a course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course", error);
    }
  };

  // ✅ Edit course handlers
  const startEditing = (course) => {
    setEditingId(course._id);
    setEditData(course);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/courses/${id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Course updated successfully");
      setEditingId(null);
      fetchCourses();
    } catch (error) {
      toast.error("Error updating course", error);
    }
  };

  // ✅ Assign Lecturer
  const handleAssignLecturer = async (courseId) => {
    if (!selectedLecturer) {
      toast.warning("Please select a lecturer first");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosClient.post(
        "/admin/assign-courses",
        {
          lecturerId: selectedLecturer,
          courseIds: [courseId],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Lecturer assigned successfully");
      setAssigningCourse(null);
      setSelectedLecturer("");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to assign lecturer", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 max-w-6xl mx-auto mt-8 bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          🎓 Manage Courses
        </h1>

      {/* Add Course Form */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Course Title"
          className="p-2 border rounded"
          required
        />
        <input
          type="text"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Category"
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="Price (Rs)"
          className="p-2 border rounded"
          required
        />
        <select
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        >
          <option value="1 month">1 Month</option>
          <option value="3 months">3 Months</option>
          <option value="6 months">6 Months</option>
          <option value="1 year">1 Year</option>
          <option value="2 years">2 Years</option>
        </select>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows="3"
          className="p-2 border rounded md:col-span-2"
          required
        />
        <button
          type="submit"
          className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Add Course
        </button>
      </form>

      {/* Course List Table */}
      <table className="w-full border-collapse border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price (Rs)</th>
            <th className="border p-2">Duration</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Lecturer</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course._id} className="hover:bg-gray-50">
                {editingId === course._id ? (
                  <>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                        className="p-1 border rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="text"
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        className="p-1 border rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        name="price"
                        value={editData.price}
                        onChange={handleEditChange}
                        className="p-1 border rounded w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <select
                        name="duration"
                        value={editData.duration}
                        onChange={handleEditChange}
                        className="p-1 border rounded w-full"
                      >
                        <option value="1 month">1 Month</option>
                        <option value="3 months">3 Months</option>
                        <option value="6 months">6 Months</option>
                        <option value="1 year">1 Year</option>
                        <option value="2 years">2 Years</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <textarea
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        className="p-1 border rounded w-full"
                      />
                    </td>
                    <td className="border p-2 text-center" colSpan={2}>
                      <button
                        onClick={() => saveEdit(course._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border p-2">{course.title}</td>
                    <td className="border p-2">{course.category}</td>
                    <td className="border p-2">{course.price}</td>
                    <td className="border p-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {course.duration}
                      </span>
                    </td>
                    <td className="border p-2 text-sm text-gray-600">
                      {course.description}
                    </td>
                    <td className="border p-2">
                      {course.instructor ? (
                        <span className="text-green-600 font-semibold">
                          {course.instructor.name}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">
                          Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="border p-2 text-center space-x-2">
                      <button
                        onClick={() => startEditing(course)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setAssigningCourse(course._id)}
                        className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                      >
                        Assign
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-3 text-gray-500 italic">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Assign Lecturer Modal */}
      {assigningCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-96 transform transition-all scale-100 hover:scale-[1.01]">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 text-center">
              🎓 Assign Lecturer
            </h2>

            <select
              value={selectedLecturer}
              onChange={(e) => setSelectedLecturer(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 mb-4"
            >
              <option value="">-- Select Lecturer --</option>
              {lecturers.map((lec) => (
                <option key={lec._id} value={lec._id}>
                  {lec.name} ({lec.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => handleAssignLecturer(assigningCourse)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                ✅ Assign
              </button>
              <button
                onClick={() => setAssigningCourse(null)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-all"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
