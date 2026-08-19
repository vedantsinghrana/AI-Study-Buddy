import Document from "../models/Document.js";
import Question from "../models/Question.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { AppError } from "../middleware/errorHandler.js";
import { submitQuizSchema } from "../utils/validation.js";
import { generateQuizQuestions } from "../services/quizGenerator.js";

function sanitizeQuestion(q) {
  return { id: q._id, question: q.question, options: q.options, topic: q.topic, difficulty: q.difficulty };
}

export async function generateQuiz(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }

    let questions;
    try {
      questions = await generateQuizQuestions(document.rawText);
    } catch (genErr) {
      console.error("Quiz generation failed:", genErr.message);
      throw new AppError(502, "Failed to generate quiz questions. Please try again.");
    }

    await Question.deleteMany({ documentId: document._id });
    const created = await Question.insertMany(
      questions.map((q) => ({ ...q, documentId: document._id }))
    );

    res.status(201).json({ questions: created.map(sanitizeQuestion) });
  } catch (err) {
    next(err);
  }
}

export async function listQuestions(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }
    const questions = await Question.find({ documentId: document._id });
    res.json({ questions: questions.map(sanitizeQuestion) });
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.documentId, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }

    const { answers } = submitQuizSchema.parse(req.body);
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds }, documentId: document._id });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    const results = [];
    const attemptAnswers = [];

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const correct = question.correctAnswer === answer.selectedOption;
      if (correct) score++;

      results.push({
        questionId: question._id,
        correct,
        correctAnswer: question.correctAnswer,
        selectedOption: answer.selectedOption,
      });
      attemptAnswers.push({ questionId: question._id, topic: question.topic, correct });
    }

    if (attemptAnswers.length === 0) {
      throw new AppError(400, "No valid answers submitted for this document");
    }

    const attempt = await QuizAttempt.create({
      userId: req.userId,
      documentId: document._id,
      score,
      total: attemptAnswers.length,
      answers: attemptAnswers,
    });

    res.status(201).json({ attemptId: attempt._id, score, total: attemptAnswers.length, results });
  } catch (err) {
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}
