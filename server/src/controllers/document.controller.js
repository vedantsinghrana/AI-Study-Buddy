import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import Document from "../models/Document.js";
import { AppError } from "../middleware/errorHandler.js";
import { createDocumentSchema } from "../utils/validation.js";

export async function createDocument(req, res, next) {
  try {
    const { title, text } = createDocumentSchema.parse(req.body);

    let rawText = text;

    if (req.file) {
      const buffer = await fs.readFile(req.file.path);
      const parsed = await pdfParse(buffer);
      rawText = parsed.text.trim();
      await fs.unlink(req.file.path).catch(() => {});
    }

    if (!rawText) {
      throw new AppError(400, "Provide either pasted text or a PDF file");
    }

    const document = await Document.create({ userId: req.userId, title, rawText });
    res.status(201).json({ document });
  } catch (err) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    if (err.name === "ZodError") {
      return next(new AppError(400, err.issues[0].message));
    }
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const documents = await Document.find({ userId: req.userId })
      .select("title createdAt")
      .sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}

export async function getDocument(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!document) {
      throw new AppError(404, "Document not found");
    }
    res.json({ document });
  } catch (err) {
    next(err);
  }
}
