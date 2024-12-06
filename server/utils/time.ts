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

interface TimerConfig {
  time: number;
  increment: number | null;
  onTimeout?: () => void;
}

interface TimerOffset {
  offset: number;
}

export class Timer {
  private initialTime: number;
  private remainingTime: number;
  private increment: number | null;
  private startTime: number | null;
  private isRunning: boolean;
  private timeoutCallback: (() => void) | null;
  private timeoutId: NodeJS.Timeout | null;

  constructor({ time, increment, onTimeout }: TimerConfig) {
    this.initialTime = time;
    this.remainingTime = time;
    this.increment = increment;
    this.startTime = null;
    this.isRunning = false;
    this.timeoutCallback = onTimeout ?? null;
    this.timeoutId = null;
  }

  /**
   * Starts the timer with network latency offset
   * @param offset - Time offset in milliseconds
   * @returns number | null - Current remaining time if started, null if already running
   */
  start({ offset }: TimerOffset = { offset: 0 }): number | null {
    if (this.isRunning) {
      return null;
    }

    if (this.timeoutCallback && this.remainingTime > 0) {
      this.isRunning = true;
      this.startTime = Date.now() + offset;
      const timeoutDuration = Math.max(0, this.remainingTime + offset);
      this.timeoutId = setTimeout(() => {
        if (this.isRunning && this.getCurrentTime() <= 0) {
          this.isRunning = false;
          this.startTime = null;
          this.timeoutCallback?.();
        }
      }, timeoutDuration);
    }

    return Math.max(0, this.remainingTime + offset);
  }

  /**
   * Stops the timer with network latency offset
   * @param offset - Time offset in milliseconds
   * @returns number | null - Current remaining time if stopped, null if wasn't running
   */
  stop({ offset }: TimerOffset = { offset: 0 }): number | null {
    if (!this.isRunning || this.startTime === null) {
      return null;
    }

    // Calculate elapsed time with offset adjustment
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime - offset; // Subtract offset because the stop happened earlier
    this.remainingTime -= elapsedTime;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Apply increment if there's still time remaining
    if (this.increment && this.remainingTime > 0 && elapsedTime < this.increment) {
      this.remainingTime += this.increment;
    }

    this.isRunning = false;
    this.startTime = null;
    return Math.max(0, this.remainingTime);
  }

  getCurrentTime(): number {
    if (!this.isRunning || this.startTime === null) {
      return Math.max(0, this.remainingTime);
    }

    const currentTime = Date.now();
    const elapsedTime = currentTime - this.startTime;
    return Math.max(0, this.remainingTime - elapsedTime);
  }

  /**
   * Sets or updates the timeout callback
   * @param callback - Function to be called when timer reaches zero
   */
  setTimeoutCallback(callback: () => void): void {
    this.timeoutCallback = callback;

    // If timer is already running and time is remaining, set up the timeout
    // if (this.isRunning && this.remainingTime > 0) {
    //   if (this.timeoutId) {
    //     clearTimeout(this.timeoutId);
    //   }

    //   const currentTime = this.getCurrentTime();
    //   this.timeoutId = setTimeout(() => {
    //     if (this.isRunning && this.getCurrentTime() <= 0) {
    //       this.isRunning = false;
    //       this.startTime = null;
    //       this.timeoutCallback?.();
    //     }
    //   }, currentTime);
    // }
  }
  /**
   * Resets the timer to its initial state
   */
  cleanup(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.remainingTime = this.initialTime;
    this.isRunning = false;
    this.startTime = null;
  }
}
