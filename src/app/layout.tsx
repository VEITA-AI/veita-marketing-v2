import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veita.ai",
  description:
    "Veita.ai is a company studio for engineers, designers, operators, and founders who turn ideas into real companies by contributing skill, time, and judgment in exchange for ownership.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`light`}
        style={{
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <svg viewBox="0 0 398.6 435.4" width="0" height="0">
          <clipPath
            id="blob1"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.002508, 0.002296)"
          >
            <path
              d="M332.3,48.8c32.6,18.1,58.5,49.4,64.7,83.7c6.3,34.3-7.1,71.5-15.8,107.1c-8.6,35.7-12.6,69.7-26,108.4
		c-13.5,38.6-36.5,81.9-68,86.9c-31.4,5-71.5-28.3-117.1-41.8c-45.7-13.6-97.1-7.5-123.9-28.3c-26.7-20.8-28.9-68.5-35-115.4
		c-6.2-46.8-16.4-92.6-8-138c8.3-45.3,35.3-90,74.7-105s91.3-0.3,136.9,9.6C260.4,25.8,299.7,30.6,332.3,48.8z"
            />
          </clipPath>
        </svg>
        <svg viewBox="0 0 390.3 414.4" width="0" height="0">
          <clipPath
            id="blob3"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.002562, 0.002413)"
          >
            <path
              d="M276.8,56.9c23.5,25.9,33.9,61.3,53.7,95.3c19.8,33.9,49,66.4,57.3,104.6c8.2,38.2-4.5,82.3-35.2,102.2
	c-30.6,20-79.2,15.8-121.3,23.7c-42.1,7.8-77.8,27.6-118.6,31.1c-40.9,3.5-86.9-9.3-99.3-41.4c-12.3-32.1,8.9-83.4,8.9-127.5
	c0-44.2-21.1-81.2-22.3-121.6C-1.1,82.9,17.9,39,51.2,17.6C84.6-3.9,132.3-2.9,174.5,5.8S253.3,30.9,276.8,56.9z"
            />
          </clipPath>
        </svg>
        <svg viewBox="0 0 430.8 463.2" width="0" height="0">
          <clipPath
            id="blob4"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.002326, 0.002158)"
          >
            <path
              d="M289.3,71.3c41.2,2.8,97.9,5.3,124,30.9c26,25.7,21.4,74.5-2.1,108.7c-23.4,34.3-65.8,53.9-91.8,92.2
	c-26,38.4-35.7,95.6-67.5,128s-85.7,40.1-130.8,24c-45-16.2-81.2-56.1-101.4-99C-0.6,313.2-5,267.4,5.7,229.8
	c10.8-37.6,36.7-67,45.6-111.5c8.9-44.4,0.8-104,22.2-115.9C94.9-9.5,145.7,26.3,184,45.7C222.3,65.2,248,68.5,289.3,71.3z"
            />
          </clipPath>
        </svg>
        {children}
      </body>
    </html>
  );
}
