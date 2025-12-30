"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

const HighlightText = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode | React.ReactNode[];
  delay?: number;
}) => {
  const textHighlight = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!textHighlight.current) return;

    const timeline = gsap.timeline();

    timeline.fromTo(
      textHighlight.current,
      {
        width: "0%",
      },
      {
        width: "calc(100% + 32px)",
        duration: 1,
        delay,
      }
    );

    timeline.play();
  }, [textHighlight, delay]);

  return (
    <span
      style={{
        overflow: "visible",
        display: "inline-block",
        position: "relative",
      }}
    >
      <span
        ref={textHighlight}
        style={{
          position: "absolute",
          top: "0.75vw",
          left: "-0.5vw",
          maxWidth: "calc(100% + 1vw)",
          height: "min(max(6vw, 3rem), 125px)",
          background: "#B0BDF5",
        }}
      />
      <span
        style={{
          position: "relative",
          display: "inline-block",
          zIndex: 1,
        }}
      >
        {children}
      </span>
    </span>
  );
};

const Counter = ({
  target = 0,
  increment = 1,
}: {
  target?: number;
  increment?: number;
}) => {
  const textRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (textRef.current === null) return;

    gsap.fromTo(
      textRef.current,
      {
        textContent: 0,
        ease: "power1.in",
        snap: {
          textContent: increment,
        },
      },
      {
        textContent: target,
        snap: {
          textContent: increment,
        },
        duration: 2,
        ease: "power1.out",
        delay: 2.5,
      }
    );
  }, [increment, target]);

  return <span ref={textRef}>0</span>;
};

const HIGHLIGHT_OFFSET = 2.25;

export const HeroSection: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const line1Ref = React.useRef<HTMLSpanElement>(null);
  const line2Ref = React.useRef<HTMLSpanElement>(null);
  const line3Ref = React.useRef<HTMLSpanElement>(null);
  const line4Ref = React.useRef<HTMLSpanElement>(null);

  const block1Ref = React.useRef<HTMLDivElement>(null);
  const block2Ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      line1Ref.current === null ||
      line2Ref.current === null ||
      line3Ref.current === null ||
      line4Ref.current === null ||
      block1Ref.current === null ||
      block2Ref.current === null
    )
      return;

    const timeline = gsap.timeline();

    timeline.fromTo(
      line1Ref.current,
      {
        autoAlpha: 0,
        y: "10vh",
        "--hero-line-1-blur": "50px",
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        "--hero-line-1-blur": "0px",
      },
      "0"
    );
    timeline.fromTo(
      line2Ref.current,
      {
        autoAlpha: 0,
        y: "10vh",
        "--hero-line-2-blur": "50px",
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        "--hero-line-2-blur": "0px",
      },
      "0.2"
    );
    timeline.fromTo(
      line3Ref.current,
      {
        autoAlpha: 0,
        y: "10vh",
        "--hero-line-3-blur": "50px",
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        "--hero-line-3-blur": "0px",
      },
      "0.4"
    );
    timeline.fromTo(
      line4Ref.current,
      {
        autoAlpha: 0,
        y: "10vh",
        "--hero-line-4-blur": "50px",
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        "--hero-line-4-blur": "0px",
      },
      "0.6"
    );
    timeline.fromTo(
      block1Ref.current,
      {
        autoAlpha: 0,
        x: "50vw",
      },
      {
        autoAlpha: 1,
        x: "0vw",
        duration: 0.5,
      },
      "1.2"
    );
    timeline.fromTo(
      block2Ref.current,
      {
        autoAlpha: 0,
        x: "50vw",
      },
      {
        autoAlpha: 1,
        x: "0vw",
        duration: 0.5,
      },
      "1.5"
    );
  }, []);

  React.useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const timeline = gsap.timeline();

    timeline.fromTo(
      contentRef.current,
      {
        delay: 1,
        autoAlpha: 1,
      },
      {
        autoAlpha: 0,
      }
    );

    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      animation: timeline,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
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
        }}
      >
        <div
          className="h-screen w-full flex flex-col md:items-center md:justify-center relative mx-auto"
          style={{
            maxWidth: "1580px",
          }}
        >
          <div className="w-full flex flex-col md:flex-row gap-16 pt-24 md:pt-0 relative mx-auto">
            <div
              className="ml-5"
              style={{
                width: "fit-content",
              }}
            >
              <h1
                className=" font-normal leading-tight"
                style={{
                  fontSize: "min(max(5vw, 3rem), 125px)",
                }}
              >
                <span
                  ref={line1Ref}
                  style={{
                    opacity: 0,
                    display: "inline-block",
                    filter: "blur(var(--hero-line-1-blur))",
                  }}
                >
                  Building companies
                  <br /> by putting{" "}
                  <HighlightText delay={HIGHLIGHT_OFFSET}>value</HighlightText>
                </span>
                <br />
                <span
                  ref={line2Ref}
                  style={{
                    opacity: 0,
                    display: "inline-block",
                    filter: "blur(var(--hero-line-2-blur))",
                  }}
                >
                  where it{" "}
                  <HighlightText delay={HIGHLIGHT_OFFSET + 1}>
                    belongs
                  </HighlightText>{" "}
                  -
                </span>
                <br />
                <span
                  ref={line3Ref}
                  style={{
                    opacity: 0,
                    display: "inline-block",
                    filter: "blur(var(--hero-line-3-blur))",
                  }}
                >
                  with the{" "}
                  <HighlightText delay={HIGHLIGHT_OFFSET + 1.6}>
                    people
                  </HighlightText>{" "}
                  who
                </span>
                <br />
                <span
                  ref={line4Ref}
                  style={{
                    opacity: 0,
                    display: "inline-block",
                    filter: "blur(var(--hero-line-4-blur))",
                  }}
                >
                  <HighlightText delay={HIGHLIGHT_OFFSET + 2.4}>
                    create
                  </HighlightText>{" "}
                  it.
                </span>
              </h1>
            </div>
            <div
              className="flex flex-col justify-between px-5 md:px-0 md:min-h-[100%] gap-8"
              style={{ flex: 1 }}
            >
              <p
                className="text-xl md:text-2xl pr-4"
                ref={block1Ref}
                style={{ opacity: 0 }}
              >
                Veita exists to help entrepreneurs build real companies without
                needing permission from capital.
                <br />
                <br />
                We believe the world is flipped upside down. Money outranks
                talent, ownership outranks effort, and access outranks ability.
              </p>
              <div
                className="flex flex-col gap-4"
                ref={block2Ref}
                style={{ opacity: 0 }}
              >
                <p>
                  We are an AI-native incubator built around a simple belief:
                  <br />
                  the best companies are built by people who are willing to work
                  for equity — not just salary — when they’re given the right
                  platform, structure, and support.
                  <br />
                  <br />
                  We call this model Work for Equity (WFE).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
