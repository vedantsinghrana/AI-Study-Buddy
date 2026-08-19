import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { PageLoader } from "../components/Spinner";

export default function Flashcards() {
  const [cards, setCards] = useState(null);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api
      .get("/flashcards/due")
      .then(({ data }) => setCards(data.cards))
      .catch((err) => setError(err.response?.data?.error || "Failed to load flashcards"))
      .finally(() => setLoading(false));
  }, []);

  async function handleReview(correct) {
    setReviewing(true);
    try {
      await api.post(`/flashcards/${cards[index].id}/review`, { correct });
      setFlipped(false);
      setTimeout(() => setIndex((i) => i + 1), 275);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save review. Please try again.");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return <PageLoader />;
  if (error) return <p className="text-[14px] text-red-600 text-center mt-10">{error}</p>;

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center animate-fade-in-up">
        <div className="w-12 h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center mx-auto mb-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
          </svg>
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight text-gray-900 mb-2">Flashcards</h1>
        <p className="text-[14px] text-gray-500 mb-5">
          No flashcards due right now. Add flashcards from a document, or check back later.
        </p>
        <Link to="/" className="text-[14px] text-gray-900 font-medium hover:underline underline-offset-2">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center animate-fade-in-up">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-[24px] font-semibold tracking-tight text-gray-900 mb-2">All done!</h1>
        <p className="text-[14px] text-gray-500 mb-5">You've reviewed all {cards.length} due flashcards.</p>
        <Link to="/" className="text-[14px] text-gray-900 font-medium hover:underline underline-offset-2">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  return (
    <div className="max-w-xl mx-auto px-5 py-14 animate-fade-in-up">
      <div className="h-1 bg-black/[0.06] rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gray-900 rounded-full"
          style={{ width: `${progress}%`, transition: "width 0.35s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </div>

      <p className="text-[13px] font-medium text-gray-400 mb-4">
        Card {index + 1} of {cards.length} &middot; {card.documentTitle}
      </p>

      <div className="flip-card-scene mb-6" style={{ height: 260 }}>
        <div
          className={`flip-card w-full h-full cursor-pointer ${flipped ? "is-flipped" : ""}`}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className="flip-card-face absolute inset-0 card-surface flex items-center justify-center text-center p-8">
            <div>
              <p className="text-[12px] font-medium text-gray-400 mb-4 tracking-wide uppercase">Question</p>
              <p className="text-[19px] text-gray-900 font-medium leading-snug">{card.question}</p>
              <p className="text-[12px] text-gray-300 mt-6">Tap to flip</p>
            </div>
          </div>
          <div className="flip-card-face flip-card-back rounded-[1.25rem] bg-gray-900 flex items-center justify-center text-center p-8 shadow-[var(--shadow-lift)]">
            <div>
              <p className="text-[12px] font-medium text-gray-400 mb-4 tracking-wide uppercase">Answer</p>
              <p className="text-[19px] text-white font-medium leading-snug">{card.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="flex gap-3 animate-fade-in">
          <button
            type="button"
            disabled={reviewing}
            onClick={() => handleReview(false)}
            className="flex-1 rounded-full px-4 py-3 text-[14px] font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            Got it wrong
          </button>
          <button
            type="button"
            disabled={reviewing}
            onClick={() => handleReview(true)}
            className="flex-1 btn-primary py-3 text-[14px] disabled:opacity-40"
          >
            Got it right
          </button>
        </div>
      ) : (
        <p className="text-center text-[13px] text-gray-400">Click the card to reveal the answer</p>
      )}
    </div>
  );
}
