"use client";

import React from "react";
import { Tunnel } from "./Tunnel";
import { LogoNoText } from "./LogoNoText";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import { TextSlideIn } from "./TextSlideIn";

export const HeroSection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const caretRef = React.useRef<HTMLDivElement>(null);
  const headline1Ref = React.useRef<HTMLHeadingElement>(null);
  const headline2Ref = React.useRef<HTMLHeadingElement>(null);
  const body1Ref = React.useRef<HTMLParagraphElement>(null);
  const body2Ref = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (
      !containerRef.current ||
      !contentRef.current ||
      !caretRef.current ||
      !headline1Ref.current ||
      !headline2Ref.current ||
      !body1Ref.current ||
      !body2Ref.current
    )
      return;
    gsap.registerPlugin(ScrollTrigger);

    // Set initial states with GPU acceleration hints
    // Only set visibility, let timeline handle opacity
    gsap.set([headline1Ref.current, body1Ref.current], {
      opacity: 1,
      visibility: "visible",
      force3D: true,
    });
    gsap.set([headline2Ref.current, body2Ref.current], {
      opacity: 0,
      visibility: "hidden",
      force3D: true,
    });

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
        force3D: true,
      },
      0
    );

    // Fade out first set (headline1 and body1) - animate opacity smoothly, then hide visibility
    timeline.to(
      [headline1Ref.current, body1Ref.current],
      {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        force3D: true,
      },
      0
    );

    // Hide visibility after opacity animation completes (at the end)
    timeline.set(
      [headline1Ref.current, body1Ref.current],
      {
        visibility: "hidden",
      },
      0.5
    );

    // Show visibility first, then fade in second set (headline2 and body2)
    timeline.set(
      [headline2Ref.current, body2Ref.current],
      {
        visibility: "visible",
      },
      0
    );
    timeline.to(
      [headline2Ref.current, body2Ref.current],
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.inOut",
        force3D: true,
      },
      0
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
        minHeight: "200vh",
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

              <div className="flex flex-col gap-6 md:gap-8 absolute top-0 left-0 w-full h-full justify-center pr-16">
                {/* Headline */}
                <h1
                  ref={headline1Ref}
                  className="font-normal leading-tight text-white text-8xl"
                  style={{
                    willChange: "opacity",
                    transform: "translateZ(0)",
                  }}
                >
                  <TextSlideIn text="Value belongs with" delay={0} />
                  <TextSlideIn text="the people who" delay={0.4} />
                  <TextSlideIn text="create it." delay={0.8} />
                </h1>

                {/* Body text 1 */}
                <p
                  ref={body1Ref}
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
              <div className="flex flex-row gap-6 md:gap-8 absolute top-0 left-0 w-full pr-16 h-full items-center">
                {/* Headline */}
                <h1
                  ref={headline2Ref}
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
                  ref={body2Ref}
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
