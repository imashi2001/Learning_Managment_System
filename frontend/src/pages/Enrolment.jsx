export default function Enrolment() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Enrolment
        </h1>

        <form className="space-y-4">
          {/* Student Name */}
          <div>
            <label className="block text-gray-700 mb-1">Student Name</label>
            <input
              type="text"
              placeholder="Enter student name"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Student Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Course Selection */}
          <div>
            <label className="block text-gray-700 mb-1">Course</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Select Course</option>
              <option>IT Fundamentals</option>
              <option>Web Development</option>
            </select>
          </div>

          {/* Batch */}
          <div>
            <label className="block text-gray-700 mb-1">Batch</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Y1S1</option>
              <option>Y1S2</option>
              <option>Y2S1</option>
              <option>Y2S2</option>
              <option>Y3S1</option>
              <option>Y3S2</option>
              <option>Y4S1</option>
              <option>Y4S2</option>
            </select>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-gray-700 mb-1">Payment Status</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Pending</option>
              <option>Paid</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Enrolment
          </button>
        </form>
      </div>
    </div>
  );
}
