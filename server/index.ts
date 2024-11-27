import "dotenv/config";

import { CONFIG } from "./config.js";
import { createServer } from "./server.js";

const isProduction = CONFIG.NODE_ENV === "production";
const app = await createServer(isProduction);
console.log("Server routes:\r\n", app.printRoutes());

const listenHost = await app.listen({ host: "0.0.0.0", port: CONFIG.SERVER_PORT });
console.info(`Server listening at ${listenHost}`);

// Listen to typical SIGINT and SIGTERM signals
// so that we can gracefully close the server
// and enable rolling update strategy.
process.on("SIGINT", async () => {
  console.info(`\r\nReceived signal: SIGNING. Waiting for connections to close...`);
  await app.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.info(`\r\nReceived signal: SIGTERM. Killing immediately...`);
  process.exit(0);
});

// Vercel handler
export default async (req: Request, res: Response) => {
  await app.ready();
  app.server.emit("request", req, res);
};
