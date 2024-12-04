import { createFactory } from "@withease/factories";
import { type EventCallable, type StoreWritable, createEvent, createStore } from "effector";

export const $$setableStore = createFactory(<T>(defaultValue: T): [StoreWritable<T>, EventCallable<T>] => {
  const $store = createStore<T>(defaultValue);
  const set = createEvent<T>();
  return [$store, set];
});

export const $$toggle = createFactory((a: boolean): [StoreWritable<boolean>, EventCallable<void>] => {
  const $store = createStore(a);
  const toggle = createEvent();
  $store.on(toggle, (state) => !state);
  return [$store, toggle];
});
