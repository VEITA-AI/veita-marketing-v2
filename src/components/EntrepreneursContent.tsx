"use client";

import React from "react";

interface EntrepreneursContentProps {
  innerRef?: React.RefObject<HTMLDivElement>;
}

export const EntrepreneursContent: React.FC<EntrepreneursContentProps> = ({
  innerRef,
}) => {
  return (
    <div
      className="relative w-full h-full "
      style={{
        maxWidth: "min(1064px, 100vw - 64px)",
        margin: "auto",
        padding: "48px",
        display: "flex",
        flexDirection: "row",
        marginTop: "max((calc(100vh - 640px) / 2), 64px)",
        height: "min(640px, calc(100vh - 128px))",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid #ffffff33",
      }}
    >
      {/* <div
        className="absolute w-full h-full top-0 left-0 backdrop-gradient-wfe"
        style={{ filter: "blur(1px)" }}
      /> */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "64px",
          zIndex: 1,
        }}
      >
        {/* Left column - Path indicator and heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "24px",
            alignItems: "flex-start",
            minWidth: "256px",
          }}
        >
          <div>
            <p
              style={{
                color: "#b3b3b3",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              Path 1
            </p>
            <h2 className="text-2xl text-white font-bold ">
              For Entrepreneurs
            </h2>
            <p
              style={{
                color: "#b3b3b3",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              Builders creating companies.
            </p>
          </div>
        </div>

        {/* Right column - Main content */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            height: "100%",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <div className="text-white text-xl mt-32">
            If you have an idea you can't stop thinking about..
            <br />
            If you're willing to build before you fundraise..
            <br />
            If you'd rather own a meaningful piece of something than chase a
            title..
            <br />
            <br /> Veita wants to hear from you.
            <br />
            <br /> Bring us ideas that are early, ambitious, and a little
            uncomfortable.
            <br />
            <br /> We'll help you turn them into a Kio.
          </div>

          {/* Contact button at bottom right */}
          <div
            style={{
              alignSelf: "flex-end",
            }}
          >
            <button
              style={{
                backgroundColor: "#fff",
                color: "#4a4a4a",
                padding: "12px 32px",
                borderRadius: "32px",
                fontSize: "14px",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              CONTACT US
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
