import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function DocumentDetail() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/documents/${id}`)
      .then(({ data }) => setDocument(data.document))
      .catch((err) => setError(err.response?.data?.error || "Failed to load document"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-sm text-gray-500 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
        &larr; Back to notes
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">{document.title}</h1>
      <div className="border border-gray-200 rounded-lg p-5 whitespace-pre-wrap text-sm text-gray-700 max-h-96 overflow-y-auto">
        {document.rawText}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Quiz generation is coming in the next phase of this project.
      </p>
    </div>
  );
}
