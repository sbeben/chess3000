export function getUrl(defaultPort: number = 3000) {
  if (import.meta.env.PROD) {
    console.log(`i'm in PROD`);
    return import.meta.env.PUBLIC_ENV__HOST;
  }

  // Check if we're in the browser
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${defaultPort}`;
  }

  // Fallback for SSR context
  return `http://0.0.0.0:${defaultPort}`;
}

export const getWebSocketUrl = (httpUrl: string) => {
  const url = new URL(httpUrl);
  // Replace http(s) with ws(s)
  const isSecure = url.protocol === "https:";
  url.protocol = url.protocol.replace(isSecure ? "https" : "http", isSecure ? "wss" : "ws");
  return url.toString();
};
