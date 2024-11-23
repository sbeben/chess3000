import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    serverData?: Record<string, any>;
  }
}
