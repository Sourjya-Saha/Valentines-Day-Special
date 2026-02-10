"use client";

import { useEffect } from "react";

export default function LoadingCurtain({ ready }: { ready: boolean }) {
  useEffect(() => {
    if (!ready || typeof window === "undefined") return;

    const gsap = (window as any).gsap;
    if (!gsap) return;

    const tl = gsap.timeline({
      delay: 0.4,
      defaults: { ease: "power4.inOut" },
    });

    // Title fades & softens WITH curtain
    tl.to(".loader-title", {
      opacity: 0,
      filter: "blur(12px)",
      scale: 0.98,
      duration: 1.2,
      ease: "power2.out",
    }, 0)

      // Curtains open smoothly
      .to(".curtain-left", {
        x: "-110%",
        duration: 2.4,
      }, 0.1)

      .to(".curtain-right", {
        x: "110%",
        duration: 2.4,
      }, 0.1)

      // Veil fades last
      .to(".veil-blur", {
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
      }, 0.8)

      .to(".loader-overlay", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      })

      .set(".loader-overlay", { display: "none" });

  }, [ready]);

  return (
    <div className="loader-overlay fixed inset-0 z-[9999] pointer-events-none overflow-hidden">
      
      {/* ===== Veil over REAL intro ===== */}
      <div
        className="veil-blur absolute inset-0"
        style={{
          backdropFilter: "blur(26px)",
          background:
            "linear-gradient(180deg, rgba(10,5,15,0.82), rgba(20,5,20,0.82))",
        }}
      />

      {/* ===== Center Title (BOUND TO CURTAIN) ===== */}
  <div className="loader-title absolute inset-0 z-20 flex flex-col items-center justify-center text-center gap-4">
  <p
    className="uppercase text-pink-300 opacity-80 mb-10"
    style={{
      fontSize: "clamp(0.75rem, 1.6vw, 0.99rem)",
      letterSpacing: "0.55em",
    }}
  >
    A LOVE STORY
  </p>

  <h1
    className="font-serif  text-white whitespace-nowrap  "
    style={{
      fontSize: "clamp(1.8rem, 6.5vw, 4rem)", // BIGGER & HERO-LIKE
      letterSpacing: "0.015em",
      lineHeight: "1.05",
    }}
  >
   <span className="italic text-pink-600 font-extrabold">Love</span>  Without a <span className="italic text-pink-300 font-extralight" >Manual</span>
  </h1>
</div>


      {/* ===== Curtains ===== */}
      <div className="curtain-left absolute top-0 left-0 w-1/2 h-full overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to right, #14000f, #1b0016, #0b0008)",
            boxShadow: "inset -12px 0 40px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      <div className="curtain-right absolute top-0 right-0 w-1/2 h-full overflow-hidden">
        <div
          className="w-full h-full"
          style={{
            background:
              "linear-gradient(to left, #14000f, #1b0016, #0b0008)",
            boxShadow: "inset 12px 0 40px rgba(0,0,0,0.6)",
          }}
        />
      </div>
    </div>
  );
}
