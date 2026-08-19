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
