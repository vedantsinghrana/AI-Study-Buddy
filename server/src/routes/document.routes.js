import { Router } from "express";
import { createDocument, listDocuments, getDocument } from "../controllers/document.controller.js";
import { generateQuiz, listQuestions } from "../controllers/quiz.controller.js";
import { createFlashcardsForDocument } from "../controllers/flashcard.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(requireAuth);
router.post("/", upload.single("file"), createDocument);
router.get("/", listDocuments);
router.get("/:id", getDocument);
router.post("/:id/generate-quiz", generateQuiz);
router.get("/:id/questions", listQuestions);
router.post("/:id/flashcards", createFlashcardsForDocument);

export default router;
