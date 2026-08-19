import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/documents/${id}`),
      api.get(`/documents/${id}/questions`),
    ])
      .then(([docRes, questionsRes]) => {
        setDocument(docRes.data.document);
        setHasQuiz(questionsRes.data.questions.length > 0);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load document"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleGenerateQuiz() {
    setGenerateError("");
    setGenerating(true);
    try {
      await api.post(`/documents/${id}/generate-quiz`);
      navigate(`/documents/${id}/quiz`);
    } catch (err) {
      setGenerateError(err.response?.data?.error || "Failed to generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
        &larr; Back to notes
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mt-3 mb-6">{document.title}</h1>

      <div className="border border-gray-200 rounded-lg p-5 whitespace-pre-wrap text-sm text-gray-700 max-h-96 overflow-y-auto mb-6">
        {document.rawText}
      </div>

      {generateError && <p className="text-sm text-red-600 mb-3">{generateError}</p>}

      <div className="flex gap-3">
        {hasQuiz && (
          <Link
            to={`/documents/${id}/quiz`}
            className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800"
          >
            Take quiz
          </Link>
        )}
        <button
          type="button"
          onClick={handleGenerateQuiz}
          disabled={generating}
          className={`rounded-md px-4 py-2 text-sm font-medium border disabled:opacity-50 ${
            hasQuiz
              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
              : "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
          }`}
        >
          {generating ? "Generating quiz..." : hasQuiz ? "Regenerate quiz" : "Generate quiz"}
        </button>
      </div>
    </div>
  );
}
