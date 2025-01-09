import type React from "react";

import { fork } from "effector";
import { Provider, useUnit } from "effector-react";
import { usePageContext } from "vike-react/usePageContext";
import { clientNavigate } from "~/shared/routing";
import { colors } from "~/shared/ui/colors";
import { H } from "~/shared/ui/components/H";

import "./index.css";

export default function WrapperEffector({ children }: { children: React.ReactNode }) {
  const { scopeValues } = usePageContext();
  const goTo = useUnit(clientNavigate);
  return (
    <Provider value={fork({ values: scopeValues })}>
      <div className="fixed w-dvw h-dvh overflow-hidden bg-white dark:bg-gray">
        <div className="relative h-full w-full flex justify-center items-center flex-col">
          <div className="h-[44px] sm:h-[56px] flex justify-center items-center">
            <div
              className="mt-[-36px] sm:mt-[-48px] w-[200px] h-[200px] flex justify-center items-center"
              style={{
                background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
              }}
            >
              <h1
                className="text-xxl font-bold mt-[36px] sm:mt-[48px] cursor-pointer text-black dark:text-white"
                onClick={() => goTo("/")}
              >
                chess3000
              </h1>
            </div>
          </div>

          <div className="h-full w-full overflow-y-scroll overflow-x-hidden">{children}</div>
          <div className="h-[44px] sm:h-[56px] w-full flex items-center justify-between px-5 gap-2">
            {/* <P className="text-gray">© S. Merlin</P> */}
            <H variant="h4" className="text-gray">
              © S. Merlin 2024
            </H>
            <div className="flex items-center gap-2">
              <a href="https://github.com/sbeben">
                <img src="/github-mark.png" alt="github" className="h-[20px] cursor-pointer" />
              </a>
              <a href="https://www.linkedin.com/in/senia-merlin/">
                <img src="/In-White-128.png" alt="linkedin" className="h-[20px] cursor-pointer invert" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Provider>
  );
}
