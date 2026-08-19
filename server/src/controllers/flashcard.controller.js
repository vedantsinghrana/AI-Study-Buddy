import Document from "../models/Document.js";
import Question from "../models/Question.js";
import Flashcard from "../models/Flashcard.js";
import { AppError } from "../middleware/errorHandler.js";
import { reviewFlashcardSchema } from "../utils/validation.js";
import { nextBoxState } from "../services/leitner.js";

export async function createFlashcardsForDocument(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }

    const questions = await Question.find({ documentId: document._id });
    if (questions.length === 0) {
      throw new AppError(400, "Generate a quiz for this document first");
    }

    const ops = questions.map((q) => ({
      updateOne: {
        filter: { userId: req.userId, questionId: q._id },
        update: {
          $setOnInsert: {
            userId: req.userId,
            questionId: q._id,
            documentId: document._id,
            box: 1,
            nextReviewDate: new Date(),
          },
        },
        upsert: true,
      },
    }));
    await Flashcard.bulkWrite(ops);

    const count = await Flashcard.countDocuments({ documentId: document._id, userId: req.userId });
    res.status(201).json({ count });
  } catch (err) {
    next(err);
  }
}

export async function listDueFlashcards(req, res, next) {
  try {
    const cards = await Flashcard.find({ userId: req.userId, nextReviewDate: { $lte: new Date() } })
      .populate("questionId", "question correctAnswer topic")
      .populate("documentId", "title")
      .sort({ nextReviewDate: 1 })
      .limit(50);

    res.json({
      cards: cards
        .filter((c) => c.questionId)
        .map((c) => ({
          id: c._id,
          question: c.questionId.question,
          answer: c.questionId.correctAnswer,
          topic: c.questionId.topic,
          documentTitle: c.documentId?.title,
          box: c.box,
        })),
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewFlashcard(req, res, next) {
  try {
    const { correct } = reviewFlashcardSchema.parse(req.body);
    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) {
      throw new AppError(404, "Flashcard not found");
    }

    const { box, nextReviewDate } = nextBoxState(card.box, correct);
    card.box = box;
    card.nextReviewDate = nextReviewDate;
    await card.save();

    res.json({ id: card._id, box: card.box, nextReviewDate: card.nextReviewDate });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}
