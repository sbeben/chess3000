import { createEvent, createStore } from "effector";

export const resign = createEvent();

export const offerDrawClicked = createEvent();
export const offerDraw = createEvent();

export const acceptDraw = createEvent();
export const declineDraw = createEvent();

export const $offeredDraw = createStore(false);
export const $opponentOfferedDraw = createStore(false);
