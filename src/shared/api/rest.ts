import { createEffect } from "effector";

import { backendRequestFx } from "./fetch";

export type CreateGameColor = "white" | "black" | "random";
type Color = "white" | "black";
type CreateGameReqDTO = {
  value: number;
  color: CreateGameColor;
  time: number;
  increment: number;
};

type CreateGameResDTO = {
  // link: string;
  gameKey: string;
  playerId: string;
  // playerColor: Color;
  // value: number;
};

const createGameFx = createEffect<CreateGameReqDTO, CreateGameResDTO>(async (data) => {
  return (await backendRequestFx({
    path: "/create",
    method: "POST",
    data,
  })) as CreateGameResDTO;
});

const acceptInviteFx = createEffect<string, void>(async (gameKey) => {
  return (await backendRequestFx({
    path: `/accept/${gameKey}`,
    method: "GET",
  })) as void;
});

export const api = { createGameFx, acceptInviteFx };
