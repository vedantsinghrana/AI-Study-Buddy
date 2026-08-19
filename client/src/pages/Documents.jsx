import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("text");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function loadDocuments() {
    try {
      const { data } = await api.get("/documents");
      setDocuments(data.documents);
    } catch (err) {
      setLoadError(err.response?.data?.error || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");

    if (mode === "text" && !text.trim()) {
      setSubmitError("Paste some text first");
      return;
    }
    if (mode === "pdf" && !file) {
      setSubmitError("Choose a PDF file first");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      if (mode === "text") {
        formData.append("text", text);
      } else {
        formData.append("file", file);
      }

      await api.post("/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTitle("");
      setText("");
      setFile(null);
      await loadDocuments();
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Your notes</h1>

      <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-5 mb-8 space-y-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 4 - Thermodynamics"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3 py-1.5 rounded-md border ${
              mode === "text" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => setMode("pdf")}
            className={`px-3 py-1.5 rounded-md border ${
              mode === "pdf" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600"
            }`}
          >
            Upload PDF
          </button>
        </div>

        {mode === "text" ? (
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes here..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        ) : (
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="text-sm"
          />
        )}

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {submitting ? "Uploading..." : "Add document"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : documents.length === 0 ? (
        <p className="text-sm text-gray-500">No documents yet. Add your first one above.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {documents.map((doc) => (
            <li key={doc._id}>
              <Link
                to={`/documents/${doc._id}`}
                className="flex justify-between items-center px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-sm font-medium text-gray-900">{doc.title}</span>
                <span className="text-xs text-gray-400">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
