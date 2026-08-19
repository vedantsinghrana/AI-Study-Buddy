import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

export default function ChatPanel({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setError("");
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setSending(true);

    try {
      const { data } = await api.post(`/documents/${documentId}/chat`, { question });
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer }]);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get an answer. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card-surface mt-6 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-black/[0.06] flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <h2 className="text-[14px] font-medium text-gray-700">Chat with your notes</h2>
      </div>

      <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-[14px] text-gray-400">Ask a question about this document.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user" ? "text-white rounded-br-md" : "bg-black/[0.045] text-gray-800 rounded-bl-md"
              }`}
              style={m.role === "user" ? { background: "var(--gradient-primary)" } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-black/[0.045] rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-[13px] text-red-600 px-5 pb-2 animate-fade-in">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-black/[0.06]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this document..."
          className="input-field flex-1 px-3.5 py-2 text-[14px] text-gray-900 placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary px-4 py-2 text-[14px] disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
