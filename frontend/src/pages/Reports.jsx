import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Reports() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDownload = async (type) => {
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get(`/reports/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // Important for file downloads
      });

      // Create a temporary link to trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        type === "pdf" ? "report.pdf" : "report.csv"
      );
      document.body.appendChild(link);
      link.click();

      setMessage(`✅ ${type.toUpperCase()} report downloaded successfully.`);
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to download report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Admin Reports
      </h1>

      <p className="text-gray-600 text-center mb-6">
        Generate and download reports for enrolments and payments.
      </p>

      <div className="flex justify-center gap-6 mb-6">
        <button
          onClick={() => handleDownload("pdf")}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Generating..." : "Download PDF"}
        </button>

        <button
          onClick={() => handleDownload("csv")}
          disabled={loading}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition"
        >
          {loading ? "Generating..." : "Download CSV"}
        </button>
      </div>

      {message && (
        <p
          className={`text-center font-medium ${
            message.includes("✅") ? "text-green-700" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
