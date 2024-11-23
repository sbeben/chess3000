import type { FastifyRequest } from "fastify";

// export const BASE_URL = `${import.meta.env.PUBLIC_ENV__BASE_PROTOCOL}${import.meta.env.PUBLIC_ENV__BASE_URL}`;
export function createInviteLink(gameKey: string, req: FastifyRequest): string {
  return `${req.protocol}://${req.hostname}/invite/${gameKey}`;
}
