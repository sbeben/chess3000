import { createFactory } from "@withease/factories";
import { createEvent, createStore, sample } from "effector";
import { interval, spread } from "patronum";

export const createTimer = createFactory(() => {
  const TICK_DURATION = 100; //ms

  const $timer = createStore(0);
  const $increment = createStore(0);

  const $lastTickTimestamp = createStore(0);

  const start = createEvent<{ offset: number }>();
  const stop = createEvent<{ offset: number }>();

  const $startTime = createStore(0);

  const timeout = createEvent();

  const startTimer = createEvent();
  const stopTimer = createEvent();

  const { tick } = interval({
    timeout: TICK_DURATION,
    start: startTimer,
    stop: stopTimer,
  });

  sample({
    clock: startTimer,
    fn: () => Date.now(),
    target: [$startTime, $lastTickTimestamp],
  });

  sample({
    clock: tick,
    source: { timer: $timer, lastTickTimestamp: $lastTickTimestamp },
    fn: ({ timer, lastTickTimestamp }) => {
      const now = Date.now();
      return { timer: timer - (now - lastTickTimestamp), lastTickTimestamp: now };
    },
    target: spread({ timer: $timer, lastTickTimestamp: $lastTickTimestamp }),
  });

  sample({
    clock: start,
    source: $timer,
    fn: (time, { offset }) => time + offset,
    target: [$timer, startTimer],
  });

  sample({
    clock: stop,
    source: { timer: $timer, startTime: $startTime, increment: $increment },
    fn: ({ timer, startTime, increment }, { offset }) =>
      timer - startTime > increment ? timer + offset : timer + offset + increment,
    target: [$timer, stopTimer, $startTime.reinit],
  });

  sample({
    clock: $timer.updates,
    filter: (time) => time <= 0,
    fn: () => 0,
    target: [$timer, stopTimer, timeout],
  });

  return {
    $timer,
    $increment,
    start,
    stop,
    timeout,
  };
});
