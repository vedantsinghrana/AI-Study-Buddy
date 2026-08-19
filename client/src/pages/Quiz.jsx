import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get(`/documents/${id}/questions`)
      .then(({ data }) => setQuestions(data.questions))
      .catch((err) => setLoadError(err.response?.data?.error || "Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [id]);

  function selectOption(questionId, option) {
    setSelected((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    setSubmitError("");
    setSubmitting(true);
    try {
      const answers = questions.map((q) => ({ questionId: q.id, selectedOption: selected[q.id] }));
      const { data } = await api.post(`/quiz/${id}/submit`, { answers });
      setResult(data);
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500 text-center mt-10">Loading...</p>;
  if (loadError) return <p className="text-sm text-red-600 text-center mt-10">{loadError}</p>;

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-gray-500 mb-4">No quiz has been generated for this document yet.</p>
        <Link to={`/documents/${id}`} className="text-sm text-gray-900 font-medium">
          &larr; Back to document
        </Link>
      </div>
    );
  }

  if (result) {
    const resultMap = new Map(result.results.map((r) => [r.questionId, r]));
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Quiz results</h1>
        <p className="text-gray-600 mb-8">
          You scored <span className="font-semibold text-gray-900">{result.score}</span> out of{" "}
          {result.total}
        </p>

        <div className="space-y-4 mb-8">
          {questions.map((q, i) => {
            const r = resultMap.get(q.id);
            return (
              <div
                key={q.id}
                className={`border rounded-lg p-4 ${r?.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {i + 1}. {q.question}
                </p>
                <p className="text-xs text-gray-500 mb-1">Topic: {q.topic}</p>
                <p className="text-sm text-gray-700">
                  Your answer: <span className={r?.correct ? "text-green-700" : "text-red-700"}>{r?.selectedOption}</span>
                </p>
                {!r?.correct && (
                  <p className="text-sm text-gray-700">
                    Correct answer: <span className="text-green-700">{r?.correctAnswer}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Link to={`/documents/${id}`} className="text-sm text-gray-900 font-medium">
          &larr; Back to document
        </Link>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const canProceed = Boolean(selected[question.id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <p className="text-sm text-gray-500 mb-2">
        Question {currentIndex + 1} of {questions.length}
      </p>
      <h1 className="text-lg font-semibold text-gray-900 mb-6">{question.question}</h1>

      <div className="space-y-2 mb-6">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => selectOption(question.id, option)}
            className={`w-full text-left px-4 py-3 rounded-md border text-sm ${
              selected[question.id] === option
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {submitError && <p className="text-sm text-red-600 mb-4">{submitError}</p>}

      <div className="flex justify-between">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="text-sm text-gray-500 disabled:opacity-30"
        >
          &larr; Previous
        </button>

        {isLast ? (
          <button
            type="button"
            disabled={!canProceed || submitting}
            onClick={handleSubmit}
            className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit quiz"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
