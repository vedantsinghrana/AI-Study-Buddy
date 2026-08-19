import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true, index: true },
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: { validator: (arr) => arr.length === 4, message: "options must have exactly 4 entries" },
    },
    correctAnswer: { type: String, required: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
