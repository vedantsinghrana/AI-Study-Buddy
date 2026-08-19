import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  text: z.string().trim().min(1, "Text is required").optional(),
});

export const quizQuestionSchema = z
  .object({
    question: z.string().trim().min(1),
    options: z.array(z.string().trim().min(1)).length(4),
    correctAnswer: z.string().trim().min(1),
    topic: z.string().trim().min(1),
    difficulty: z.enum(["easy", "medium", "hard"]),
  })
  .refine((q) => q.options.includes(q.correctAnswer), {
    message: "correctAnswer must exactly match one of the options",
  });

export const quizGenerationSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1),
});

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOption: z.string().min(1),
      })
    )
    .min(1),
});
