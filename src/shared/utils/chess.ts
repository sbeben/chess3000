// import { useEffect, useState } from "react";

// import { useUnit } from "effector-react";

// import { $$mainResizeListener } from "./effector";

// export const useBoardWidth = (windowWidth: number) => {
//   //   const windowWidth = useUnit($$mainResizeListener.$width);
//   //   const [result, setResult] = useState(0);
//   const padding = 0; // 16px padding on each side
//   const maxWidth = 600;

//   //   useEffect(() => {
//   const result = Math.min(windowWidth - padding, maxWidth);
//   console.log(result);
//   //     setResult(result);
//   //   }, [windowWidth]);

//   return result;
// };

export const getDraggingElement = () => {
  // Just the outer container
  const test1 = document.querySelector('div[style*="position: fixed"]');

  // More specific outer container
  const test2 = document.querySelector('div[style*="position: fixed"][style*="z-index: 10"]');

  // Inner div with transform
  const test3 = document.querySelector('div[style*="transform"]');

  // Try with wildcard
  const test4 = document.querySelector('*[style*="position: fixed"]');

  // Try getting all SVGs
  const test5 = document.querySelectorAll("svg");

  // Try with the exact transform style
  const test6 = document.querySelector('div[style*="touch-action: none"]');

  // Log each result to see which selector works
  console.log({
    test1,
    test2,
    test3,
    test4,
    test5,
    test6,
  });
  return document.querySelector(
    'div[style*="position: fixed"] > div[style*="transform"][style*="touch-action: none"]',
  ) as HTMLElement;
};
