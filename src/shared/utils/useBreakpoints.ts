import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import resolveConfig from "tailwindcss/resolveConfig";

import tailwindConfig from "../../../tailwind.config";

// https://github.com/pmndrs/zustand/blob/833f57ed131e94f3ed48627d4cfbf09cb9c7df03/src/react.ts#L20-L23
const isSSR =
  typeof window === "undefined" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);

const isBrowser = !isSSR;

const useIsomorphicEffect = isBrowser ? useLayoutEffect : useEffect;

export function create<TScreens extends Record<string, string>>(screens: TScreens) {
  function useBreakpoint(breakpoint: keyof TScreens, defaultValue: boolean = false) {
    const [match, setMatch] = useState(() => defaultValue);

    useIsomorphicEffect(() => {
      if (!(isBrowser && "matchMedia" in window && window.matchMedia)) return undefined;

      const value = screens[breakpoint] ?? "999999px";
      const query = window.matchMedia(`(min-width: ${value})`);

      function listener(event: MediaQueryListEvent) {
        setMatch(event.matches);
      }

      setMatch(query.matches);

      query.addEventListener("change", listener);
      return () => query.removeEventListener("change", listener);
    }, [breakpoint, defaultValue]);

    return match;
  }

  function useBreakpointEffect(breakpoint: keyof TScreens, effect: (match: boolean) => void) {
    const match = useBreakpoint(breakpoint);
    useIsomorphicEffect(() => effect(match), [breakpoint, effect]);
    return null;
  }

  function useBreakpointValue<T, U>(breakpoint: keyof TScreens, valid: T, invalid: U) {
    const match = useBreakpoint(breakpoint);
    const value = useMemo(() => (match ? valid : invalid), [invalid, match, valid]);
    return value;
  }

  return {
    useBreakpoint,
    useBreakpointEffect,
    useBreakpointValue,
  };
}

const config = resolveConfig(tailwindConfig);

export const { useBreakpoint } = create(config.theme.screens);
