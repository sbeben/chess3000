import type { PageContextServer } from "vike/types";

export async function data(
  pageContext: PageContextServer<{ color: "black" | "white" | "random"; time: number; increment: number }>,
) {
  const { routeParams, data } = pageContext;

  const { id } = routeParams;
  const { color, time, increment } = data ?? {};

  return {
    id: id ?? "",
    color: color ?? "",
    time: time ?? 0,
    increment: increment ?? null,
  };
}
