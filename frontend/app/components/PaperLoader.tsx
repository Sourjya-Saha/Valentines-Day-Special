"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface PaperLoaderProps {
  ready: boolean;
  onDone?: () => void;
}

export default function PaperLoader({ ready, onDone }: PaperLoaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const enteredRef = useRef(false);
  const breatheTween = useRef<gsap.core.Tween | null>(null);

useLayoutEffect(() => {
  if (!rootRef.current || !paperRef.current) return;

  // ⛔ HARD BLOCK FIRST PAINT
  gsap.set(rootRef.current, {
    autoAlpha: 1,
    visibility: "visible",
  });

  gsap.set(paperRef.current, {
    scale: 1.02,
    autoAlpha: 0,
    transformOrigin: "top center",
  });

  // ✨ Entrance (ONCE)
  if (!enteredRef.current) {
    enteredRef.current = true;

    gsap.to(paperRef.current, {
      autoAlpha: 1,
      scale: 1,
      duration: 0.32,           // ⬇ faster
      ease: "power2.out",
    });

    // subtle paper life (short + calm)
    breatheTween.current = gsap.to(paperRef.current, {
      y: "+=1.5",
      duration: 0.9,            // ⬇ faster
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  if (!ready) return;

  // ❗ STOP breathing before exit
  breatheTween.current?.kill();

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete: () => {
      gsap.set(rootRef.current, {
        display: "none",
        visibility: "hidden",
      });
      onDone?.();
    },
  });

  tl
    // ⏳ MICRO pause (emotion without delay)
    .to({}, { duration: 0.35 })     // ⬇ from 1.1s

    // ink fade
    .to(textRef.current, {
      autoAlpha: 0,
      y: -6,                        // ⬇ smaller movement
      filter: "blur(3px)",
      duration: 0.22,               // ⬇ faster
    })

    // paper fold
    .to(
      paperRef.current,
      {
        scaleY: 0,
        duration: 0.45,             // ⬇ faster
        ease: "power3.in",
      },
      "-=0.05"
    )

    // loader gone
    .to(rootRef.current, {
      autoAlpha: 0,
      duration: 0.18,               // ⬇ snappy
    });

  return () => {
    tl.kill();
    breatheTween.current?.kill();
  };
}, [ready, onDone]);


  return (
    <div
      ref={rootRef}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 2147483647,
        backgroundColor: "#0b0508", // no white flash
        willChange: "opacity, transform",
      }}
    >
      {/* ===== PAPER ===== */}
      <div
        ref={paperRef}
        className="relative w-full h-full flex items-center justify-center"
        style={{
          background: `
            linear-gradient(180deg, #fdf6f1 0%, #f2ded2 100%),
            radial-gradient(circle at 22% 28%, rgba(0,0,0,0.06), transparent 48%),
            radial-gradient(circle at 78% 72%, rgba(0,0,0,0.07), transparent 52%)
          `,
          // matte feel (no gloss)
          boxShadow: `
            inset 0 0 0 rgba(0,0,0,0),
            inset 0 0 60px rgba(0,0,0,0.04)
          `,
          filter: "contrast(0.97) saturate(0.95)",
        }}
      >
        {/* matte grain */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.02),
                rgba(0,0,0,0.02) 1px,
                transparent 1px,
                transparent 3px
              )
            `,
            opacity: 0.12,
            mixBlendMode: "multiply",
          }}
        />

        {/* fold creases */}
        <div className="absolute inset-x-0 top-1/3 h-px bg-rose-400/25" />
        <div className="absolute inset-x-0 bottom-1/3 h-px bg-rose-400/25" />

        {/* wrinkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[22%] left-[14%] w-[44%] h-[1px] bg-black/10 rotate-[-2.5deg]" />
          <div className="absolute top-[58%] right-[16%] w-[36%] h-[1px] bg-black/10 rotate-[3.5deg]" />
          <div className="absolute bottom-[26%] left-[20%] w-[34%] h-[1px] bg-black/10 rotate-[-1.8deg]" />
        </div>

        {/* stamp */}
        <div className="absolute top-10 right-10 rotate-[10deg] opacity-75">
          <div className="w-20 h-16 border border-amber-900/35 bg-amber-200/35 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-widest text-amber-900">
              Love
            </span>
          </div>
        </div>

        {/* coffee ring */}
        <div className="absolute bottom-14 left-10 w-24 h-24 rounded-full border border-amber-800/25 opacity-3‍5" />

        {/* ===== TEXT ===== */}
        <div ref={textRef} className="relative z-10 text-center">
          <p
            className="uppercase text-rose-500 mb-3"
            style={{
              fontSize: "clamp(0.5rem, 1.3vw, 0.7rem)",
              letterSpacing: "0.45em",
            }}
          >
            Memories
          </p>

          <h1
            className="font-serif italic text-rose-800 whitespace-nowrap"
            style={{
              fontSize: "clamp(1.6rem, 6vw, 3rem)",
            }}
          >
            Unfolding…
          </h1>
        </div>
      </div>
    </div>
  );
}
