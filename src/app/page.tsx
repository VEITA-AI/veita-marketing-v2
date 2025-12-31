"use client";

// import { Backdrop } from "@/components/Backdrop";
// import { CardSlideOverSection } from "@/components/CardSlideOverSection";
import { CollaborationsSection } from "@/components/CollaborationsSection";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { KioSection } from "@/components/KioSection";
import { TextZoomSection } from "@/components/TextZoomSection";
import React from "react";

export default function Home() {
  React.useEffect(() => {
    window.scrollTo(0, 0); // values are x,y-offset
  }, []);

  return (
    <div
      className="relative w-full"
      style={{
        overflowX: "clip",
      }}
    >
      {/* <Backdrop /> */}
      {/* Header */}
      {/* <Header /> */}

      {/* Hero Section */}
      <HeroSection />
      <KioSection />
      {/* <TextZoomSection /> */}

      {/* <CardSlideOverSection /> */}

      {/* Clients Section */}
      {/* <CollaborationsSection /> */}

      <Footer />
    </div>
  );
}
