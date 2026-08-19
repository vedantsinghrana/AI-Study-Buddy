import { Type } from "@google/genai";
import { genAI, GEMINI_MODEL } from "../config/gemini.js";
import { quizGenerationSchema } from "../utils/validation.js";

const QUESTIONS_PER_QUIZ = 10;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 answer options",
          },
          correctAnswer: {
            type: Type.STRING,
            description: "Must exactly match one of the strings in options",
          },
          topic: {
            type: Type.STRING,
            description: "A short topic label (2-4 words) this question belongs to",
          },
          difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] },
        },
        required: ["question", "options", "correctAnswer", "topic", "difficulty"],
      },
    },
  },
  required: ["questions"],
};

function buildPrompt(text, focusTopics) {
  const focusInstruction = focusTopics?.length
    ? ` Prioritize these weak topics and make those questions harder: ${focusTopics.join(", ")}.`
    : "";

  return `Generate ${QUESTIONS_PER_QUIZ} multiple-choice quiz questions from the study notes below.
Cover distinct topics spread across the material rather than clustering on one section.
Each question must have exactly 4 options with exactly one correct answer that is an exact
string match to one of the options. Use short, consistent topic labels so similar questions
share the same topic string.${focusInstruction}

Study notes:
"""
${text}
"""`;
}

async function callGemini(text, focusTopics) {
  const response = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: buildPrompt(text, focusTopics),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  return JSON.parse(response.text);
}

export async function generateQuizQuestions(text, focusTopics) {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callGemini(text, focusTopics);
      const parsed = quizGenerationSchema.parse(raw);
      return parsed.questions;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}
