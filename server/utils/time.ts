export function parseTime(time: string): number {
  const [minutes, seconds] = time.split(":").map((value) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error("Invalid time format");
    }
    return num;
  });

  if (minutes === undefined || seconds === undefined) {
    throw new Error("Invalid time format");
  }

  return (minutes * 60 + seconds) * 1000;
}
