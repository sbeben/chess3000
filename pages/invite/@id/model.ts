import { createEffect, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { clientNavigateFx, redirectTo } from "~/shared/routing";
import { $socket } from "~/shared/ws";

import { pageStarted } from "./+pageStarted";

export const accepted = createEvent();
export const declined = createEvent();

export const $id = createStore("");

export const gate = createGate();

const joinGameFx = createEffect(async (id: string) => {
  console.log(import.meta.env.PUBLIC_ENV__BASE_URL);
  let loaded = false;

  const ws = new WebSocket(`ws://${import.meta.env.PUBLIC_ENV__BASE_URL}/join/${id}`);
  ws.onopen = () => {
    console.log(`WebSocket connection established`);
    // ws.send("hello");
  };
  ws.onmessage = (event) => {
    console.log("Message from server:", event.data);
  };
  const timeout = 30000; // 30 seconds timeout
  const startTime = Date.now();

  while (!loaded) {
    if (Date.now() - startTime > timeout) {
      throw new Error("WebSocket connection timeout");
    }
    loaded = ws.readyState === WebSocket.OPEN;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  return ws;
});

sample({
  clock: pageStarted,
  fn: ({ data }) => data.id,
  target: $id,
});

//client
sample({
  clock: accepted,
  source: $id,
  target: joinGameFx,
});

sample({
  clock: joinGameFx.doneData,
  target: $socket,
});

sample({
  clock: joinGameFx.doneData,
  source: $id,
  fn: (id) => `/game/${id}`,
  target: clientNavigateFx,
});

sample({
  clock: joinGameFx.failData,
  target: redirectTo("/"),
});
