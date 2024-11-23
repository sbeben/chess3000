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

const createGameFx = createEffect<CreateGameReqDTO, CreateGameResDTO>(
  async ({ value = 10, color = "white", time = "5:00" }) => {
    return (await backendRequestFx({
      path: `/create/${value}/${color}/${time}`,
      method: "POST",
    })) as CreateGameResDTO;
  },
);

export const api = { createGameFx };
