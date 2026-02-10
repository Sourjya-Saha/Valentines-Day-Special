"use client";

import { useEffect, useRef, useState } from "react";
import "./flower.css";
import { initFlowerAnimations } from "./flowerAnimations";
import { audioManager } from "@/app/utils/audioManager";
import gsap from "gsap";
import PaperLoader from "../components/PaperLoader";

interface Photo {
  src: string;
  caption: string;
}

interface FlowerProps {
  photos: Photo[];
  title: string;
  backLink?: string;
}

export default function Flower({ photos, backLink = "/" }: FlowerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [showPage, setShowPage] = useState(false);

  const animationsInitialized = useRef(false);

  /* -------------------- AUDIO -------------------- */
  useEffect(() => {
    audioManager.init();
    setIsAudioPlaying(audioManager.getIsPlaying());

    const handleAudioStateChange = (e: any) => {
      setIsAudioPlaying(e.detail.isPlaying);
    };

    window.addEventListener("audioStateChange", handleAudioStateChange);

    if (!audioManager.getIsPlaying()) {
      setTimeout(() => audioManager.play(), 300);
    }

    return () => {
      window.removeEventListener("audioStateChange", handleAudioStateChange);
    };
  }, []);

  /* -------------------- SHOW PAGE IMMEDIATELY -------------------- */
  useEffect(() => {
    setShowPage(true);
  }, []);

  /* -------------------- IMAGE PRELOAD -------------------- */
useEffect(() => {
  if (!showPage) return;

  const images = document.querySelectorAll<HTMLImageElement>(
    ".memory-gallery img"
  );

  // No images → page is ready immediately
  if (images.length === 0) {
    setPageReady(true);
    return;
  }

  let loaded = 0;
  let cancelled = false;

  const onLoad = () => {
    if (cancelled) return;

    loaded++;
    if (loaded === images.length) {
      setPageReady(true);
    }
  };

  images.forEach((img) => {
    if (img.complete) {
      loaded++;
    } else {
      img.addEventListener("load", onLoad);
      img.addEventListener("error", onLoad);
    }
  });

  // Edge case: all images already cached
  if (loaded === images.length) {
    setPageReady(true);
  }

  return () => {
    cancelled = true;
    images.forEach((img) => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onLoad);
    });
  };
}, [showPage]);


  /* -------------------- FLOWER ANIMATIONS -------------------- */
  useEffect(() => {
    if (!pageReady || animationsInitialized.current) return;

    animationsInitialized.current = true;
    const cleanup = initFlowerAnimations(photos.length);
    setIsLoaded(true);

    return cleanup;
  }, [pageReady, photos.length]);

  /* -------------------- AUDIO TOGGLE -------------------- */
  const handleAudioToggle = () => {
    gsap.fromTo(
      ".floating-audio-toggle",
      { scale: 0.85 },
      { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" }
    );
    audioManager.toggle();
  };

  return (
    <>
      <PaperLoader ready={pageReady} onDone={() => {}} />

      <div className={`flower-page ${showPage ? "visible" : "hidden"}`}>
        {/* Audio Toggle */}
        <button
          className={`floating-audio-toggle ${isAudioPlaying ? "playing" : ""}`}
          onClick={handleAudioToggle}
        >
          <span className="audio-icon">{isAudioPlaying ? "♪" : "×"}</span>
          <span className="audio-glow" />
        </button>

        <a href={backLink} className="back-link">← Go back</a>
        <div className="night" />

        {/* Gallery */}
        <div className="memory-gallery">
          <div className="gallery-container">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`photo-slide ${index === 0 ? "active" : ""}`}
              >
                <div className="photo-frame">
                  <img src={photo.src} alt="" />
                  <div className="photo-caption">{photo.caption}</div>
                </div>
              </div>
            ))}

            <div className="gallery-arrows">
              <div
                className="arrow arrow-left"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("changeSlide", { detail: -1 })
                  )
                }
              >
                ←
              </div>
              <div
                className="arrow arrow-right"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("changeSlide", { detail: 1 })
                  )
                }
              >
                →
              </div>
            </div>
          </div>
        </div>
      {/* Valentine Rose Garden */}
      <div className="flowers">
        <div className="flower flower--1">
          <div className="flower__leafs flower__leafs--1">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
            <div className="flower__line__leaf flower__line__leaf--5"></div>
            <div className="flower__line__leaf flower__line__leaf--6"></div>
          </div>
        </div>
    
        <div className="flower flower--2">
          <div className="flower__leafs flower__leafs--2">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>
    
        <div className="flower flower--3">
          <div className="flower__leafs flower__leafs--3">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>
    
        <div className="grow-ans" style={{ '--d': '1.2s' } as React.CSSProperties}>
          <div className="flower__g-long">
            <div className="flower__g-long__top"></div>
            <div className="flower__g-long__bottom"></div>
          </div>
        </div>
    
        <div className="growing-grass">
          <div className="flower__grass flower__grass--1">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>
    
        <div className="growing-grass">
          <div className="flower__grass flower__grass--2">
            <div className="flower__grass--top"></div>
            <div className="flower__grass--bottom"></div>
            <div className="flower__grass__leaf flower__grass__leaf--1"></div>
            <div className="flower__grass__leaf flower__grass__leaf--2"></div>
            <div className="flower__grass__leaf flower__grass__leaf--3"></div>
            <div className="flower__grass__leaf flower__grass__leaf--4"></div>
            <div className="flower__grass__leaf flower__grass__leaf--5"></div>
            <div className="flower__grass__leaf flower__grass__leaf--6"></div>
            <div className="flower__grass__leaf flower__grass__leaf--7"></div>
            <div className="flower__grass__leaf flower__grass__leaf--8"></div>
            <div className="flower__grass__overlay"></div>
          </div>
        </div>
    
        <div className="grow-ans" style={{ '--d': '2.4s' } as React.CSSProperties}>
          <div className="flower__g-right flower__g-right--1">
            <div className="leaf"></div>
          </div>
        </div>
    
        <div className="grow-ans" style={{ '--d': '2.8s' } as React.CSSProperties}>
          <div className="flower__g-right flower__g-right--2">
            <div className="leaf"></div>
          </div>
        </div>
    
        <div className="grow-ans" style={{ '--d': '2.8s' } as React.CSSProperties}>
          <div className="flower__g-front">
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
              <div className="flower__g-front__leaf"></div>
            </div>
            <div className="flower__g-front__line"></div>
          </div>
        </div>
    
        <div className="grow-ans" style={{ '--d': '3.2s' } as React.CSSProperties}>
          <div className="flower__g-fr">
            <div className="leaf"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
            <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
          </div>
        </div>
    
        {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className={`long-g long-g--${index}`}>
            <div className="grow-ans" style={{ '--d': '3s' } as React.CSSProperties}>
              <div className="leaf leaf--0"></div>
            </div>
            <div className="grow-ans" style={{ '--d': '2.2s' } as React.CSSProperties}>
              <div className="leaf leaf--1"></div>
            </div>
            <div className="grow-ans" style={{ '--d': '3.4s' } as React.CSSProperties}>
              <div className="leaf leaf--2"></div>
            </div>
            <div className="grow-ans" style={{ '--d': '3.6s' } as React.CSSProperties}>
              <div className="leaf leaf--3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>

</>



  
  );
}