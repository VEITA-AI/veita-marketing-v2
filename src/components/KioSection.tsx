"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import TessellatedCanvas from "./TessellatedCanvas";
import { Tunnel } from "./Tunnel";

export const KioSection: React.FC = () => {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const elementContainerRef = React.useRef<HTMLDivElement>(null);
  const textScrollRef = React.useRef<HTMLDivElement>(null);
  const overlayTextRefs = React.useRef<(HTMLParagraphElement | null)[]>([]);
  const content1Ref = React.useRef<HTMLDivElement>(null);
  const content2Ref = React.useRef<HTMLDivElement>(null);
  const tessRef = React.useRef<HTMLDivElement>(null);
  const kio1Ref = React.useRef<HTMLDivElement>(null);
  const kio2Ref = React.useRef<HTMLDivElement>(null);
  const kio3Ref = React.useRef<HTMLDivElement>(null);
  const kioIndicatorsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      !containerRef.current ||
      !elementContainerRef.current ||
      !sectionRef.current ||
      !textScrollRef.current ||
      !content1Ref.current ||
      !content2Ref.current ||
      !kio1Ref.current ||
      !kio2Ref.current ||
      !kio3Ref.current
    )
      return;

    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline();

    // Set initial state for overlay (slide from bottom, fade in)
    timeline.fromTo(
      containerRef.current,
      {
        autoAlpha: 0,
      },
      {
        autoAlpha: 1,
        duration: "500ms",
      },
      "0"
    );

    timeline.fromTo(
      content1Ref.current,
      {
        opacity: 0,
        y: "100vh",
      },
      {
        duration: 0.5,
        opacity: 1,
        y: 0,
      },
      "0.1" // Delay text fade-in
    );

    timeline.fromTo(
      sectionRef.current,
      {
        scale: 1,
        opacity: 1,
      },
      {
        ease: "power4.in",
        delay: 0.2,
      }
    );

    // Slide and fade in overlay after tessellation animation completes
    // Tessellation completes around 0.35 (0.25 + 0.1), so start overlay at 0.4

    timeline.fromTo(
      textScrollRef.current,
      {
        y: 0,
      },
      {
        y: "-90%",
        ease: "power4.inOut",
        duration: 1,
      },
      "1"
    );

    timeline.fromTo(
      content1Ref.current,
      {
        y: 0,
      },
      {
        y: "-100vh",
      },
      "2"
    );

    timeline.fromTo(
      content2Ref.current,
      {
        y: "100vh",
      },
      {
        y: 0,
      },
      "2"
    );

    timeline.fromTo(
      kio1Ref.current,
      {
        y: "100vh",
      },
      {
        duration: 0.5,
        y: 0,
      },
      "2"
    );

    timeline.fromTo(
      kio3Ref.current,
      {
        y: "200vh",
      },
      {
        duration: 0.5,
        y: "100vh",
      },
      "3"
    );

    timeline.fromTo(
      kioIndicatorsRef.current,
      {
        x: 0,
      },
      {
        x: 20,
        duration: 0.5,
      },
      "3"
    );

    timeline.fromTo(
      kio2Ref.current,
      {
        y: "100vh",
      },
      {
        duration: 0.5,
        y: 0,
      },
      "3"
    );

    timeline.fromTo(
      kioIndicatorsRef.current,
      {
        x: 20,
      },
      {
        x: 40,
        duration: 0.5,
      },
      "4"
    );

    timeline.fromTo(
      kio3Ref.current,
      {
        y: "200vh",
      },
      {
        duration: 0.5,
        y: 0,
      },
      "4"
    );

    timeline.fromTo(
      kio3Ref.current,
      {
        y: 0,
      },
      {
        duration: 0.5,
        y: 0,
      },
      "5"
    );

    timeline.fromTo(
      content2Ref.current,
      {
        y: 0,
      },
      {
        y: "-100vh",
        duration: 0.5,
      },
      "5.5"
    );

    // Set initial state for overlay text lines - hidden
    const lineStates = new Map<HTMLParagraphElement, boolean>();
    overlayTextRefs.current.forEach((lineRef) => {
      if (lineRef) {
        gsap.set(lineRef, {
          opacity: 0,
          visibility: "hidden",
          force3D: true,
        });
        lineStates.set(lineRef, false); // false = hidden
      }
    });

    // Use requestAnimationFrame to throttle updates
    let rafId: number | null = null;
    const viewportCenter = window.innerHeight / 2 + 100;

    const updateLineVisibility = () => {
      // Batch all getBoundingClientRect calls
      const updates: Array<{
        element: HTMLParagraphElement;
        shouldBeVisible: boolean;
      }> = [];

      overlayTextRefs.current.forEach((lineRef) => {
        if (!lineRef) return;

        const rect = lineRef.getBoundingClientRect();
        const lineCenter = rect.top + rect.height / 2;
        const shouldBeVisible = lineCenter <= viewportCenter;
        const isCurrentlyVisible = lineStates.get(lineRef) ?? false;

        // Only update if state changed
        if (shouldBeVisible !== isCurrentlyVisible) {
          updates.push({ element: lineRef, shouldBeVisible });
          lineStates.set(lineRef, shouldBeVisible);
        }
      });

      // Batch all updates - use direct style manipulation for better performance
      // CSS transitions handle the animation smoothly on GPU
      updates.forEach(({ element, shouldBeVisible }) => {
        if (shouldBeVisible) {
          element.style.visibility = "visible";
          element.style.opacity = "1";
        } else {
          element.style.opacity = "0";
          // Delay visibility change to allow fade-out
          setTimeout(() => {
            if (lineStates.get(element) === false) {
              element.style.visibility = "hidden";
            }
          }, 300);
        }
      });

      rafId = null;
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      pin: elementContainerRef.current,
      start: "top top",
      end: "bottom bottom",
      animation: timeline,
      scrub: true,
      toggleActions: "play none none reverse",
      onUpdate: () => {
        // Throttle updates using requestAnimationFrame
        if (rafId === null) {
          rafId = requestAnimationFrame(updateLineVisibility);
        }
      },
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      scrollTrigger.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: "-100vh",
        width: "100%",
        minHeight: "800vh",
        height: "800vh",
        maxHeight: "800vh",
        position: "relative",
        overflow: "hidden",
        maxWidth: "100vw",
      }}
    >
      <div
        className="absolute w-full top-0 left-0"
        style={{ height: "200vh" }}
        ref={tessRef}
      />
      <div
        ref={elementContainerRef}
        className="flex justify-center items-center"
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          ref={sectionRef}
          className="absolute h-full flex items-center px-8"
          style={{
            opacity: 0,
            width: "100%",
            height: "100vh",
          }}
        >
          <TessellatedCanvas
            containerRef={tessRef}
            config={{
              scrollStart: "top top",
              scrollEnd: "bottom top+=100vh",
              startProgressMultiplier: 0.25,
              startProgressOffset: 0.0,
              animationDuration: 0.1,
              initialScale: 0,
              triangleSize: 40,
              // White color configuration
              colorStart: { r: 1, g: 1, b: 1 },
              colorEnd: { r: 0.8, g: 0.8, b: 0.8 },
            }}
          />
          <div ref={content1Ref} className="absolute w-full ">
            <div
              className="flex flex-col md:flex-row gap-4 md:items-end"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1280px",
                margin: "0 auto",
                gap: "64px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                zIndex: 10,
              }}
            >
              <div className="md:flex hidden flex-col gap-8 justify-end items-end">
                <div
                  style={{
                    backgroundColor: "#F5F5F5",
                    borderRadius: "12px",
                    padding: "16px",
                    maxWidth: "320px",
                    WebkitFontSmoothing: "subpixel-antialiased",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                  }}
                >
                  <p
                    className="uppercase"
                    style={{
                      fontSize: "12px",
                      marginBottom: "24px",
                      fontFamily: "sans-serif",
                    }}
                  >
                    INTRODUCING A NEW WAY TO BUILD.
                  </p>
                  <h4
                    className="text-3xl font-bold"
                    style={{
                      marginBottom: "16px",
                      textRendering: "optimizeLegibility",
                    }}
                  >
                    kio
                  </h4>
                  <p
                    style={{
                      fontSize: "18px",
                      fontFamily: "monospace",
                      marginBottom: "16px",
                      color: "#000",
                      letterSpacing: "0.05em",
                    }}
                  >
                    /c · ɪː · ð/
                  </p>
                  <p
                    style={{
                      fontSize: "16px",
                      fontFamily: "sans-serif",
                      color: "#000",
                      lineHeight: "1.5",
                    }}
                  >
                    Said with a soft ky sound at the start, a long ih vowel, and
                    a light voiced th at the end
                  </p>
                </div>
                <img
                  src="/GOAT 1.svg"
                  alt="Kio Logo"
                  style={{ width: "124px", height: "auto" }}
                />
              </div>
              <div
                style={{
                  position: "relative",
                  flex: 1,
                  width: "calc(100% - 64px)",
                }}
              >
                <div className="absolute w-full" ref={textScrollRef}>
                  <div
                    className="flex flex-col gap-12 text-4xl md:text-5xl h-full w-full font-semibold"
                    style={{
                      color: "#B3B3B3",
                      zIndex: 0,
                    }}
                    aria-hidden="true"
                  >
                    <p>
                      What&apos;s a Kio? a Kio is a company born inside Veita.
                    </p>
                    <p>The name comes from kið — Icelandic for baby goat.</p>
                    <p>Small. Scrappy. Built to climb.</p>
                    <p>
                      Kios start inside Veita, where they&apos;re shaped,
                      tested, and strengthened.
                    </p>
                    <p>
                      Once the product is real and traction is proven, they spin
                      out as independent companies.
                    </p>
                    <p>Every Kio shares one goal.</p>
                    <p>Not hype.</p>
                    <p>Not &quot;pretty good.&quot;</p>
                    <p>
                      To become the best at what it does — earned through
                      ownership, not paychecks.
                    </p>
                    <p>Small at the start.</p>
                    <p>Built to go the distance.</p>
                  </div>
                  {/* Text that appears over the grey text, should be same, but will be animated in */}
                  <div
                    className="flex flex-col gap-12 text-4xl md:text-5xl absolute h-full w-full font-semibold"
                    style={{
                      zIndex: 1,
                      top: 0,
                    }}
                    aria-hidden="true"
                  >
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[0] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      What&apos;s a Kio? a Kio is a company born inside Veita.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[1] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      The name comes from kið — Icelandic for baby goat.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[2] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Small. Scrappy. Built to climb.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[3] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Kios start inside Veita, where they&apos;re shaped,
                      tested, and strengthened.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[4] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Once the product is real and traction is proven, they spin
                      out as independent companies.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[5] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Every Kio shares one goal.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[6] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Not hype.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[7] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Not &quot;pretty good.&quot;
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[8] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      To become the best at what it does — earned through
                      ownership, not paychecks.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[9] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Small at the start.
                    </p>
                    <p
                      ref={(el) => {
                        overlayTextRefs.current[10] = el;
                      }}
                      style={{
                        willChange: "opacity",
                        transform: "translateZ(0)",
                        transition: "opacity 0.3s ease-out",
                      }}
                    >
                      Built to go the distance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div ref={content2Ref} className="absolute w-full h-full">
            <div
              className="flex flex-col md:flex-col gap-4 md:items-end py-24 pr-16 md:pr-0"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1280px",
                margin: "0 auto",
                gap: "16px",
                justifyContent: "space-between",
                alignItems: "flex-start",
                zIndex: 10,
              }}
            >
              <div
                className="rotate-90 p-8 md:flex hidden"
                style={{
                  position: "absolute",
                  top: 0,
                  right: -248,
                  width: "344px",
                  backgroundColor: "#F5F5F5",
                  transformOrigin: "left bottom",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "12px",
                }}
              >
                <h2 className="text-2xl uppercase font-bold">Our Kios</h2>
                <div className="flex flex-row gap-2 align-middle relative">
                  <div
                    className="absolute top-0 left-0 w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#303030" }}
                    ref={kioIndicatorsRef}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#B3B3B3" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#B3B3B3" }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#B3B3B3" }}
                  />
                </div>
              </div>
              {/* Kio 1 */}
              <div
                ref={kio1Ref}
                className="relative w-full h-full"
                style={{
                  maxWidth: "1024px",
                  transform: "translateZ(0)",
                  willChange: "transform",
                }}
              >
                <div
                  className="absolute w-full h-full p-8 flex text-white gap-16 md:gap-32 flex-col md:flex-row"
                  style={{
                    backgroundColor: "red",
                    height: "calc(100vh - 200px)",
                    borderRadius: "32px",
                    overflow: "hidden",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="backdrop-gradient-easyaudit" />
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
                      <Tunnel color="#067949" />
                    </div>
                  </div>
                  <div
                    className="flex flex-col justify-between h-full z-10"
                    style={{ minWidth: "272px" }}
                  >
                    <div>
                      <h2 className="text-xl">Kio 1</h2>
                      <h3 className="text-3xl font-semibold">EasyAudit</h3>
                      <h4 className="text-xl">Over the fence. Running free.</h4>
                    </div>
                    <div className="text-xl">
                      <a
                        href="https://easyaudit.ai"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Live Website
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col gap-6 text-xl h-full align-bottom justify-end md:p-8 p-0 z-10">
                    <p>
                      EasyAudit is Veita’s first proof that the model works.
                    </p>
                    <p>
                      Built quickly using AI-native systems and without external
                      capital, it has already spun out of Veita and crossed its
                      first milestone: 25 active customers.
                    </p>
                    <p>
                      EasyAudit exists because builders chose ownership over
                      salary and focused on solving a real problem.
                    </p>
                  </div>
                </div>
              </div>
              {/* Kio 2 */}
              <div
                ref={kio2Ref}
                className="relative w-full h-full"
                style={{
                  maxWidth: "1024px",
                  transform: "translateY(calc(100vh - 200px)) translateZ(0)",
                  willChange: "transform",
                }}
              >
                <div
                  className="absolute w-full h-full p-8 flex text-white gap-16 md:gap-32 flex-col md:flex-row"
                  style={{
                    backgroundColor: "red",
                    height: "calc(100vh - 200px)",
                    borderRadius: "32px",
                    overflow: "hidden",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="backdrop-gradient-dataflow" />
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
                      <Tunnel color="#AF4300" />
                    </div>
                  </div>
                  <div
                    className="flex flex-col justify-between h-full z-10"
                    style={{ minWidth: "272px" }}
                  >
                    <div>
                      <h2 className="text-xl">Kio 2</h2>
                      <h3 className="text-3xl font-semibold">DataFlow</h3>
                      <h4 className="text-xl">
                        At the fence. Preparing to jump.
                      </h4>
                    </div>
                    <div className="text-xl">Coming Soon</div>
                  </div>
                  <div className="flex flex-col gap-6 text-xl h-full align-bottom justify-end md:p-8 p-0 z-10">
                    <p>
                      Dataflow is an agentic email and task assistant, and it’s
                      the next Kio approaching independence.
                    </p>
                    <p>
                      It’s being built inside Veita with momentum and intent,
                      and is expected to jump the fence soon. Details are
                      intentionally light — the work is not.
                    </p>
                  </div>
                </div>
              </div>
              {/* Kio 3 */}
              <div
                ref={kio3Ref}
                className="relative w-full h-full"
                style={{
                  maxWidth: "1024px",
                  transform: "translateY(calc(200vh - 400px)) translateZ(0)",
                  willChange: "transform",
                }}
              >
                <div
                  className="absolute w-full h-full p-8 flex text-white gap-16 md:gap-32 flex-col md:flex-row"
                  style={{
                    backgroundColor: "red",
                    height: "calc(100vh - 200px)",
                    borderRadius: "32px",
                    overflow: "hidden",
                  }}
                >
                  <div className="absolute top-0 left-0 w-full h-full z-0">
                    <div className="backdrop-gradient-kio3" />
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
                      <Tunnel color="#00afa7" />
                    </div>
                  </div>
                  <div
                    className="flex flex-col justify-between h-full z-10"
                    style={{ minWidth: "272px" }}
                  >
                    <div>
                      <h2 className="text-xl">Kio 3</h2>
                      <h3 className="text-3xl font-semibold">???</h3>
                      <h4 className="text-xl">Still in the corral.</h4>
                    </div>
                    <div className="text-xl">Coming Soon</div>
                  </div>
                  <div className="flex flex-col gap-6 text-xl h-full align-bottom justify-end md:p-8 p-0 z-10">
                    <p>Some Kios are better kept quiet until they’re ready.</p>
                    <p>
                      This one is early, intentional, and already taking shape.
                      More soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
