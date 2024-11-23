import type { PageContextServer } from "vike/types";

export async function data(pageContext: PageContextServer) {
  const { routeParams } = pageContext;
  console.log({ routeParams });
  const { id } = routeParams;

  return {
    id: id ?? "<empty>",
  };
}
