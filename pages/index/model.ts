import * as Game from "~/game/model";
import * as WSApi from "~/shared/ws";
import { attach, createEffect, createEvent, createStore, sample } from "effector";
import { createGate } from "effector-react";
import { spread } from "patronum";
import { api } from "~/shared/api/rest";
import { clientNavigateFx } from "~/shared/routing";
import { $socket } from "~/shared/ws";

import { pageStarted } from "./+pageStarted";

export const gate = createGate();

export const createGameClicked = createEvent();

const createGameFx = attach({ effect: api.createGameFx });

sample({
  //@ts-expect-error
  clock: createGameClicked,
  // source: { value: Game.$value, color: Game.$color, time: Game.$time },
  target: createGameFx,
});

sample({
  clock: createGameFx.doneData,
  fn: ({ gameKey, playerId }) => `/game/${gameKey}:${playerId}`,
  target: clientNavigateFx,
});

// sample({
//   clock: WSApi.messageReceived,
//   filter: ({ type }) => type === "created",
//   fn: ({ data }) => ({ playerId: data.playerId, gameKey: data.gameKey }),
//   target: spread({ playerId: Game.$selfId, gameKey: Game.$key }),
// });
