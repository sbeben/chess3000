import { createFactory, invoke } from "@withease/factories";
import {
  type Event,
  type EventCallable,
  type Store,
  type StoreWritable,
  attach,
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

// export const resizeListener = createFactory(() => {
//   const init = createEvent();
//   const cleanup = createEvent();

//   const $width = createStore(0);
//   const $height = createStore(0);

//   const setSize = createEvent<{ width: number; height: number }>();
//   const boundSetter = scopeBind(setSize, { safe: true });
//   const handleResize = () => {
//     console.log("resize", window?.innerWidth, window?.innerHeight);
//     boundSetter({ width: window?.innerWidth || 0, height: window?.innerHeight || 0 });
//   };

//   const subscribeFx = createEffect(() => {
//     if (!!window) {
//       window.addEventListener("resize", handleResize);
//     }
//   });
//   const unsubscribeFx = createEffect(() => {
//     if (!!window) {
//       window.removeEventListener("resize", handleResize);
//     }
//   });

//   sample({
//     clock: init,
//     target: subscribeFx,
//   });

//   sample({
//     clock: cleanup,
//     target: unsubscribeFx,
//   });

//   sample({
//     clock: setSize,
//     target: spread({
//       width: $width,
//       height: $height,
//     }),
//   });

//   return { $width, $height, init, cleanup };
// });

// Define what a setupable unit needs
export type Setupable = {
  setup: Event<void>;
  teardown?: Event<void>;
};

// The main setupListener function that handles all subscription logic
export function setupListener<T>(
  {
    add,
    remove,
    readPayload,
  }: {
    add: (listener: (value: T) => void) => void;
    remove: (listener: (value: T) => void) => void;
    readPayload?: () => T;
  },
  config: Setupable,
): Event<T> {
  // Create the event that will be triggered
  const event = createEvent<T>();

  // Store the subscription reference
  const $subscription = createStore<((value: T) => void) | null>(null, {
    serialize: "ignore",
  });

  // Effect to start watching
  const startWatchingFx = createEffect(() => {
    // Bind the event to the current scope
    const boundEvent = scopeBind(event, { safe: true });
    let listener = boundEvent;

    // If readPayload is provided, wrap the listener
    if (readPayload) {
      listener = () => boundEvent(readPayload());
    }

    // Add the listener
    add(listener);

    // Return the listener for cleanup
    return listener;
  });

  // Effect to stop watching
  const stopWatchingFx = attach({
    source: $subscription,
    effect(subscription) {
      if (!subscription) return;
      remove(subscription);
    },
  });

  // Start watching when setup is called
  sample({ clock: config.setup, target: startWatchingFx });

  // Store the subscription when watching starts
  sample({
    clock: startWatchingFx.doneData,
    filter: Boolean,
    target: $subscription,
  });

  // Clean up when teardown is called
  if (config.teardown) {
    sample({ clock: config.teardown, target: stopWatchingFx });
  }

  // Reset subscription store after cleanup
  sample({ clock: stopWatchingFx.done, target: $subscription.reinit! });

  return event;
}

type ResizeListener = () => {
  init: EventCallable<void>;
  cleanup: EventCallable<void>;
  $width: Store<number>;
  $height: Store<number>;
};

// Main factory function that also implements TriggerProtocol
const resizeListener: ResizeListener = createFactory(() => {
  // Create stores with initial values
  const $width = createStore<number>(
    // Use window.innerWidth if available, otherwise 0
    typeof window !== "undefined" ? window.innerWidth : 0,
    { serialize: "ignore" },
  );
  const $height = createStore<number>(typeof window !== "undefined" ? window.innerHeight : 0, { serialize: "ignore" });

  const init = createEvent();
  const cleanup = createEvent();

  // Create an event that will fire when resize occurs
  // setupListener handles all the scope binding and cleanup automatically
  const resizeChanged = setupListener(
    {
      // How to add the listener

      add: (listener) =>
        //@ts-expect-error
        window.addEventListener("resize", listener),
      // How to remove the listener
      remove: (listener) =>
        //@ts-expect-error
        window.removeEventListener("resize", listener),
      // What data to pass to the event when it fires
      readPayload: () => ({
        width: window.innerWidth,
        height: window.innerHeight,
      }),
    },
    // Pass the setup/teardown events from the config
    { setup: init, teardown: cleanup },
  );

  // Update stores when resize occurs
  sample({
    clock: resizeChanged,
    target: spread({
      width: $width,
      height: $height,
    }),
  });

  return {
    init,
    cleanup,
    $width,
    $height,
  };
});

export const $$resizeListener = invoke(resizeListener);

export const logFx = createEffect(console.log);
