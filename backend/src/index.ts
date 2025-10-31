import { createServer } from "http";
import { createApp } from "./app/server";
import { loadEnv } from "./config/env";
import { createLogger } from "./lib/logger";

async function bootstrap() {
  const env = loadEnv();
  const app = createApp();
  const server = createServer(app);
  const logger = createLogger();

  server.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "EquiXToken backend listening");
  });
}

void bootstrap();
