import { z } from "zod";

const GAME_OVER_REASONS = [
  "timeout",
  "resignation",
  "stalemate",
  "checkmate",
  "threefold_repetition",
  "insufficient_material",
  "draw_agreement",
  "user_disconnected",
  "invalid_pick",
] as const;

export const WS_SERVER_COMMANDS_SCHEMA_DICT = z.object({
  created: z
    .object({
      playerColor: z.enum(["black", "white"]),
      value: z.number(),
      time: z.number(),
      increment: z.number(),
      link: z.string(),
    })
    .strict(),
  start: z
    .object({
      fen: z.string(),
    })
    .strict(),
  accepted: z.object({}).strict(),
  joined: z
    .object({
      playerColor: z.enum(["black", "white"]),
      value: z.number(),
      time: z.number(),
      increment: z.number(),
    })
    .strict(),
  move: z.object({
    move: z.object({
      from: z.string(),
      to: z.string(),
      promotion: z.string().optional(),
    }),
    timestamp: z.number(),
  }),
  draw_offer: z.object({ color: z.enum(["white", "black"]), timestamp: z.number() }).strict(),
  draw_decline: z.object({ timestamp: z.number() }).strict(),
  game_over: z
    .object({
      result: z.enum(["white", "black", "draw"]),
      reason: z.enum(GAME_OVER_REASONS),
    })
    .strict(),
  error: z.object({ message: z.string() }).strict(),
});

export const WS_CLIENT_COMMANDS_SCHEMA_DICT = z.object({
  confirm_pick: z.object({ position: z.record(z.string()) }).strict(),
  // opponent_picked: z.object({ timestamp: z.number() }).strict(),
  move: z
    .object({
      move: z.object({
        from: z.string(),
        to: z.string(),
        promotion: z.string().optional(),
      }),
      timestamp: z.number(),
    })
    .strict(),
  resign: z.object({ color: z.enum(["black", "white"]), timestamp: z.number() }).strict(),
  draw_offer: z.object({ color: z.enum(["white", "black"]), timestamp: z.number() }).strict(),
  draw_decline: z.object({ timestamp: z.number() }).strict(),
  draw_accept: z.object({ timestamp: z.number() }).strict(),
});

export type WsServerDataDict = z.infer<typeof WS_SERVER_COMMANDS_SCHEMA_DICT>;
export type WsClientDataDict = z.infer<typeof WS_CLIENT_COMMANDS_SCHEMA_DICT>;
export type GameOverReasons = (typeof GAME_OVER_REASONS)[number];

export const api = {
  CREATE_GAME: z
    .object({
      value: z.number().min(1).max(279),
      time: z.number().min(15).max(10800),
      increment: z.number().min(0).max(180),
      color: z.enum(["black", "white", "random"]),
    })
    .strict(),
  ACCEPT_INVITE: z
    .object({
      gameKey: z.string(),
    })
    .strict(),
  CONNECT: z
    .object({
      gameKey: z.string(),
      playerId: z.string(),
    })
    .strict(),
};

export type API = {
  CREATE_GAME: z.infer<typeof api.CREATE_GAME>;
  ACCEPT_INVITE: z.infer<typeof api.ACCEPT_INVITE>;
  CONNECT: z.infer<typeof api.CONNECT>;
};
