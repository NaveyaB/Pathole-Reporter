import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const env = (key: string, fallback = "") => process.env[key] ?? fallback;
const envInt = (key: string, fallback: number) => {
  const parsed = parseInt(env(key), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  env: env("NODE_ENV", "development"),
  port: envInt("PORT", 5000),
  apiPrefix: env("API_PREFIX", "/api"),
  jwtSecret: env("JWT_SECRET", "smart-pothole-reporter-secret-change-me"),
  jwtExpiresIn: env("JWT_EXPIRES_IN", "7d"),
  mongoUri: env("MONGO_URI"),
  dbEngine: env("DB_ENGINE", "memory"),
  clientUrl: env("CLIENT_URL", "http://localhost:5173"),
  mlServiceUrl: env("ML_SERVICE_URL", "http://localhost:8000"),
  mlServiceTimeout: envInt("ML_SERVICE_TIMEOUT", 60000),
  uploadDir: env("UPLOAD_DIR", "uploads"),
  uploadsRoot: path.resolve(__dirname, "../../", env("UPLOAD_DIR", "uploads")),
  maxFileSize: env("MAX_FILE_SIZE", "10mb"),
  rateLimit: {
    window: envInt("RATE_LIMIT_WINDOW", 15),
    max: envInt("RATE_LIMIT_MAX", 300),
  },
  cloudinary: {
    cloudName: env("CLOUDINARY_CLOUD_NAME"),
    apiKey: env("CLOUDINARY_API_KEY"),
    apiSecret: env("CLOUDINARY_API_SECRET"),
  },
} as const;

export const isProd = config.env === "production";
