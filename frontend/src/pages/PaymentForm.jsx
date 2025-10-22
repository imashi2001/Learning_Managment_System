export default function PaymentForm() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Payment Form
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Student Email</label>
            <input
              type="email"
              placeholder="Enter student email"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Amount (Rs.)</label>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Payment Method</label>
            <select className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Cash</option>
              <option>Card</option>
              <option>Bank Transfer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Submit Payment
          </button>
        </form>
      </div>
    </div>
  );
}
