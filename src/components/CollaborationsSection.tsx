/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import TessellatedCanvas from "./TessellatedCanvas";

interface ScrollImageProps {
  src: string;
}
const ScrollImage: React.FC<ScrollImageProps> = ({ src }) => {
  return (
    <div
      style={{
        height: "64px",
      }}
    >
      <img
        src={src}
        height="64px"
        style={{
          objectFit: "contain",
          minHeight: "64px",
          maxHeight: "64px",
        }}
        alt=""
        role="presentation"
      />
    </div>
  );
};

export const CollaborationsSection = () => {
  const contentRef = React.useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;

  const containerRef = React.useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;

  const backdropRef = React.useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;

  const textRef = React.useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLDivElement>;

  React.useEffect(() => {
    BuildAnimation(containerRef, contentRef, backdropRef, textRef);
  }, []);

  return (
    <div
      style={{
        marginTop: "-120vh",
        width: "100%",
        height: "200vh",
        overflow: "clip",
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "200vh",
          position: "absolute",
        }}
      >
        <div
          ref={contentRef}
          className="flex flex-col justify-center items-center"
          style={{
            width: "100%",
            height: "100vh",
            top: "0",
            transform: "translateZ(0)",
            position: "sticky",
          }}
        >
          <TessellatedCanvas containerRef={containerRef} />
          <div
            ref={backdropRef}
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "50%",
              background: "linear-gradient(0deg, #0D1E60 0%, transparent 100%)",
              zIndex: 1,
            }}
          />
          <div
            ref={textRef}
            style={{
              width: "100%",
              zIndex: 10,
            }}
          >
            <h1 className="text-2xl md:text-4xl text-white font-light text-center container">
              We Collaborate with the Best
            </h1>
            <p className="text-white text-4xl md:text-7xl uppercase mt-8 font-semibold text-center container">
              partnering with some of the fastest-growing products and startups
            </p>
            <div className="relative w-full overflow-clip z-10 m-0 p-0 mt-16">
              <div
                style={{
                  overflow: "hidden",
                  height: "100%",
                  whiteSpace: "nowrap",
                  margin: "0",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "64px",
                  width: "calc(3905.59px * 1)",
                  animation: "scrollLogos 30s infinite linear",
                }}
              >
                <ScrollImage src="./hashmatrix-logo.svg" />
                <ScrollImage src="./homezai.svg" />
                <ScrollImage src="./pageon.svg" />
                <ScrollImage src="./sharpstakes.png" />
                <ScrollImage src="./adsagency.svg" />
                <ScrollImage src="./hashmatrix-logo.svg" />
                <ScrollImage src="./homezai.svg" />
                <ScrollImage src="./pageon.svg" />
                <ScrollImage src="./sharpstakes.png" />
                <ScrollImage src="./adsagency.svg" />
                <ScrollImage src="./hashmatrix-logo.svg" />
                <ScrollImage src="./homezai.svg" />
                <ScrollImage src="./pageon.svg" />
                <ScrollImage src="./sharpstakes.png" />
                <ScrollImage src="./adsagency.svg" />
                <ScrollImage src="./hashmatrix-logo.svg" />
                <ScrollImage src="./homezai.svg" />
                <ScrollImage src="./pageon.svg" />
                <ScrollImage src="./sharpstakes.png" />
                <ScrollImage src="./adsagency.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuildAnimation = (
  containerRef: React.MutableRefObject<HTMLDivElement>,
  contentRef: React.MutableRefObject<HTMLDivElement>,
  backdropRef: React.MutableRefObject<HTMLDivElement>,
  textRef: React.MutableRefObject<HTMLDivElement>
) => {
  if (!containerRef.current || !backdropRef.current || !textRef.current) return;

  gsap.registerPlugin(ScrollTrigger);

  const timeline = gsap.timeline();

  timeline.fromTo(
    backdropRef.current,
    {
      height: "50%",
    },
    {
      height: "100%",
      duration: 1,
    },
    "0"
  );
  timeline.fromTo(
    textRef.current,
    {
      y: "100vh",
      opacity: 0,
    },
    {
      y: 0,
      opacity: 1,
      duration: 1,
    },
    "2"
  );

  ScrollTrigger.create({
    trigger: containerRef.current,
    start: "top top",
    end: "bottom bottom",
    animation: timeline,
    scrub: true,
    toggleActions: "play none none reverse",
  });
};
