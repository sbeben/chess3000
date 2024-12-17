import { type FastifyReply, type FastifyRequest } from "fastify";
import { ZodError, ZodSchema } from "zod";

export function validateReqBody(schema: ZodSchema<any>) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    try {
      schema.parse(req.body);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).send({ errors: error.errors });
        return;
      }
      throw error;
    }
  };
}

export function validateReqParams(schema: ZodSchema<any>) {
  return async (req: FastifyRequest, res: FastifyReply) => {
    try {
      schema.parse(req.params);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).send({ errors: error.errors });
        return;
      }
      throw error;
    }
  };
}
