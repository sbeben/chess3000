import { createFactory, invoke } from "@withease/factories";
import {
  type EventCallable,
  type StoreWritable,
  createEffect,
  createEvent,
  createStore,
  fork,
  sample,
  scopeBind,
} from "effector";
import { debug, spread } from "patronum";

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

export const resizeListener = createFactory(() => {
  const init = createEvent();
  const cleanup = createEvent();

  const $width = createStore(0);
  const $height = createStore(0);

  const setSize = createEvent<{ width: number; height: number }>();

  const handleResize = () => {
    const boundSetter = scopeBind(setSize, { safe: true });
    boundSetter({ width: window?.innerWidth || 0, height: window?.innerHeight || 0 });
  };

  const subscribeFx = createEffect(() => {
    if (!!window) {
      window.addEventListener("resize", handleResize);
    }
  });
  const unsubscribeFx = createEffect(() => {
    if (!!window) {
      window.removeEventListener("resize", handleResize);
    }
  });

  sample({
    clock: init,
    target: subscribeFx,
  });

  sample({
    clock: cleanup,
    target: unsubscribeFx,
  });

  sample({
    clock: setSize,
    target: spread({
      width: $width,
      height: $height,
    }),
  });

  return { $width, $height, init, cleanup };
});
