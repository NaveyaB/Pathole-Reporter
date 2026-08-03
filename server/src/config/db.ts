import mongoose from "mongoose";
import { config } from "./env.js";

let connected = false;

export const connectDatabase = async (): Promise<boolean> => {
  if (!config.mongoUri) return false;
  try {
    await mongoose.connect(config.mongoUri);
    connected = true;
    return true;
  } catch (err) {
    console.warn("[db] MongoDB connection failed, falling back to in-memory store.", err instanceof Error ? err.message : "");
    return false;
  }
};

export const isMongoConnected = (): boolean => connected;
export const disconnectDatabase = async (): Promise<void> => {
  if (connected) {
    await mongoose.disconnect();
    connected = false;
  }
};
