import mongoose from "mongoose";
import QuizAttempt from "../models/QuizAttempt.js";

export async function weakTopics(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const results = await QuizAttempt.aggregate([
      { $match: { userId } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.topic",
          correct: { $sum: { $cond: ["$answers.correct", 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          topic: "$_id",
          correct: 1,
          total: 1,
          accuracy: { $round: [{ $multiply: [{ $divide: ["$correct", "$total"] }, 100] }, 0] },
        },
      },
      { $sort: { accuracy: 1 } },
    ]);

    res.json({ topics: results });
  } catch (err) {
    next(err);
  }
}

export async function scoreTrend(req, res, next) {
  try {
    const attempts = await QuizAttempt.find({ userId: req.userId })
      .populate("documentId", "title")
      .sort({ createdAt: 1 })
      .select("score total createdAt documentId");

    const trend = attempts.map((a) => ({
      id: a._id,
      date: a.createdAt,
      score: a.score,
      total: a.total,
      percentage: Math.round((a.score / a.total) * 100),
      documentTitle: a.documentId?.title || "Deleted document",
    }));

    res.json({ attempts: trend });
  } catch (err) {
    next(err);
  }
}
