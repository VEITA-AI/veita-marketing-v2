"use client";

import React from "react";
import { LogoNoText } from "./LogoNoText";

//  maxWidth: "min(1064px, 100vw - 64px)",
//     margin: "auto",
//     padding: "48px",
//     display: "flex",
//     flexDirection: "row",
//     marginTop: "max((calc(100vh - 640px) / 2), 64px)",
//     height: "min(640px, calc(100vh - 128px))",

// scale is 1064 / 1440 = 0.7388888888888889

export const VeitaClosing: React.FC = () => {
  return (
    <div
      className="h-screen w-full flex flex-col md:items-center md:justify-center relative mx-auto "
      style={{
        maxWidth: "min(1440px, 100vw - 64px)",
        marginTop: "32px",
        maxHeight: "calc(100vh - 64px)",
        borderRadius: "64px",
        padding: "64px",
        overflow: "hidden",
        background: "blue",
      }}
    >
      <div className="w-full flex flex-row items-center relative">
        <div className="flex items-start gap-4 md:gap-6 relative w-full h-full">
          {/* Vertical caret/cursor */}

          <div className="flex flex-row gap-6 md:gap-8 absolute top-0 left-0 w-full pr-16 h-full items-center">
            {/* Headline */}
            <h1
              className="font-normal leading-tight text-white text-8xl w-1/2 mb-64"
              style={{
                willChange: "opacity",
                transform: "translateZ(0)",
              }}
            >
              Veita is
              <br /> building a
              <br /> different
              <br /> kind of
              <br /> incubator.
            </h1>

            {/* Body text 2 */}
            <p
              className="text-white text-lg md:text-xl lg:text-xl leading-relaxed w-1/2 mt-64"
              style={{
                maxWidth: "800px",
                willChange: "opacity",
                transform: "translateZ(0)",
              }}
            >
              One where talent outranks money, ownership follows effort, and the
              best ideas don’t die waiting for funding. Born small. Built by
              owners. Aiming to be GOATs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
