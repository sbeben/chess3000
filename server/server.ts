import path from "node:path";

import type { CookieSerializeOptions } from "@fastify/cookie";
import websocket from "@fastify/websocket";
import "dotenv/config";
import fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { renderPage } from "vike/server";

import { CONFIG } from "./config.js";
import { directoryRoot } from "./directory-root.js";
import { applyFlyProxy } from "./fly-proxy.js";
import { createGameCommands, createGameRoom } from "./modules/game.js";
import { WSMap, parse, send, validate } from "./modules/ws.js";
import { FEN, customToFen } from "./utils/chess.js";
import { Timer, parseTime } from "./utils/time.js";
import { createInviteLink } from "./utils/url.js";

export async function createServer(isProduction: boolean) {
  const app = fastify({
    trustProxy: true,
    logger: isProduction
      ? true
      : {
          level: "warn",
          transport: {
            target: "pino-pretty",
          },
        },
  });

  await applyFlyProxy(app);
  await app.register(websocket);
  await app.register(import("@fastify/compress"), { global: true });

  await app.register(import("@fastify/early-hints"), {
    // indicates if the plugin should log warnings if invalid values are supplied as early hints
    warn: true,
  });

  // Vite integration
  if (isProduction) {
    await app.register(import("@fastify/cors"), {
      origin: CONFIG.PUBLIC_HOST,
      methods: ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE"],
    });

    await app.register(import("@fastify/accepts"));

    await app.register(import("@fastify/cookie"));

    await app.register(import("@fastify/helmet"), { contentSecurityPolicy: false });

    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    await app.register(import("@fastify/static"), {
      root: path.join(`${directoryRoot}/..`, "client", "assets"),
      prefix: "/assets/",
    });

    await app.register(import("@fastify/rate-limit"), {
      max: 100,
      timeWindow: "1 minute",
    });
  } else {
    // We instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our production server.)
    const vite = await import("vite");
    const viteServer = await vite.createServer({
      root: directoryRoot,
      server: { middlewareMode: true, host: "0.0.0.0" },
      logLevel: "error",
    });
    await app.register(import("@fastify/cors"), {
      origin: ["*"],
      credentials: true,
      methods: ["HEAD", "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Origin",
        "Accept",
        "X-Requested-With",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Credentials",
      ],
      exposedHeaders: ["Access-Control-Allow-Origin", "Access-Control-Allow-Credentials"],
      preflight: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    app.addHook("onRequest", async (request, reply) => {
      const next = () =>
        new Promise<void>((resolve) => {
          viteServer.middlewares(request.raw, reply.raw, () => resolve());
        });
      await next();
    });
  } // !isProduction
  // Any custom middlewares here. Like API middlewares, etc.

  app.decorateRequest("serverData", null);
  app.addHook("preHandler", async (req, res) => {
    // Process data here based on the route
    if (req.url.startsWith("/game")) {
      //console.log({ paramssss: req.params });
      // req.serverData = { foo: "bar" };
    }
  });

  app.post<{
    Body: { value: number; color: "black" | "white" | "random"; time: number; increment: number };
  }>("/create", function handler(req, res) {
    // bound to fastify server
    // this.myDecoration.someFunc()

    const { time, color, value, increment } = req.body;
    let playerColor = color;
    if (playerColor === "random") {
      playerColor = Math.random() > 0.5 ? "black" : "white";
    }
    const gameKey = Math.random().toString(36).substring(2, 15);
    const playerId = Math.random().toString(36).substring(2, 15);

    // The WebSocket connection is not open at this point, it opens in /game route
    WSMap[gameKey] = createGameRoom({ gameKey, playerId, playerColor, value, time, increment });
    console.log("game created", WSMap[gameKey]);
    res.status(201).send({
      gameKey,
      playerId,
    });
  });

  app.get<{ Params: { gameKey: string } }>(
    "/invite/:gameKey",
    //
    function wsHandler(req, res) {
      const { gameKey } = req.params;

      const gameRoom = WSMap[gameKey];
      if (!gameRoom) {
        res.status(404).send("Not found");
        return;
      }

      const acceptingPlayerId = Math.random().toString(36).substring(2, 15);

      res.redirect(`/game/${gameKey}:${acceptingPlayerId}`);
    },
  );

  app.get<{ Params: { gameKey: string; playerId: string } }>(
    "/connect/:gameKey/:playerId",
    { websocket: true },
    function handler(socket, req) {
      const { gameKey, playerId } = req.params;

      if (!gameKey || !playerId) {
        socket.close();
        return;
      }
      const gameRoom = WSMap[gameKey];
      if (!gameRoom) {
        socket.close();
        throw new Error("Connection not found");
        return;
      }
      if (gameRoom.status === "created") {
        if (!gameRoom.players[playerId]) {
          socket.close();
          delete WSMap[gameKey];
          return;
        }

        const { value, time } = gameRoom;
        const { color } = gameRoom.players[playerId]!;

        gameRoom.players[playerId]!.conn = socket;
        send(socket, "created", {
          playerColor: color,
          value,
          time: time.initial,
          increment: time.increment,
          link: createInviteLink(gameKey, req),
        });

        gameRoom.status = "waiting";

        createGameCommands({ gameKey, playerId, socket });

        //at this point we have inviter sitting on /game page with connected socket waiting for other player
      } else if (gameRoom.status === "waiting") {
        const invitingPlayerEntry = Object.entries(gameRoom.players)[0];

        if (!invitingPlayerEntry || !invitingPlayerEntry[1].conn) {
          socket.close();
          delete WSMap[gameKey];
          return;
        }

        const invitingPlayerId = invitingPlayerEntry[0];
        const invitingPlayer = invitingPlayerEntry[1];
        const acceptingPlayerColor = invitingPlayer.color === "black" ? "white" : "black";

        gameRoom.players[playerId] = {
          conn: socket,
          color: acceptingPlayerColor,
          pick: null,
          timer: new Timer({
            time: gameRoom.time.initial,
            increment: gameRoom.time.increment,
          }),
        };
        createGameCommands({ gameKey, playerId, socket });
        gameRoom.status = "pick";

        send(invitingPlayer.conn!, "accepted", {});
        send(socket, "joined", {
          value: gameRoom.value,
          playerColor: acceptingPlayerColor,
          time: gameRoom.time.initial,
          increment: gameRoom.time.increment,
        });
      }
    },
  );

  // Vike middleware. It should always be our last middleware
  // (because it's a catch-all middleware superseding any middleware placed after it).
  app.get("*", async (request, reply) => {
    // Accessor reads, sets, and removes cookies.
    const cookies = createCookiesAccessor(request, reply);

    // The page context is passed to renderer/+onRenderHtml.tsx
    const pageContextInit = {
      urlOriginal: `${request.protocol}://${request.hostname}${request.url}`,
      cookies,
      data: request.serverData,
    };
    const pageContext = await renderPage(pageContextInit);
    if (pageContext.errorWhileRendering) {
      app.log.error({ errorWhileRendering: pageContext.errorWhileRendering }, "Error while rendering page");
      return reply.status(500).send("Error while rendering page");
      // Install error tracking here, see https://vike.dev/errors
    }

    const { httpResponse } = pageContext;
    if (!httpResponse) {
      // TODO: here we could render a 404 page
      return reply.callNotFound();
    }

    const { statusCode, headers, earlyHints } = httpResponse;

    // Write hints before sending the response
    await reply.writeEarlyHints({ Link: earlyHints.map((hint) => hint.earlyHintLink) });

    headers.forEach(([name, value]) => reply.header(name, value));

    reply.status(statusCode).send(httpResponse.body);

    // see https://vike.dev/streaming
    // https://www.npmjs.com/package/react-streaming
    return reply;
  });

  return app;
}

function createCookiesAccessor(request: FastifyRequest, reply: FastifyReply) {
  return {
    get(name: string): string | undefined {
      return request.cookies[name];
    },
    set(name: string, value: string, options: CookieSerializeOptions) {
      reply.setCookie(name, value, options);
    },
    remove(name: string, options: CookieSerializeOptions) {
      reply.clearCookie(name, options);
    },
  };
}
