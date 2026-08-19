import { Router } from "express";
import { listDueFlashcards, reviewFlashcard } from "../controllers/flashcard.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/due", listDueFlashcards);
router.post("/:id/review", reviewFlashcard);

export default router;
