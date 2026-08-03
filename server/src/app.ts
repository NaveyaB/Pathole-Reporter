import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { config, isProd } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.js";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  app.use(
    cors({
      origin: isProd ? config.clientUrl : true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  app.use(
    morgan(isProd ? "combined" : "dev", {
      skip: (req) => req.path.startsWith(`${config.apiPrefix}/uploads`),
    })
  );

  app.use(
    rateLimit({
      windowMs: config.rateLimit.window * 60 * 1000,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many requests, please try again later" },
    })
  );

  app.use(
    config.apiPrefix + "/uploads",
    express.static(path.resolve(config.uploadsRoot), { maxAge: "7d", immutable: true })
  );

  app.use(config.apiPrefix, routes);

  app.use(errorHandler);

  return app;
};
