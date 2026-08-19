import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    box: { type: Number, default: 1, min: 1, max: 5 },
    nextReviewDate: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

flashcardSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.model("Flashcard", flashcardSchema);
