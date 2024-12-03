import type React from "react";

import { fork } from "effector";
import { Provider } from "effector-react";
import { usePageContext } from "vike-react/usePageContext";
import { colors } from "~/shared/ui/colors";
import { Heading } from "~/shared/ui/components/Heading";

import "./globals.css";

export default function WrapperEffector({ children }: { children: React.ReactNode }) {
  const { scopeValues } = usePageContext();

  return (
    <Provider value={fork({ values: scopeValues })}>
      <div
        style={{
          position: "fixed",
          width: "100dvw",
          height: "100dvh",
          background: colors.white.DEFAULT,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ maxHeight: "56px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div
              style={{
                marginTop: "-48px",
                width: "200px",
                height: "200px",
                background: `radial-gradient(circle, ${colors.green_yellow.DEFAULT} 0%, transparent 70%)`,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Heading
                style={{
                  marginTop: "48px",
                }}
              >
                chess3000
              </Heading>
            </div>
          </div>
          {/* <div
          style={{
            position: "absolute",
            top: "-112px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
         
        </div> */}
          <div style={{ height: "100%", width: "100%" }}>{children}</div>
        </div>
      </div>
    </Provider>
  );
}
