import Document from "../models/Document.js";
import { AppError } from "../middleware/errorHandler.js";
import { chatSchema } from "../utils/validation.js";
import { answerFromNotes } from "../services/chatWithNotes.js";

export async function chatWithDocument(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }

    const { question } = chatSchema.parse(req.body);

    let answer;
    try {
      answer = await answerFromNotes(document, question);
    } catch (chatErr) {
      console.error("Chat failed:", chatErr.message);
      throw new AppError(502, "Failed to answer your question. Please try again.");
    }

    res.json({ answer });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}
