import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Love Without a Manual",
  description: "A romantic journey through memories and emotions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ================= THREE.JS IMPORT MAP ================= */}
        <script
          type="importmap"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              imports: {
                three: "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js",
                "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/",
              },
            }),
          }}
        />

        {/* ================= GSAP ================= */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
        />

        {/* ================= IONICONS ================= */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          type="module"
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
        />
        
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          noModule
          src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"
        />
      </head>

      <body
        className={`${inter.className} bg-black text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        {/* Main Content */}
        {children}
            <Analytics />
      </body>
    </html>
  );
}