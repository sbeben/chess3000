import { attach, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { api } from "~/shared/api/rest";
import { clientNavigate, redirectTo } from "~/shared/routing";

import { pageStarted } from "./+pageStarted";

export const accepted = createEvent();
export const declined = createEvent();

export const $id = createStore("");

export const gate = createGate();

export const $color = createStore<"black" | "white" | "random">("random");

export const $time = createStore(0);

export const $increment = createStore(0);

const joinGameFx = attach({ effect: api.acceptInviteFx });

sample({
  clock: pageStarted,
  filter: ({ data }) => !data.id || !data.color || !data.time,
  target: redirectTo("/"),
});

sample({
  clock: pageStarted,
  fn: ({ data }) => data,
  target: spread({ id: $id, color: $color, time: $time, increment: $increment }),
});

//client
sample({
  clock: accepted,
  source: $id,
  target: joinGameFx,
});

sample({
  clock: [declined, joinGameFx.failData],
  target: clientNavigate.prepend(() => "/"),
});
