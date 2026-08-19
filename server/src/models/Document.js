import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    rawText: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
