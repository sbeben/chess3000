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
      init: "5:00",
      rules: [
        {
          name: "valid time",
          validator: (value) => ({
            isValid: /^\d+:\d{2}$/.test(value),
            errorText: "Time must be in the format 'minutes:seconds'",
          }),
        },
      ],
    },
  },
  validateOn: ["submit"],
});

export const $colors = createStore(["white", "black", "random"]);
export const $timeControls = createStore(["3:00", "5:00", "10:00"]);

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
