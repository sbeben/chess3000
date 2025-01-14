export const isTouchDevice = () => {
  if (typeof window === "undefined") {
    return false; // Return default value for server-side rendering
  }

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};
