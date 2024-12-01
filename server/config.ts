export const CONFIG = {
  get FLY_ALLOC_ID() {
    return globalThis.process.env.FLY_ALLOC_ID;
  },
  get NODE_ENV() {
    return globalThis.process.env.NODE_ENV;
  },

  get SERVER_PORT() {
    return Number.parseInt(globalThis.process.env.SERVER_PORT ?? "3000", 10);
  },

  get PUBLIC_HOST() {
    return globalThis.process.env.PUBLIC_ENV__HOST ?? `http://localhost:${CONFIG.SERVER_PORT}`;
  },
};
