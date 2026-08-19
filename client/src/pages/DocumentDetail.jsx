import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ChatPanel from "../components/ChatPanel";
import { PageLoader } from "../components/Spinner";

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const [addingFlashcards, setAddingFlashcards] = useState(false);
  const [flashcardMessage, setFlashcardMessage] = useState("");

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

  async function handleGenerateQuiz(focusWeakTopics = false) {
    setGenerateError("");
    setGenerating(true);
    try {
      await api.post(`/documents/${id}/generate-quiz`, { focusWeakTopics });
      navigate(`/documents/${id}/quiz`);
    } catch (err) {
      setGenerateError(err.response?.data?.error || "Failed to generate quiz. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleAddFlashcards() {
    setFlashcardMessage("");
    setAddingFlashcards(true);
    try {
      const { data } = await api.post(`/documents/${id}/flashcards`);
      setFlashcardMessage(`${data.count} flashcards ready for review.`);
    } catch (err) {
      setFlashcardMessage(err.response?.data?.error || "Failed to create flashcards. Please try again.");
    } finally {
      setAddingFlashcards(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error) return <p className="text-[14px] text-red-600 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-3xl mx-auto px-5 py-14 animate-fade-in-up">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-[13px] text-gray-500 hover:text-gray-900 transition-colors mb-4"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to notes
      </Link>
      <h1 className="text-[28px] font-semibold tracking-tight text-gray-900 mb-6">{document.title}</h1>

      <div className="card-surface p-5 whitespace-pre-wrap text-[14px] leading-relaxed text-gray-600 max-h-96 overflow-y-auto mb-6">
        {document.rawText}
      </div>

      {generateError && (
        <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 animate-fade-in">{generateError}</p>
      )}

      <div className="flex flex-wrap gap-2.5">
        {hasQuiz && (
          <Link to={`/documents/${id}/quiz`} className="btn-primary px-4 py-2 text-[14px] flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.991l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Take quiz
          </Link>
        )}
        <button
          type="button"
          onClick={() => handleGenerateQuiz(false)}
          disabled={generating}
          className={`px-4 py-2 text-[14px] flex items-center gap-1.5 disabled:opacity-40 ${
            hasQuiz ? "btn-secondary" : "btn-primary"
          }`}
        >
          {generating && (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
              <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
          {generating ? "Generating..." : hasQuiz ? "Regenerate quiz" : "Generate quiz"}
        </button>
        {hasQuiz && (
          <button
            type="button"
            onClick={() => handleGenerateQuiz(true)}
            disabled={generating}
            className="btn-secondary px-4 py-2 text-[14px] disabled:opacity-40"
          >
            Focus on weak topics
          </button>
        )}
        {hasQuiz && (
          <button
            type="button"
            onClick={handleAddFlashcards}
            disabled={addingFlashcards}
            className="btn-secondary px-4 py-2 text-[14px] disabled:opacity-40"
          >
            {addingFlashcards ? "Adding..." : "Add to flashcards"}
          </button>
        )}
      </div>

      {flashcardMessage && (
        <p className="text-[13px] text-gray-500 mt-3 animate-fade-in">{flashcardMessage}</p>
      )}

      <ChatPanel documentId={id} />
    </div>
  );
}
