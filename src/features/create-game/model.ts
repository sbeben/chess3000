import { attach, createEvent, createStore, sample } from "effector";
import { createForm } from "effector-forms";
import { type CreateGameColor, api } from "~/shared/api/rest";
import { clientNavigate } from "~/shared/routing";

export const createGameClicked = createEvent();

export const gameForm = createForm({
  fields: {
    value: {
      init: 20,
      rules: [
        {
          name: "valid value",
          validator: (value) => ({
            isValid: typeof value === "number" && value > 0,
            errorText: "Value must be a positive number",
          }),
        },
      ],
    },
    color: {
      init: "random" as CreateGameColor,
      rules: [
        {
          name: "valid color",
          validator: (value) => ({
            isValid: value === "white" || value === "black" || value === "random",
            errorText: "Color must be either 'white' or 'black' or 'random'",
          }),
        },
      ],
    },
    time: {
      init: 300,
      rules: [
        {
          name: "valid time",
          validator: (value) => ({
            isValid: value > 0 && value <= 10800,
            errorText: "Time must be greater than 0 and up to 3 hours",
          }),
        },
      ],
    },
    increment: {
      init: 0,
      rules: [
        {
          name: "valid increment",
          validator: (value) => ({
            isValid: value >= 0 && value <= 180,
            errorText: "Increment must be in range from 0 to 60 seconds",
          }),
        },
      ],
    },
  },
  validateOn: ["submit"],
});

export const $colors = createStore(["white", "black", "random"]);
export const $timeControls = createStore([
  0,
  15,
  30,
  45,
  60,
  ...Array.from({ length: 19 }, (_, i) => (i + 2) * 60),
  ...Array.from({ length: 4 }, (_, i) => (i + 5) * 300),
  ...Array.from({ length: 9 }, (_, i) => (i + 4) * 900),
]);

export const $increments = createStore([
  0,
  ...Array.from({ length: 20 }, (_, i) => i + 1),
  ...Array.from({ length: 4 }, (_, i) => (i + 1) * 5),
  60,
  90,
  120,
  150,
  180,
]);

const createGameFx = attach({ effect: api.createGameFx });

sample({
  //@ts-expect-error
  clock: createGameClicked,
  target: gameForm.submit,
});

sample({
  clock: gameForm.formValidated,
  target: createGameFx,
});

sample({
  clock: createGameFx.doneData,
  fn: ({ gameKey, playerId }) => `/game/${gameKey}:${playerId}`,
  target: clientNavigate,
});
