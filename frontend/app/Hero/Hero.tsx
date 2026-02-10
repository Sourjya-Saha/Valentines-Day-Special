"use client";

import { useEffect, useRef, useState } from 'react';
import IonIcon from '@/app/components/IonIcon';
import './hero.css';
import { initHeroAnimations } from './heroAnimations';
import { audioManager } from '@/app/utils/audioManager';
import LoadingCurtain from "./LoadingCurtain";

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [readyToReveal, setReadyToReveal] = useState(false);

  const heroContextRef = useRef<any>(null);
  const initializationAttempted = useRef(false);
  const autoplayAttempted = useRef(false);

  useEffect(() => {
    // Initialize global audio manager
    audioManager.init();
    setIsAudioPlaying(audioManager.getIsPlaying());

    // Listen for audio state changes
    const handleAudioStateChange = (e: any) => {
      setIsAudioPlaying(e.detail.isPlaying);
    };
    window.addEventListener('audioStateChange', handleAudioStateChange);

    // Handle first user interaction for autoplay
    const handleFirstInteraction = () => {
      if (!autoplayAttempted.current && !audioManager.getIsPlaying()) {
        autoplayAttempted.current = true;
        // Try to play after user interaction
        audioManager.play().catch(() => {
          // Silently fail - user can manually start
        });
      }
    };

    // Listen for any user interaction
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('scroll', handleFirstInteraction, { once: true });

    const checkGSAP = () => {
      if (typeof window !== "undefined" && typeof (window as any).gsap !== "undefined") {
        clearInterval(gsapCheck);
        
        const checkLoaded = () => {
          const icons = document.querySelector("ion-icon");
          if (icons && !isLoaded && !initializationAttempted.current) {
            initializationAttempted.current = true;
            setIsLoaded(true);
            
        heroContextRef.current = initHeroAnimations();
setTimeout(() => {
  setReadyToReveal(true);
}, 400);

          }
        };

        const interval = setInterval(checkLoaded, 100);

        const timeout = setTimeout(() => {
          clearInterval(interval);
          if (!initializationAttempted.current) {
            initializationAttempted.current = true;
            setIsLoaded(true);
            heroContextRef.current = initHeroAnimations();
          }
        }, 3000);

        return () => {
          clearTimeout(timeout);
          clearInterval(interval);
        };
      }
    };

    const gsapCheck = setInterval(checkGSAP, 50);

    return () => {
      clearInterval(gsapCheck);
      window.removeEventListener('audioStateChange', handleAudioStateChange);
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
      if (heroContextRef.current && heroContextRef.current.revert) {
        heroContextRef.current.revert();
      }
    };
  }, [isLoaded]);

  const handleAudioToggle = () => {
    audioManager.toggle();
  };

  return (
    <>
    <>
  <LoadingCurtain ready={readyToReveal} />
  {/* rest of your Hero JSX */}
</>

      {/* Audio visualizer player */}
      <div className="audio-player" suppressHydrationWarning>
        <button 
          className={`audio-toggle ${isAudioPlaying ? 'playing' : ''}`}
          id="audio-toggle" 
          onClick={handleAudioToggle}
          suppressHydrationWarning
        >
          <IonIcon name="play" className="play-icon" />
          <IonIcon name="pause" className="pause-icon" />
        </button>
        <div className="audio-visualizer">
          <canvas id="visualizer-canvas"></canvas>
        </div>
      </div>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <clipPath id="wave-top" clipPathUnits="objectBoundingBox">
            <path d="M 0,0 L 0,0.7 Q 0.15,0.85 0.3,0.75 T 0.6,0.8 T 0.9,0.7 T 1,0.85 L 1,0 Z" />
          </clipPath>
          
          <clipPath id="wave-bottom" clipPathUnits="objectBoundingBox">
            <path d="M 0,1 L 0,0.3 Q 0.15,0.15 0.3,0.25 T 0.6,0.2 T 0.9,0.3 T 1,0.15 L 1,1 Z" />
          </clipPath>
          
          <clipPath id="wave-stripe" clipPathUnits="objectBoundingBox">
            <path d="M 0,0.2 Q 0.15,0.1 0.3,0.25 T 0.6,0.15 T 0.9,0.3 T 1,0.2 L 1,0.8 Q 0.85,0.9 0.7,0.75 T 0.4,0.85 T 0.1,0.7 T 0,0.8 Z" />
          </clipPath>
        </defs>
      </svg>

      <section className="intro prominent-glass">
        <div className="intro-wave">
          <div className="wave-stripe"></div>
          <div className="dark-overlay-top"></div>
          <div className="dark-overlay-bottom"></div>
          <div className="grain"></div>
          
          <h1 className="hero-title">
            <span className="love">Love</span>
            <span className="connector">without a</span>
            <span className="manual">Manual</span>
          </h1>
        </div>
      </section>

      <section className="product-overview">
        <div className="product-wave">
          <div className="wave-stripe"></div>
          <div className="dark-overlay-top"></div>
          <div className="dark-overlay-bottom"></div>
          <div className="grain"></div>
        </div>

        <div className="header-1">
          <h1>Lets Dive Right In</h1>
        </div>

        <div className="header-2">
          <h1>Memory <span style={{ fontStyle: 'italic', color: 'pink', fontWeight: 600 }}>Lane</span> ...</h1>
        </div>

        <div className="circular-mask"></div>

        <div className="tooltips" suppressHydrationWarning>
          <div className="tooltip">
            <div className="icon" suppressHydrationWarning>
              <IonIcon name="heart-dislike" />
            </div>
            <div className="divider"></div>
            <div className="title">
              <h2>2021 - ∞</h2>
            </div>
            <div className="description">
              <p>6 years of memories, laughter, and love.</p>
              <a href="/flower" className="tooltip-link">Let&apos;s Revisit →</a>
            </div>
          </div>

          <div className="tooltip">
            <div className="icon" suppressHydrationWarning>
              <IonIcon name="star" />
            </div>
            <div className="divider"></div>
            <div className="title">
              <h2>School</h2>
            </div>
            <div className="description">
              <p>Our best school days, filled with joy, love and laughter.</p>
              <a href="/flower2" className="tooltip-link">Let&apos;s Revisit →</a>
            </div>
          </div>

          <div className="tooltip">
            <div className="icon" suppressHydrationWarning>
              <IonIcon name="heart" />
            </div>
            <div className="divider"></div>
            <div className="title">
              <h2>Birthdays</h2>
            </div>
            <div className="description">
              <p>Us celebrating birthdays together, creating best moments.</p>
              <a href="/flower3" className="tooltip-link">Let&apos;s Revisit →</a>
            </div>
          </div>

          <div className="tooltip">
            <div className="icon" suppressHydrationWarning>
              <IonIcon name="infinite" />
            </div>
            <div className="divider"></div>
            <div className="title">
              <h2>Festivals</h2>
            </div>
            <div className="description">
              <p>Our shared love for festivals, making every celebration special.</p>
              <a href="/flower4" className="tooltip-link">Let&apos;s Revisit →</a>
            </div>
          </div>
        </div>

        <div className="model-container"></div>
      </section>

      <section className="outro">
        <div className="outro-question">
          <h1>So one last question ?</h1>
        </div>

        <div className="outro-model-container"></div>
        <div className="gift-model-container"></div>

        <div className="outro-final-message">
          <h1>
            Will <span style={{ fontStyle: 'italic', fontFamily: 'georgia', color: '#dd206f', fontWeight: 600 }}>you</span> be my
            <span style={{ fontStyle: 'italic', fontFamily: 'georgia', color: '#ffb8d5', fontWeight: 600 }}> Valentine?</span>
            <span className="heart">❤️</span>
          </h1>
          
          <div className="valentine-actions">
            <div className="yes-zone">
              <button className="btn-yes">Yes ❤️</button>
            </div>
            <div className="no-zone">
              <button className="btn-no">No 💔</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}