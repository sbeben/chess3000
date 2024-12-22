import type { PageContextServer } from "vike/types";

export async function data(pageContext: PageContextServer<Record<string, string>>) {
  const { routeParams, data } = pageContext;
  const [gameKey, playerId] = routeParams.id?.split(":") ?? [null, null];

  return {
    gameKey: gameKey ?? "<empty>",
    playerId: playerId ?? "<empty>",
  };
}
