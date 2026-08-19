import { genAI, GEMINI_MODEL } from "../config/gemini.js";
import { chatSchema } from "../utils/validation.js";
import { AppError } from "../middleware/errorHandler.js";

const SYSTEM_CONTEXT = `You are the in-app help assistant for "AI Study Buddy," a study app with these features:
- Upload notes (PDF or pasted text) as documents
- Generate a 10-question AI quiz from any document, with a "Focus on weak topics" option that regenerates harder questions on topics the user is scoring low on
- Flashcards with spaced repetition using a 5-box Leitner system: a correct answer pushes a card further out (longer interval before it's due again), a wrong answer resets it to box 1
- A Dashboard showing accuracy by topic and score trend over time
- A "Chat with your notes" feature on each document that answers questions grounded only in that document's content (different from you — you help with the app itself)

Answer the user's question about how to use the app, or general study tips.
Keep answers short and friendly, 2-4 sentences. If asked something completely
unrelated to studying or this app, politely redirect back to what you can help with.`;

async function askAssistant(question) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: `${SYSTEM_CONTEXT}\n\nUser question: ${question}`,
      });
      return response.text;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }
  throw lastError;
}

export async function assistantChat(req, res, next) {
  try {
    const { question } = chatSchema.parse(req.body);
    const answer = await askAssistant(question);
    res.json({ answer });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    console.error("Assistant chat failed:", err.message);
    next(new AppError(502, "Failed to answer your question. Please try again."));
  }
}
