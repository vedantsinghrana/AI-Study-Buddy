import { Router } from "express";
import { weakTopics, scoreTrend } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/weak-topics", weakTopics);
router.get("/score-trend", scoreTrend);

export default router;
