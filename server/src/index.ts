import { config } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { createApp } from "./app.js";
import { seedData } from "./data/store.js";

const bootstrap = async () => {
  const connected = await connectDatabase();
  if (!connected && !config.mongoUri) {
    console.log("[db] Using seeded in-memory store (set MONGO_URI to use MongoDB)");
  }

  await seedData();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`[api] Smart Pothole Reporter API running at http://localhost:${config.port}${config.apiPrefix}`);
    console.log(`[api] Demo accounts -> GET ${config.apiPrefix}/auth/demo-accounts`);
  });
};

bootstrap().catch((err) => {
  console.error("[api] Failed to start:", err);
  process.exit(1);
});
