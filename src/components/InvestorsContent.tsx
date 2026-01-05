"use client";

import React from "react";

export const InvestorsContent: React.FC = () => {
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
        background: "white",
      }}
    >
      <div
        className="flex flex-col md:flex-row gap-4 md:gap-16"
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          zIndex: 1,
        }}
      >
        {/* Left column - Path indicator and heading */}
        <div
          style={{
            minWidth: "256px",
            display: "flex",
            flexDirection: "row",
            gap: "24px",
            alignItems: "flex-start",
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
              Path 2
            </p>
            <h2 className="text-2xl  font-bold ">For Investors</h2>
            <p
              style={{
                color: "#b3b3b3",
                fontSize: "14px",
                fontWeight: 400,
              }}
            >
              Partners backing builders.
            </p>
          </div>
        </div>

        {/* Right column - Main content */}
        <div
          style={{
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "flex-end",
            gap: "24px",
            height: "100%",
          }}
        >
          <div className="text-sm md:text-xl md:mt-32 mt-0">
            Veita is not chasing capital. <br />
            <br />
            But we’re always open to conversations with investors who believe
            value is created by people first — and who want exposure to
            companies before they look like companies.
            <br />
            <br /> You can inquire about: <br />
            <ul className="list-disc list-inside">
              <li>backing a specific Kio</li>
              <li>partnering with Veita</li>
              <li>supporting the broader Work for Equity model</li>
            </ul>
            <br />
            <br /> We prefer conversations to decks.
          </div>

          {/* Contact button at bottom right */}
          <div
            style={{
              alignSelf: "flex-end",
            }}
          >
            <button
              style={{
                backgroundColor: "#000000",
                color: "#fff",
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
