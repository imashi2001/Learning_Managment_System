import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Reports() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const downloadReport = async (type) => {
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axiosClient.get(`/reports/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob", // important for binary files
      });

      const blob = new Blob([response.data], {
        type: type === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "pdf" ? "report.pdf" : "report.csv";
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage(`✅ ${type.toUpperCase()} report downloaded successfully`);
    } catch (error) {
      console.log(error);
      setMessage("❌ Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white p-6 shadow rounded">
      <h1 className="text-2xl font-bold text-center mb-4">Reports</h1>

      <div className="flex justify-center gap-6 mb-4">
        <button
          onClick={() => downloadReport("pdf")}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Downloading..." : "Download PDF"}
        </button>

        <button
          onClick={() => downloadReport("csv")}
          disabled={loading}
          className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700"
        >
          {loading ? "Downloading..." : "Download CSV"}
        </button>
      </div>

      {message && <p className="text-center mt-2">{message}</p>}
    </div>
  );
}
