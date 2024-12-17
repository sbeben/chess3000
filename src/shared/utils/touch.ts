export const isTouchDevice = () => {
  return !!window && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
};
