"use client";

import React from "react";
import { TheGoat } from "./TheGoat";

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
        display: "flex",
        background: "blue",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: -45,
          transform: "scale(0.9)",
        }}
      >
        <TheGoat />
      </div>
      <div
        className="w-full flex flex-row items-center relative"
        style={{ height: "100%" }}
      >
        <div className="flex items-start gap-4 md:gap-6 relative w-full h-full">
          {/* Vertical caret/cursor */}

          <div className="flex flex-row gap-6 md:gap-12 absolute top-0 left-0 w-full h-full">
            {/* Headline */}
            <h1
              className="font-semibold leading-tight text-white text-8xl mb-64"
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
            <div
              style={{
                height: "100%",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <p
                className="text-white text-lg md:text-xl lg:text-3xl"
                style={{
                  maxWidth: "800px",
                  willChange: "opacity",
                  transform: "translateZ(0)",
                }}
              >
                <span style={{ display: "inline-block", width: "100px" }} />
                One where talent outranks money, ownership follows effort, and
                the best ideas don’t die waiting for funding.
                <br />
                <br />
                <span style={{ display: "inline-block", width: "100px" }} />
                Born small. Built by owners. <br />
                Aiming to be GOATs.
              </p>
            </div>
            <div>
              <button
                className="button bg-white text-primary px-4 lg:px-16 py-2 rounded-full xs:text-sm md:text-md uppercase font-semibold"
                style={{
                  color: "#0C1C5A",
                }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
