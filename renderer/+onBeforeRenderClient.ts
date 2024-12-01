import { fork } from "effector";

// https://vike.dev/onBeforeRenderClient
export function onBeforeRenderClient(pageContext: Vike.PageContext) {
  console.log("onBeforeRenderClient", pageContext.scopeValues);
  // https://vike.dev/pageContext
  if (!("scope" in pageContext)) {
    return {
      pageContext: {
        // https://effector.dev/en/api/effector/fork/
        scope: fork({ values: pageContext.scopeValues }),
      },
    };
  }
}
