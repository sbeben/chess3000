import { createEffect } from "effector";
import path from "path";

import { backendRequestFx } from "./fetch";

type CreateGameColor = "white" | "black" | "random";
type Color = "white" | "black";
type CreateGameReqDTO = {
  value: number;
  color: CreateGameColor;
  time: string; //'5:00'
};

type CreateGameResDTO = {
  // link: string;
  gameKey: string;
  playerId: string;
  // playerColor: Color;
  // value: number;
};

const createGameFx = createEffect<CreateGameReqDTO, CreateGameResDTO>(async ({ value, color, time }) => {
  return (await backendRequestFx({
    path: "/api/create",
    method: "POST",
    data: { value, color, time },
  })) as CreateGameResDTO;
});

export const api = { createGameFx };
