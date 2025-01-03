import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function useDarkMode() {
  // Initialize based on HTML class first
  const [mode, setMode] = useState<Theme>(() => {
    if (typeof document === "undefined") return "light";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  //   useEffect(() => {
  //     // Check localStorage after mount
  //     const savedMode = localStorage.getItem("theme") as Theme | null;
  //     if (savedMode === "dark" || savedMode === "light") {
  //       setMode(savedMode);
  //     }
  //   }, []);

  //   useEffect(() => {
  //     const root = window.document.documentElement;
  //     root.classList.remove(mode === "dark" ? "light" : "dark");
  //     root.classList.add(mode);
  //     localStorage.setItem("theme", mode);
  //   }, [mode]);

  //   useEffect(() => {
  //     const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  //     const handleChange = (e: MediaQueryListEvent) => {
  //       setMode(e.matches ? "dark" : "light");
  //     };

  //     mediaQuery.addEventListener("change", handleChange);
  //     return () => mediaQuery.removeEventListener("change", handleChange);
  //   }, []);

  const toggle = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return {
    mode,
    isDark: mode === "dark",
    isLight: mode === "light",
    toggle,
  };
}
