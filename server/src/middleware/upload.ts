import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { config } from "../config/env.js";

const ACCEPTED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

fs.mkdirSync(config.uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadsRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED.has(file.mimetype)) return cb(null, true);
    cb(new Error("Only image files (JPEG, PNG, WEBP, GIF, HEIC) are allowed"));
  },
});

export const toPublicUrl = (filename: string): string =>
  `${config.apiPrefix}/uploads/${filename}`;
