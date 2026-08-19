import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/Spinner";

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
    <div className="max-w-3xl mx-auto px-5 py-14 animate-fade-in-up">
      <h1 className="text-[32px] font-semibold tracking-tight text-gray-900 mb-1">Your notes</h1>
      <p className="text-[15px] text-gray-500 mb-8">Upload material to generate quizzes, flashcards, and more.</p>

      <form onSubmit={handleSubmit} className="card-surface p-6 mb-10 space-y-4">
        <div>
          <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chapter 4 - Thermodynamics"
            className="input-field w-full px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div className="flex gap-1 bg-black/[0.04] rounded-full p-1 w-fit text-[13px]">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              mode === "text" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => setMode("pdf")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              mode === "pdf" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
            className="input-field w-full px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 resize-none"
          />
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-gray-300 rounded-xl py-8 cursor-pointer hover:border-gray-400 hover:bg-black/[0.02] transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span className="text-[14px] text-gray-500">
              {file ? file.name : "Click to choose a PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
            />
          </label>
        )}

        {submitError && (
          <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2 animate-fade-in">{submitError}</p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary px-5 py-2.5 text-[14px] disabled:opacity-40">
          {submitting ? "Uploading..." : "Add document"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : loadError ? (
        <p className="text-[14px] text-red-600">{loadError}</p>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-[14px] text-gray-500">No documents yet. Add your first one above.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {documents.map((doc, i) => (
            <li key={doc._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
              <Link
                to={`/documents/${doc._id}`}
                className="card-surface flex justify-between items-center px-5 py-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <span className="text-[15px] font-medium text-gray-900 truncate">{doc.title}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[13px] text-gray-400">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  <svg
                    className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
