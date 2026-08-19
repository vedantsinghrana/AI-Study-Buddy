import { Router } from "express";
import { submitQuiz } from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/:documentId/submit", submitQuiz);

export default router;
