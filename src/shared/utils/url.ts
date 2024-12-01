export const getWebSocketUrl = (httpUrl: string) => {
  const url = new URL(httpUrl);
  // Replace http(s) with ws(s)
  const isSecure = url.protocol === "https:";
  url.protocol = url.protocol.replace(isSecure ? "https" : "http", isSecure ? "wss" : "ws");
  return url.toString();
};
