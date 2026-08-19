import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { PageLoader } from "../components/Spinner";

export default function Quiz() {
  const { id } = useParams();

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

  if (loading) return <PageLoader />;
  if (loadError) return <p className="text-[14px] text-red-600 text-center mt-10">{loadError}</p>;

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center animate-fade-in-up">
        <p className="text-[14px] text-gray-500 mb-4">No quiz has been generated for this document yet.</p>
        <Link to={`/documents/${id}`} className="text-[14px] text-gray-900 font-medium hover:underline underline-offset-2">
          &larr; Back to document
        </Link>
      </div>
    );
  }

  if (result) {
    const resultMap = new Map(result.results.map((r) => [r.questionId, r]));
    const pct = Math.round((result.score / result.total) * 100);
    const ringColor = pct >= 75 ? "#16a34a" : pct >= 50 ? "#d97706" : "#dc2626";
    const circumference = 2 * Math.PI * 42;

    return (
      <div className="max-w-2xl mx-auto px-5 py-14 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="relative w-28 h-28 mx-auto mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct / 100)}
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight text-gray-900">{pct}%</span>
            </div>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-gray-900">
            {result.score} out of {result.total}
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">Here's how you did</p>
        </div>

        <div className="space-y-3 mb-10">
          {questions.map((q, i) => {
            const r = resultMap.get(q.id);
            return (
              <div key={q.id} className="card-surface p-4 flex gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    r?.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {r?.correct ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 mb-1">{q.question}</p>
                  <p className="text-[12px] text-gray-400 mb-1.5">{q.topic}</p>
                  <p className="text-[13px] text-gray-600">
                    Your answer:{" "}
                    <span className={r?.correct ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                      {r?.selectedOption}
                    </span>
                  </p>
                  {!r?.correct && (
                    <p className="text-[13px] text-gray-600">
                      Correct answer: <span className="text-green-700 font-medium">{r?.correctAnswer}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <Link to={`/documents/${id}`} className="text-[14px] text-gray-900 font-medium hover:underline underline-offset-2">
          &larr; Back to document
        </Link>
      </div>
    );
  }

  const question = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const canProceed = Boolean(selected[question.id]);
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-5 py-14 animate-fade-in-up">
      <div className="h-1 bg-black/[0.06] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full"
          style={{ width: `${progress}%`, transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>

      <p className="text-[13px] font-medium text-gray-400 mb-2">
        Question {currentIndex + 1} of {questions.length}
      </p>
      <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 mb-7 leading-snug">
        {question.question}
      </h1>

      <div className="space-y-2.5 mb-8">
        {question.options.map((option) => {
          const isSelected = selected[question.id] === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => selectOption(question.id, option)}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-[15px] flex items-center gap-3 transition-all duration-150 ${
                isSelected
                  ? "bg-gray-900 text-white shadow-md"
                  : "card-surface text-gray-700 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isSelected ? "border-white" : "border-gray-300"
                }`}
              >
                {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {submitError && (
        <p className="text-[13px] text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4 animate-fade-in">{submitError}</p>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="text-[14px] font-medium text-gray-500 hover:text-gray-900 disabled:opacity-0 transition-colors"
        >
          &larr; Previous
        </button>

        {isLast ? (
          <button
            type="button"
            disabled={!canProceed || submitting}
            onClick={handleSubmit}
            className="btn-primary px-5 py-2.5 text-[14px] disabled:opacity-40"
          >
            {submitting ? "Submitting..." : "Submit quiz"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!canProceed}
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="btn-primary px-5 py-2.5 text-[14px] disabled:opacity-40"
          >
            Next &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
