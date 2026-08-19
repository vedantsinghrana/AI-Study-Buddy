import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

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
      setIndex((i) => i + 1);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save review. Please try again.");
    } finally {
      setReviewing(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500 text-center mt-10">Loading...</p>;
  if (error) return <p className="text-sm text-red-600 text-center mt-10">{error}</p>;

  if (!cards || cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Flashcards</h1>
        <p className="text-sm text-gray-500 mb-4">
          No flashcards due right now. Add flashcards from a document, or check back later.
        </p>
        <Link to="/" className="text-sm text-gray-900 font-medium">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">All done!</h1>
        <p className="text-sm text-gray-500 mb-4">You've reviewed all {cards.length} due flashcards.</p>
        <Link to="/" className="text-sm text-gray-900 font-medium">
          &larr; Back to notes
        </Link>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <p className="text-sm text-gray-500 mb-2">
        Card {index + 1} of {cards.length} &middot; {card.documentTitle}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="w-full border border-gray-200 rounded-lg p-10 text-center min-h-56 flex items-center justify-center mb-6 hover:bg-gray-50"
      >
        <div>
          <p className="text-xs text-gray-400 mb-3">{flipped ? "Answer" : "Question"} &middot; tap to flip</p>
          <p className="text-lg text-gray-900 font-medium">{flipped ? card.answer : card.question}</p>
        </div>
      </button>

      {flipped ? (
        <div className="flex gap-3">
          <button
            type="button"
            disabled={reviewing}
            onClick={() => handleReview(false)}
            className="flex-1 rounded-md px-4 py-2 text-sm font-medium border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Got it wrong
          </button>
          <button
            type="button"
            disabled={reviewing}
            onClick={() => handleReview(true)}
            className="flex-1 bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            Got it right
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400">Click the card to reveal the answer</p>
      )}
    </div>
  );
}
