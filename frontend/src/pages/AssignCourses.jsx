import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function AssignCourses() {
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState("");
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const resLecturers = await axiosClient.get("/auth/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resCourses = await axiosClient.get("/courses");

        setLecturers(resLecturers.data.filter((user) => user.role === "lecturer"));
        setCourses(resCourses.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (courseId) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAssign = async () => {
    if (!selectedLecturer || selectedCourses.length === 0) {
      setMessage("Please select a lecturer and at least one course.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.post(
        "/admin/assign-courses",
        {
          lecturerId: selectedLecturer,
          courseIds: selectedCourses,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to assign courses");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Assign Courses to Lecturers</h1>

      {message && <p className="text-center text-blue-600 mb-4">{message}</p>}

      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Lecturer</label>
        <select
          value={selectedLecturer}
          onChange={(e) => setSelectedLecturer(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">-- Choose Lecturer --</option>
          {lecturers.map((lec) => (
            <option key={lec._id} value={lec._id}>
              {lec.name} ({lec.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Select Courses</label>
        {courses.map((course) => (
          <div key={course._id} className="flex items-center mb-2">
            <input
              type="checkbox"
              id={course._id}
              checked={selectedCourses.includes(course._id)}
              onChange={() => handleCheckboxChange(course._id)}
              className="mr-2"
            />
            <label htmlFor={course._id}>
              {course.title} — <span className="text-gray-600">{course.category}</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleAssign}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Assign Selected Courses
      </button>
    </div>
  );
}
