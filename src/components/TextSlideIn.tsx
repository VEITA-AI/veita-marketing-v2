"use client";

import React from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";

interface TextSlideInProps {
  text: string | React.ReactNode;
  delay?: number;
}

export const TextSlideIn: React.FC<TextSlideInProps> = ({
  text,
  delay = 0,
}) => {
  const textRef = React.useRef<HTMLDivElement>(null);
  const textContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!textRef.current || !textContentRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      textContentRef.current,
      {
        y: 100,
        delay: delay,
      },
      {
        y: 0,
        delay: delay,
        stagger: 0.05,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 90%", // Start animation when the element is near the viewport
          end: "top 60%", // Animation ends when scrolled slightly further
        },
      }
    );
  }, [text, textRef]);

  return (
    <div
      ref={textRef}
      className=""
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      }}
    >
      <div
        ref={textContentRef}
        style={{
          willChange: "transform",
          transform: "translateY(100px) ",
        }}
      >
        {text}
      </div>
    </div>
  );
};
