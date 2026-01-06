"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import TessellatedCanvas from "./TessellatedCanvas";
import { Tunnel } from "./Tunnel";
import { EntrepreneursContent } from "./EntrepreneursContent";
import { InvestorsContent } from "./InvestorsContent";
import { VeitaClosing } from "./VeitaClosing";

export const WorkForEquity = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tessRef = React.useRef<HTMLDivElement>(null);
  const textSectionRef = React.useRef<HTMLDivElement>(null);
  const tunnelRef = React.useRef<HTMLDivElement>(null);
  const zoomTargetRef = React.useRef<HTMLSpanElement>(null);
  const section1Ref = React.useRef<HTMLDivElement>(null);
  const section2Ref = React.useRef<HTMLDivElement>(null);
  const path1Ref = React.useRef<HTMLDivElement>(null);
  const path2Ref = React.useRef<HTMLDivElement>(null);
  const path3Ref = React.useRef<HTMLDivElement>(null);
  const path3BackdropRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      !containerRef.current ||
      !textSectionRef.current ||
      !tunnelRef.current ||
      !zoomTargetRef.current ||
      !section1Ref.current ||
      !section2Ref.current ||
      !path1Ref.current ||
      !path2Ref.current ||
      !path3Ref.current ||
      !path3BackdropRef.current
    )
      return;

    const container = containerRef.current;
    gsap.registerPlugin(ScrollTrigger);

    // Set initial state - elements start below the viewport
    gsap.set([section1Ref.current, tunnelRef.current], {
      y: "100vh",
      opacity: 0,
      visibility: "visible",
      force3D: true,
    });

    const timeline = gsap.timeline({ defaults: { force3D: true } });

    // Slide in from bottom after tessellation animation completes
    // Tessellation completes around 0.35 (0.25 startProgressMultiplier + 0.1 animationDuration)
    // Start the slide-in animation at 0.4 to ensure tessellation is done
    timeline.to([section1Ref.current, tunnelRef.current], {
      y: 0,
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    });

    const zoomTargetRect = zoomTargetRef.current!.getBoundingClientRect();
    const transformOrigin1 = {
      x: zoomTargetRect?.left + zoomTargetRect?.width / 2 - 2,
      y:
        zoomTargetRect?.top +
        zoomTargetRect?.height / 2 -
        window.innerHeight +
        4, // since we shift it down by window.innerHeight, we need to subtract it from the top
    };

    gsap.set(section2Ref.current, {
      opacity: 0,
      transform: "scale(0)",
      transformOrigin: `${transformOrigin1.x}px ${transformOrigin1.y}px`,
    });

    // Set initial states for paths
    gsap.set(path1Ref.current, {
      opacity: 1,
      x: "0%",
      y: "0%",
      z: "0px",
      rotateY: "0deg",
    });

    gsap.set(path2Ref.current, {
      opacity: 0,
      x: "100%",
      y: "10%",
      z: "100px",
      rotateY: "-30deg",
    });

    gsap.set(path3Ref.current, {
      opacity: 0,
      x: "100%",
      y: "10%",
      z: "100px",
      rotateY: "-30deg",
      scale: 0.7388888888888889,
    });

    timeline.fromTo(
      textSectionRef.current,
      {
        scale: 1,
        x: 0,
        y: 0,
        opacity: 1,
        transformOrigin: `${transformOrigin1.x}px ${transformOrigin1.y}px`,
      },
      {
        scale: 110,
        ease: "power4.in",
        delay: 0.2,
      },
      "0.5"
    );

    timeline.fromTo(
      textSectionRef.current,
      {
        opacity: 1,
      },
      {
        opacity: 0,
      },
      "1"
    );

    timeline.fromTo(
      section2Ref.current,
      {
        opacity: 0,
        transform: "scale(0)",
      },
      {
        opacity: 1,
        transform: "scale(1)",
      },
      "-=0.4"
    );

    // Path 1 exits
    timeline
      .fromTo(
        path1Ref.current,
        {
          x: "0%",
          y: "0%",
          z: "0px",
          opacity: 1,
          rotateY: "0deg",
        },
        {
          x: "-100%",
          y: "-10%",
          z: "100px",
          rotateY: "30deg",
          opacity: 0,
          duration: 0.5,
        },
        "+=0.2"
      )
      .fromTo(
        path2Ref.current,
        {
          y: "10%",
          x: "100%",
          z: "100px",
          rotateY: "-30deg",
          opacity: 0,
        },
        {
          x: "0%",
          y: "0%",
          z: "0px",
          rotateY: "0deg",
          opacity: 1,
          duration: 0.5,
          immediateRender: false,
        },
        "-=0.5" // Start right after path 1 exit completes
      )
      .to(
        path2Ref.current,
        {
          x: "-100%",
          y: "-10%",
          z: "100px",
          rotateY: "30deg",
          opacity: 0,
          duration: 0.5,
        },
        ">"
      )
      .fromTo(
        path3Ref.current,
        {
          y: "10%",
          x: "100%",
          z: "100px",
          rotateY: "-30deg",
          scale: 0.7388888888888889,
          opacity: 0,
        },
        {
          x: "0%",
          y: "0%",
          z: "0px",
          opacity: 1,
          scale: 0.7388888888888889,
          rotateY: "0deg",
          duration: 0.5,
        },
        "-=0.5" // Start right after path 2 exit completes
      )
      .fromTo(
        path3Ref.current,
        {
          scale: 0.7388888888888889,
        },
        {
          scale: 1,
        },
        ">"
      )
      .fromTo(
        path3BackdropRef.current,
        {
          scale: 0,
          borderRadius: "100vh",
        },
        {
          scale: 1,
          borderRadius: "0vh",
          duration: 0.5,
        },
        "-=0.5"
      );

    const scrollTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      animation: timeline,
      scrub: true,
    });

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "825vh",
        marginTop: "-125vh",
        position: "relative",
        overflow: "hidden",
        clipPath: "inset(0 0 0 0)",
      }}
    >
      <div
        className="absolute w-full top-0 left-0"
        style={{ height: "100vh" }}
        ref={tessRef}
      />
      <div
        className="absolute w-full h-full"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100vh",
        }}
      >
        <div className="absolute w-full h-full">
          <TessellatedCanvas
            containerRef={tessRef}
            config={{
              scrollStart: "top top",
              scrollEnd: "bottom top+=100vh",
              startProgressMultiplier: 0.25,
              startProgressOffset: 0.0,
              animationDuration: 0.1,
              initialScale: 0,
              gradientOrigin: { x: 0.5, y: -0.2 },
              gradientScale: 1.25,
              triangleSize: 40,
              // Use colors that work with the dark backdrop-gradient-wfe
              // You can adjust these colors as needed
              colorStart: { r: 0.18, g: 0.18, b: 0.18 },
              colorEnd: { r: 0.05, g: 0.05, b: 0.05 },
            }}
          />
        </div>

        <div className="absolute w-full h-full" ref={section1Ref}>
          <div ref={textSectionRef} className="absolute w-full h-full">
            <div
              ref={tunnelRef}
              className="absolute w-full h-full"
              style={{
                transform: "rotate(180deg)",
              }}
            >
              <Tunnel color="#323232" />
            </div>
            <div
              className="relative w-full h-full"
              style={{
                maxWidth: "min(1280px, 100vw - 64px)",
                margin: "0 auto",
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <h2 className="text-6xl md:text-7xl text-white">
                W<span ref={zoomTargetRef}>o</span>
                rk for Equity
              </h2>
              <p className="text-md md:text-4xl text-white mt-16 md:pl-64">
                Work for Equity is a simple exchange: real work for real
                ownership. <br /> <br />
                Instead of chasing permission or salary alone, builders put
                effort into ideas they believe in and earn a stake in what they
                create. <br /> <br />
                No demo days. No manufactured urgency. <br /> Just focused work,
                aligned incentives, and shared upside.
              </p>
            </div>
          </div>
        </div>
        <div
          className="absolute w-full h-full"
          ref={section2Ref}
          style={{
            opacity: 0,
            transform: "scale(0)",
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <div ref={path1Ref} className="absolute w-full h-full top-0 left-0">
            <EntrepreneursContent />
          </div>
          <div
            ref={path2Ref}
            className="absolute w-full h-full top-0 left-0 opacity-0"
          >
            <InvestorsContent />
          </div>
          <div
            ref={path3Ref}
            className="absolute w-full h-full top-0 left-0 opacity-0"
          >
            <div
              ref={path3BackdropRef}
              className="absolute w-full h-full top-0 left-0 scale-0"
              style={{ backgroundColor: "#fff" }}
            />
            <VeitaClosing />
          </div>
        </div>
      </div>
    </div>
  );
};
