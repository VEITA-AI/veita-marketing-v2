"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import TessellatedCanvas from "./TessellatedCanvas";

const TEXT_ZOOM = 100;

export const TextZoomSection: React.FC = () => {
  const section1Ref = React.useRef<HTMLDivElement>(null);
  const section2Ref = React.useRef<HTMLDivElement>(null);
  const section3Ref = React.useRef<HTMLDivElement>(null);
  const section4Ref = React.useRef<HTMLDivElement>(null);

  const zoomTarget1Ref = React.useRef<HTMLSpanElement>(null);
  const zoomTarget2Ref = React.useRef<HTMLSpanElement>(null);
  const zoomTarget3Ref = React.useRef<HTMLSpanElement>(null);
  const zoomTarget4Ref = React.useRef<HTMLSpanElement>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const elementContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setTimeout(() => {
      if (
        !containerRef.current ||
        !elementContainerRef.current ||
        !section1Ref.current ||
        !section2Ref.current ||
        !section3Ref.current ||
        !section4Ref.current ||
        !zoomTarget1Ref.current ||
        !zoomTarget2Ref.current ||
        !zoomTarget3Ref.current ||
        !zoomTarget4Ref.current
      )
        return;
      gsap.registerPlugin(ScrollTrigger);

      const timeline = gsap.timeline();

      timeline.fromTo(
        containerRef.current,
        {
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          duration: 0.1,
        },
        "0.1"
      );

      const zoomTarget1Rect = zoomTarget1Ref.current!.getBoundingClientRect();
      const zoomTarget2Rect = zoomTarget2Ref.current!.getBoundingClientRect();
      const zoomTarget3Rect = zoomTarget3Ref.current!.getBoundingClientRect();
      const zoomTarget4Rect = zoomTarget4Ref.current!.getBoundingClientRect();

      const transformOrigin1 = {
        x: zoomTarget1Rect?.left + zoomTarget1Rect?.width / 2,
        y: zoomTarget1Rect?.top + zoomTarget1Rect?.height / 2,
      };

      const transformOrigin2 = {
        x: zoomTarget2Rect?.left + zoomTarget2Rect?.width / 2,
        y: zoomTarget2Rect?.top + zoomTarget2Rect?.height / 2,
      };

      const transformOrigin3 = {
        x: zoomTarget3Rect?.left + zoomTarget3Rect?.width / 2,
        y: zoomTarget3Rect?.top + zoomTarget3Rect?.height / 2,
      };

      const transformOrigin4 = {
        x: zoomTarget4Rect?.left + zoomTarget4Rect?.width / 2,
        y: zoomTarget4Rect?.top + zoomTarget4Rect?.height / 2,
      };

      // timeline.fromTo(
      //   section1Ref.current,
      //   {
      //     y: "100vh",
      //     autoAlpha: 0,
      //   },
      //   {
      //     y: "0vh",
      //     autoAlpha: 1,
      //   },
      //   "0"
      // );

      timeline.fromTo(
        section1Ref.current,
        {
          backgroundPositionY: "0%",
          "--text-zoom-initial-opacity": "0",
        },
        {
          backgroundPositionY: "100%",
          "--text-zoom-initial-opacity": "1",
        },
        "+=0.25" // Delay text fade-in
      );

      timeline.fromTo(
        section1Ref.current,
        {
          scale: 1,
          x: 0,
          y: 0,
          opacity: 1,
          transformOrigin: `${transformOrigin1.x}px ${transformOrigin1.y}px`,
        },
        {
          scale: TEXT_ZOOM,
          ease: "power4.in",
          delay: 0.2,
        }
      );

      timeline.fromTo(
        section2Ref.current,
        {
          opacity: 1,
          scale: 0,
        },
        {
          scale: 1,
        },
        "-=0.2"
      );

      timeline.fromTo(
        section1Ref.current,
        {
          opacity: 1,
        },
        {
          opacity: 0,
        },
        "-=0.6"
      );

      timeline.fromTo(
        section2Ref.current,
        {
          scale: 1,
          transformOrigin: `${transformOrigin2.x}px ${transformOrigin2.y}px`,
        },
        {
          scale: TEXT_ZOOM,
          ease: "power4.in",
        },
        "-=0.15"
      );

      timeline.fromTo(
        section3Ref.current,
        {
          opacity: 1,
          scale: 0,
        },
        {
          scale: 1,
        },
        "-=0.15"
      );
      timeline.fromTo(
        section3Ref.current,
        {
          scale: 1,
          transformOrigin: `${transformOrigin3.x}px ${transformOrigin3.y}px`,
        },
        {
          scale: TEXT_ZOOM,
          // y: "-120%",
          // x: "700%",
          ease: "power4.in",
        }
      );

      timeline.fromTo(
        section4Ref.current,
        {
          opacity: 1,
          scale: 0,
        },
        {
          scale: 1,
        },
        "-=0.15"
      );
      timeline.fromTo(
        section4Ref.current,
        {
          scale: 1,
          opacity: 1,
          transformOrigin: `${transformOrigin4.x}px ${transformOrigin4.y}px`,
        },
        {
          scale: TEXT_ZOOM,
          // y: "-300%",
          // x: "300%",
          ease: "power4.in",
        }
      );

      ScrollTrigger.create({
        trigger: containerRef.current,
        pin: elementContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        animation: timeline,
        scrub: true,
        toggleActions: "play none none reverse",
      });
    }, 10);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: "-200vh",
        width: "100%",
        minHeight: "700vh",
        position: "relative",
        overflow: "hidden",
        maxWidth: "100vw",
      }}
    >
      <div
        ref={elementContainerRef}
        className="flex justify-center items-center"
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",

          // background: "grey",
        }}
      >
        <div
          ref={section1Ref}
          className="absolute h-full flex items-center px-8"
          style={{
            opacity: 0,
            width: "100%",
            height: "100vh",
          }}
        >
          <TessellatedCanvas
            containerRef={containerRef}
            config={{
              scrollStart: "top+=300 bottom", // Start 300px before section enters viewport
              scrollEnd: "bottom top",
              startProgressMultiplier: 0.1, // Start very early for full animation
              startProgressOffset: 0.0,
              animationDuration: 0.075, // Full animation duration - completes before zoom
              initialScale: 0, // Start at 0 so animation plays from beginning
              triangleSize: 40, // Triangle size
            }}
          />
          <div
            style={{
              opacity: "var(--text-zoom-initial-opacity)",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              zIndex: 10,
              gap: "10%",
            }}
          >
            <h2
              className="text-5xl  uppercase  text-white"
              style={{
                WebkitFontSmoothing: "subpixel-antialiased",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              Introducing a new way to build:
              <br />
              <span
                className="font-bold"
                style={{
                  fontSize: "min(max(5vw, 11rem), 260px) !important",
                }}
              >
                KI
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    WebkitFontSmoothing: "subpixel-antialiased",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  <span
                    ref={zoomTarget1Ref}
                    style={{
                      position: "absolute",
                      display: "block",
                      width: "70%",
                      height: "55%",
                      top: "20%",
                      left: "15%",
                      backgroundColor: "white",
                      borderRadius: "20px",
                    }}
                  ></span>
                  o
                </span>
              </span>
              {""}
              <br />
            </h2>
            <div className="max-w-lg">
              <div className="text-xl mt-4 text-white flex flex-row  gap-16">
                <div className="flex flex-col gap-4">
                  <span className="text-4xl">/ c · ɪː · ð / </span>
                  <span className="text-white italic text-lg">
                    Said with a soft ky sound at the start, a long ih vowel, and
                    a light voiced th at the end.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={section2Ref}
          style={{
            opacity: 0,
          }}
          className="absolute w-full h-full flex items-center px-8"
        >
          <div className="container mx-auto flex items-end">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <h3 className="text-lg flex flex-col gap-8 ">
                <div className="text-3xl md:text-5xl">What&apos;s a Kio?</div>
                <div
                  className="text-4xl md:text-8xl uppercase font-semibold text-primary"
                  style={{
                    WebkitFontSmoothing: "subpixel-antialiased",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  Every
                  <br /> Company
                  <br /> in Veita
                  <br /> is a Ki
                  <span
                    ref={zoomTarget2Ref}
                    style={{
                      display: "inline-block",
                    }}
                  >
                    o
                  </span>
                  <br />
                </div>
              </h3>
              <p className="md:ml-12 md:w-1/3 text-lg">
                A Kio is a company created inside Veita.
                <br />
                <br />
                Named after kið, the Icelandic word for a young goat — resilient
                and built to climb.
                <br />
                <br />
                Kios are shaped within Veita, then released as independent
                companies.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={section3Ref}
          style={{
            opacity: 0,
          }}
          className="absolute w-full h-full flex items-center px-8"
        >
          <div className="container mx-auto flex items-end">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <h3 className="text-lg flex flex-col gap-8 ">
                <div className="text-2xl md:text-4xl">KIO / 01 / EasyAudit</div>
                <div
                  className="text-4xl md:text-8xl uppercase font-semibold text-primary"
                  style={{
                    WebkitFontSmoothing: "subpixel-antialiased",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  <span
                    ref={zoomTarget3Ref}
                    style={{
                      display: "inline-block",
                    }}
                  >
                    O
                  </span>
                  ver
                  <br />
                  The Fence.
                  <br /> Running
                  <br />
                  Free.
                </div>
              </h3>
              <p className="md:ml-12 md:w-1/3 text-lg">
                EasyAudit is Veita’s first proof that the model works. <br />{" "}
                <br />
                Built quickly using an AI-native approach and without external
                capital, EasyAudit has already left the corral and has jumped
                the first 25 customer fence. <br /> <br /> EasyAudit will thrive
                because builders sove a real problem and chose ownership over
                salary. Plus the software is super slick.
              </p>
            </div>
          </div>
        </div>

        <div
          ref={section4Ref}
          style={{
            opacity: 0,
          }}
          className="absolute w-full h-full flex items-center px-8"
        >
          <div className="container mx-auto flex items-end">
            <div className="flex flex-col md:flex-row gap-4 md:items-end">
              <h3 className="text-lg flex flex-col gap-8 ">
                <div className="text-3xl md:text-5xl">KIO / 02 / Inflow.ai</div>
                <div
                  className="text-4xl md:text-8xl uppercase font-semibold text-primary"
                  style={{
                    WebkitFontSmoothing: "subpixel-antialiased",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    textRendering: "optimizeLegibility",
                  }}
                >
                  At the <br />
                  Fence, <br />
                  Preparing
                  <br />t
                  <span
                    ref={zoomTarget4Ref}
                    style={{
                      display: "inline-block",
                    }}
                  >
                    o
                  </span>{" "}
                  jump.
                </div>
              </h3>
              <p className="md:ml-12 md:w-1/3 text-lg">
                Inflow.ai is the next Kio approaching independence. It’s being
                built inside Veita with momentum and intent, and is expected to
                jump the fence soon. Details are intentionally light — the work
                is not.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
