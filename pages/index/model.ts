import { attach, createEffect, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { api } from "~/shared/api/rest";
import { clientNavigate } from "~/shared/routing";

import { pageStarted } from "./+pageStarted";

export const gate = createGate();

export const createGameClicked = createEvent();

const createGameFx = attach({ effect: api.createGameFx });

sample({
  //@ts-expect-error
  clock: createGameClicked,
  // source: { value: Game.$value, color: Game.$color, time: Game.$time },
  fn: () => ({ value: 20, color: "white", time: "5:00" }),
  target: createGameFx,
});

sample({
  clock: createGameFx.doneData,
  fn: ({ gameKey, playerId }) => `/game/${gameKey}:${playerId}`,
  target: clientNavigate,
});
