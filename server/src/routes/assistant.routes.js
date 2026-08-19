import { Router } from "express";
import { assistantChat } from "../controllers/assistant.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/chat", requireAuth, assistantChat);

export default router;
