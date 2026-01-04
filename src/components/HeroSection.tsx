"use client";

import React from "react";
import { Tunnel } from "./Tunnel";
import { LogoNoText } from "./LogoNoText";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

export const HeroSection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const caretRef = React.useRef<HTMLDivElement>(null);
  const zoomTargetRef = React.useRef<HTMLSpanElement>(null);
  const section1Ref = React.useRef<HTMLDivElement>(null);
  const section2Ref = React.useRef<HTMLDivElement>(null);
  const contentContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      !containerRef.current ||
      !contentRef.current ||
      !caretRef.current ||
      !section1Ref.current ||
      !section2Ref.current ||
      !zoomTargetRef.current ||
      !contentContainerRef.current
    )
      return;
    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline({ defaults: { force3D: true } });

    // Animate caret position (using transform for GPU acceleration)
    timeline.fromTo(
      caretRef.current,
      {
        y: 0,
        force3D: true,
      },
      {
        y: 88,
        duration: 0.5,
        ease: "power3.in",
      },
      0
    );

    const zoomTargetRect = zoomTargetRef.current!.getBoundingClientRect();
    const section1Rect = section1Ref.current!.getBoundingClientRect();

    // Calculate the center of zoomTargetRef relative to section1Ref
    // Transform origin needs to be relative to the element being transformed (section1Ref)
    const transformOrigin = {
      x: zoomTargetRect.left - section1Rect.left + zoomTargetRect.width / 2,
      y: zoomTargetRect.top - section1Rect.top + zoomTargetRect.height / 2 + 8,
    };

    timeline.fromTo(
      section1Ref.current,
      {
        opacity: 1,
        scale: 1,
        transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
      },
      {
        opacity: 0,
        scale: 100,
        duration: 0.5,
        ease: "power3.in",
      },
      "0"
    );

    timeline.fromTo(
      section2Ref.current,
      {
        opacity: 0,
        transformOrigin: `${transformOrigin.x}px ${transformOrigin.y}px`,
        scale: 0,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power3.in",
      },
      "0"
    );

    timeline.fromTo(
      section2Ref.current,
      {
        opacity: 1,
      },
      {
        opacity: 1,
        ease: "power3.in",
      },
      "1"
    );

    // Create ScrollTrigger for caret animation with optimized scrubbing
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      animation: timeline,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5, // Smoother scrubbing with less frequent updates
      toggleActions: "play none none reverse",
    });

    return () => {
      scrollTrigger.kill();
    };
  }, [containerRef, contentRef]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        minHeight: "300vh",
        overflow: "hidden",
      }}
    >
      <div
        ref={contentRef}
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "100vh",
        }}
      >
        <div
          ref={contentContainerRef}
          className="h-screen w-full flex flex-col md:items-center md:justify-center relative mx-auto "
          style={{
            maxWidth: "min(1440px, 100vw - 64px)",
            marginTop: "32px",
            maxHeight: "calc(100vh - 64px)",
            borderRadius: "64px",
            overflow: "hidden",
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="backdrop-gradient" />
            <div
              style={{
                transformOrigin: "center bottom",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <Tunnel />
            </div>
          </div>
          <div className="flex items-center w-full h-8 absolute top-24 left-0 px-24 justify-between">
            <LogoNoText />
            <div className="flex items-center gap-16 p-2 pl-16 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-white text-md font-medium">MAIN</span>
              <span className="text-white text-md font-medium">KIO</span>
              <span className="text-white text-md font-medium">WFE</span>
              <span className="text-white text-md font-medium">PARTNERS</span>
              <button className="bg-white text-black px-10 py-2 rounded-full text-md font-medium">
                Contact
              </button>
            </div>
          </div>
          <div className="w-full flex flex-row items-center relative">
            <div className="flex flex-col gap-6 mx-8 md:mx-24 relative">
              <div
                ref={caretRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "8px",
                  backgroundColor: "#D9D9D9FF",
                  height: "64px",
                  borderRadius: "4px",
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              />
              <div
                style={{
                  width: "8px",
                  backgroundColor: "#D9D9D933",
                  height: "64px",
                  borderRadius: "4px",
                }}
              />
              <div
                style={{
                  width: "8px",
                  backgroundColor: "#D9D9D933",
                  height: "64px",
                  borderRadius: "4px",
                }}
              />
            </div>

            <div className="flex items-start gap-4 md:gap-6 relative w-full h-full">
              {/* Vertical caret/cursor */}

              <div
                ref={section1Ref}
                className="flex flex-col gap-6 md:gap-8 absolute top-0 left-0 w-full h-full justify-center pr-16"
              >
                {/* Headline */}
                <h1
                  className="font-normal leading-tight text-white text-8xl"
                  style={{
                    willChange: "opacity",
                    transform: "translateZ(0)",
                    position: "relative",
                    display: "inline-block",
                    WebkitFontSmoothing: "subpixel-antialiased",
                    backfaceVisibility: "hidden",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  Value belongs with <br />
                  the pe
                  <span ref={zoomTargetRef} style={{ display: "inline-block" }}>
                    o
                  </span>
                  ple who
                  <br />
                  create it.
                </h1>

                {/* Body text 1 */}
                <p
                  className="text-white text-lg md:text-xl lg:text-xl leading-relaxed"
                  style={{
                    maxWidth: "800px",
                    willChange: "opacity",
                    transform: "translateZ(0)",
                  }}
                >
                  Veita builds AI-native companies for builders who want
                  ownership, not permission.
                  <br />
                  We provide the platform, structure, and leverage.
                  <br />
                  <br />
                  You build. You own.
                  <br />
                  This is Work for Equity.
                </p>
              </div>
              <div
                ref={section2Ref}
                className="flex flex-row gap-6 md:gap-8 absolute top-0 left-0 w-full pr-16 h-full items-center opacity-0 scale-0"
              >
                {/* Headline */}
                <h1
                  className="font-normal leading-tight text-white text-8xl w-1/2 mb-64"
                  style={{
                    willChange: "opacity",
                    transform: "translateZ(0)",
                  }}
                >
                  What is
                  <br /> Veita?
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
                  Veita is a company studio for engineers, designers, operators,
                  and founders who turn ideas into real companies by
                  contributing skill, time, and judgment in exchange for
                  ownership.
                  <br />
                  <br /> We build using AI-native systems, validate quickly, and
                  introduce capital only when it accelerates value.
                  <br />
                  <br /> We provide the platform, patterns, tooling, and
                  guidance. Teams do the work.
                  <br />
                  <br /> We takes a base 25% stake. You keep 75%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
