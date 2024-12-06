export const formatTimer = (time: number): string => {
  if (time >= 10000) {
    const s = Math.floor(time / 1000);
    return `${(s / 60) | 0}:${(s % 60).toString().padStart(2, "0")}`;
  }
  return `${Math.floor(time / 1000)}:${Math.floor((time % 1000) / 10)
    .toString()
    .padStart(2, "0")}`;
};

export const formatSeconds = (time: number) => {
  const minutes = time / 60;
  const seconds = Math.floor(time % 60);
  return `${Math.floor(minutes)}:${seconds.toString().padStart(2, "0")}`;
};
