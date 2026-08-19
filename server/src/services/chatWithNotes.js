import DocumentChunk from "../models/DocumentChunk.js";
import { genAI, GEMINI_MODEL } from "../config/gemini.js";
import { chunkText, embedTexts, cosineSimilarity } from "./embeddings.js";

const TOP_K = 3;

async function ensureChunksExist(document) {
  const existing = await DocumentChunk.countDocuments({ documentId: document._id });
  if (existing > 0) return;

  const chunks = chunkText(document.rawText);
  if (chunks.length === 0) return;

  const embeddings = await embedTexts(chunks);
  await DocumentChunk.insertMany(
    chunks.map((text, i) => ({ documentId: document._id, chunkIndex: i, text, embedding: embeddings[i] }))
  );
}

export async function answerFromNotes(document, question) {
  await ensureChunksExist(document);

  const chunks = await DocumentChunk.find({ documentId: document._id });
  if (chunks.length === 0) {
    throw new Error("No content available to answer from");
  }

  const [questionEmbedding] = await embedTexts([question]);

  const ranked = chunks
    .map((c) => ({ text: c.text, score: cosineSimilarity(questionEmbedding, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);

  const context = ranked.map((r, i) => `[Excerpt ${i + 1}]\n${r.text}`).join("\n\n");

  const prompt = `You are a study assistant answering a question using only the excerpts below,
which come from the student's own notes. If the answer isn't contained in the excerpts,
say you don't know based on these notes rather than guessing.

Excerpts:
${context}

Question: ${question}

Answer concisely and directly.`;

  const response = await genAI.models.generateContent({ model: GEMINI_MODEL, contents: prompt });
  return response.text;
}
