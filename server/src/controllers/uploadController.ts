import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { sendSuccess } from "../utils/response.js";
import { toPublicUrl } from "../middleware/upload.js";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req.file as Express.Multer.File | undefined) ?? (req.files as Express.Multer.File[] | undefined)?.[0];
  if (!file) throw ApiError.badRequest("No image provided");

  sendSuccess(
    res,
    {
      url: toPublicUrl(file.filename),
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    },
    "Image uploaded",
    201
  );
});
