"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { audioManager } from '@/app/utils/audioManager';

// Global type declarations
declare const gsap: any;
declare const ScrollTrigger: any;

// Utility function
function isMobile(): boolean {
  return typeof window !== "undefined" && window.innerWidth <= 600;
}

// Global variable for gift model
let giftModel: any = null;

/**
 * Main initialization function
 */
export function initHeroAnimations(): any {
  if (typeof gsap === "undefined") {
    console.error("❌ GSAP not loaded!");
    return null;
  }

  console.log("🚀 Hero animations initialized");

  gsap.registerPlugin(ScrollTrigger);

  setupTooltipInteractions();
  splitAllText();

  // Initialize Three.js scenes
  setupProductOverviewScene();
  setupOutroScene();
  setupGiftScene();

  // Initialize audio visualizer
  initAudioVisualizer();

  // Force a refresh after a short delay to ensure DOM calculations are correct
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 500);

  return gsap.context(() => {});
}

/**
 * Setup tooltip click interactions
 */
function setupTooltipInteractions(): void {
  document.querySelectorAll(".tooltip").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".tooltip").forEach((c) => {
        if (c !== card) c.classList.remove("open");
      });
      card.classList.toggle("open");
    });
  });
}

/**
 * Text splitting function
 */
function splitText(selector: string, type: 'chars' | 'lines' = 'chars'): void {
  const elements = document.querySelectorAll(selector);
  
  elements.forEach((element) => {
    const text = element.textContent || "";
    element.innerHTML = "";

    if (type === 'chars') {
      text.split("").forEach((char: string) => {
        const span = document.createElement("span");
        span.className = "char";
        span.innerHTML = `<span>${char === " " ? "&nbsp;" : char}</span>`;
        element.appendChild(span);
      });
    } else if (type === 'lines') {
      const words = text.split(" ");
      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.className = "line";
        span.innerHTML = `<span>${word}${i < words.length - 1 ? "&nbsp;" : ""}</span>`;
        element.appendChild(span);
      });
    }
  });
}

function splitAllText(): void {
  splitText(".header-1 h1", "chars");
  splitText(".tooltip .title h2", "lines");
  splitText(".tooltip .description p", "lines");
  splitText(".outro-question h1", "chars");
  console.log("✅ Text split complete");
}

/**
 * Setup Product Overview Scene
 */
function setupProductOverviewScene(): void {
  let fullHeart: any = null;
  let modelSize: any = null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const modelContainer = document.querySelector(".model-container");
  if (modelContainer) {
    modelContainer.appendChild(renderer.domElement);
  }

  // Lighting - Preserving your specific hex values
  scene.add(new THREE.AmbientLight(0xfce7f3, 1.5));
  const mainLight = new THREE.DirectionalLight(0xf472b6, 2.0);
  mainLight.position.set(5, 5, 5);
  mainLight.castShadow = true;
  scene.add(mainLight);
  
  const fillLight1 = new THREE.DirectionalLight(0xec4899, 1.2);
  fillLight1.position.set(-5, 3, -3);
  scene.add(fillLight1);
  
  const fillLight2 = new THREE.DirectionalLight(0xfce7f3, 0.8);
  fillLight2.position.set(0, -3, -5);
  scene.add(fillLight2);

  const loader = new GLTFLoader();
  loader.load("/models/heart.glb", (gltf) => {
    fullHeart = gltf.scene;

    fullHeart.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.castShadow = true;
        node.receiveShadow = true;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((mat: any) => {
          mat.metalness = 0.3;
          mat.roughness = 0.6;
          mat.needsUpdate = true;
        });
      }
    });

    const box = new THREE.Box3().setFromObject(fullHeart);
    modelSize = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    fullHeart.position.set(-center.x, -center.y, -center.z);

    const scaleVal = isMobile() ? 0.4 : 1;
    fullHeart.scale.set(scaleVal, scaleVal, scaleVal);

    scene.add(fullHeart);

    const fov = camera.fov * (Math.PI / 180);
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    camera.position.z = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
    camera.lookAt(0, 0, 0);

    setupProductScrollAnimations(fullHeart);
  });

  function setupProductScrollAnimations(heart: any): void {
    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".product-overview",
        start: "top top",
        end: "+=500%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onEnter: () => gsap.to(".model-container", { opacity: 1, autoAlpha: 1 }),
        onLeaveBack: () => gsap.to(".model-container", { opacity: 0, autoAlpha: 0 })
      }
    });

    // Detailed Timeline Sequence
    scrollTL
      .fromTo(".header-1 h1 .char > span", { y: "100%" }, { y: "0%", stagger: 0.01, duration: 0.6, ease: "power3.out" }, 0)
      .to(".header-1 h1 .char > span", { xPercent: -150, stagger: 0.01, duration: 1, ease: "power2.inOut" }, 0.4)
      .fromTo(".circular-mask", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(80% at 50% 50%)", duration: 0.8, ease: "power2.inOut" }, 0.9)
      .fromTo(".header-2", { xPercent: 150 }, { xPercent: -150, duration: 1.4, ease: "power1.inOut" }, 1.7)
      // Tooltip 1
      .fromTo(".tooltip:nth-child(1)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.6)
      .fromTo(".tooltip:nth-child(1) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 2.65)
      .fromTo(".tooltip:nth-child(1) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 2.7)
      .fromTo(".tooltip:nth-child(1) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 2.85)
      .fromTo(".tooltip:nth-child(1) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.0)
      // Tooltip 2
      .fromTo(".tooltip:nth-child(2)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 3.3)
      .fromTo(".tooltip:nth-child(2) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 3.35)
      .fromTo(".tooltip:nth-child(2) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 3.4)
      .fromTo(".tooltip:nth-child(2) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 3.55)
      .fromTo(".tooltip:nth-child(2) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.7)
      // Tooltip 3
      .fromTo(".tooltip:nth-child(3)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.0)
      .fromTo(".tooltip:nth-child(3) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.05)
      .fromTo(".tooltip:nth-child(3) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 4.1)
      .fromTo(".tooltip:nth-child(3) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 4.25)
      .fromTo(".tooltip:nth-child(3) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 4.4)
      // Tooltip 4
      .fromTo(".tooltip:nth-child(4)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.7)
      .fromTo(".tooltip:nth-child(4) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.75)
      .fromTo(".tooltip:nth-child(4) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 4.8)
      .fromTo(".tooltip:nth-child(4) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 4.95)
      .fromTo(".tooltip:nth-child(4) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 5.1)
      // Exit animations
      .to(".tooltip", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in", stagger: 0.1 }, 5.5)
      .to(heart.scale, { x: isMobile() ? 4 : 6.5, y: isMobile() ? 4 : 6.5, z: isMobile() ? 4 : 6.5, duration: 2, ease: "power2.inOut" }, 6.0)
      .to(heart.scale, { x: 0.01, y: 0.01, z: 0.01, duration: 2, ease: "power2.in" }, 8.0);

    ScrollTrigger.create({
      trigger: ".product-overview",
      start: "top top",
      end: "+=500%",
      scrub: 1,
      onUpdate: (self: any) => {
        if (heart && self.progress < 0.6) {
          heart.rotation.y = Math.PI * 12 * self.progress;
        }
      }
    });
  }

  function animate(): void {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

/**
 * Setup Outro Scene
 */
function setupOutroScene(): void {
  let outroHeart: any = null;
  let outroModelSize: any = null;

  const outroScene = new THREE.Scene();
  const outroCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const outroRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

  outroRenderer.setClearColor(0x000000, 0);
  outroRenderer.setSize(window.innerWidth, window.innerHeight);
  outroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const outroContainer = document.querySelector(".outro-model-container");
  if (outroContainer) outroContainer.appendChild(outroRenderer.domElement);

  outroScene.add(new THREE.AmbientLight(0xfce7f3, 1.5));
  const outroMainLight = new THREE.DirectionalLight(0xf472b6, 2.0);
  outroMainLight.position.set(5, 5, 5);
  outroScene.add(outroMainLight);
  outroScene.add(new THREE.DirectionalLight(0xec4899, 1.2)).position.set(-5, 3, -3);
  outroScene.add(new THREE.DirectionalLight(0xfce7f3, 0.8)).position.set(0, -3, -5);

  const outroLoader = new GLTFLoader();
  outroLoader.load("/models/broken_heart.glb", (gltf) => {
    outroHeart = gltf.scene;
    outroHeart.traverse((node: any) => {
      if (node.isMesh && node.material) {
        const mat = Array.isArray(node.material) ? node.material : [node.material];
        mat.forEach((m: any) => { m.metalness = 0.3; m.roughness = 0.6; });
      }
    });

    const box = new THREE.Box3().setFromObject(outroHeart);
    outroModelSize = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    outroHeart.position.set(-center.x, -center.y, -center.z);

    const scale = isMobile() ? 0.4 : 1;
    outroHeart.scale.set(scale, scale, scale);
    outroScene.add(outroHeart);

    const fov = outroCamera.fov * (Math.PI / 180);
    outroCamera.position.z = Math.abs(outroModelSize.y / 2 / Math.tan(fov / 2)) * 1.8;
    outroCamera.lookAt(0, 0, 0);

    setupOutroAnimations(outroHeart, outroModelSize);
  });

  function setupOutroAnimations(heart: any, modelSize: any): void {
    const outroInitial = { scale: heart.scale.clone(), y: heart.position.y };

    const outroScrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".outro",
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: 1,
        onEnter: () => {
          gsap.set(".model-container", { opacity: 0, autoAlpha: 0 });
          gsap.set(".outro-model-container", { opacity: 1, autoAlpha: 1 });
        },
        onLeaveBack: () => {
          gsap.set(".model-container", { opacity: 1, autoAlpha: 1 });
          gsap.set(".outro-model-container", { opacity: 0, autoAlpha: 0 });
        }
      }
    });

    outroScrollTL
      .to(".outro-question", { opacity: 1, duration: 0.5 }, 0)
      .fromTo(".outro-question h1 .char > span", { y: "100%" }, { y: "0%", stagger: 0.01, duration: 0.6 }, 0)
      .to(".outro-question h1 .char > span", { xPercent: -150, stagger: 0.01, duration: 1 }, 0.4)
      .to(".outro-question", { opacity: 0, duration: 1 }, 4.5)
      .to(heart.scale, {
        x: isMobile() ? 4.5 : 6.5,
        y: isMobile() ? 4.5 : 6.5,
        z: isMobile() ? 4.5 : 6.5,
        duration: 2,
        onUpdate: () => { heart.position.y = -(modelSize.y * (heart.scale.y - 1)) / 2; }
      }, 5.0)
      .to(heart.scale, { x: outroInitial.scale.x, y: outroInitial.scale.y, z: outroInitial.scale.z, duration: 1.5 }, 7.0)
      .to(".outro-final-message", {
        opacity: 1, duration: 1,
        onComplete: () => {
          document.querySelector(".outro-final-message")?.classList.add("active");
          initNoButtonEscape();
        }
      }, 8.5);
  }

  function animate(): void {
    requestAnimationFrame(animate);
    outroRenderer.render(outroScene, outroCamera);
  }
  animate();
}

/**
 * Setup Gift Scene
 */
function setupGiftScene(): void {
  const giftScene = new THREE.Scene();
  const giftCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const giftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  giftRenderer.setSize(window.innerWidth, window.innerHeight);
  const container = document.querySelector(".gift-model-container");
  if (container) container.appendChild(giftRenderer.domElement);

  giftScene.add(new THREE.AmbientLight(0xfce7f3, 1.5));
  const loader = new GLTFLoader();
  loader.load("/models/gift.glb", (gltf) => {
    giftModel = gltf.scene;
    const box = new THREE.Box3().setFromObject(giftModel);
    const center = box.getCenter(new THREE.Vector3());
    giftModel.position.set(-center.x, -center.y, -center.z);
    giftScene.add(giftModel);
    giftCamera.position.z = 5;

    // "Yes" Button Logic
document.querySelector(".btn-yes")?.addEventListener("click", () => {
  ScrollTrigger.getAll().forEach((st: any) => st.kill());

  gsap.to(".outro-model-container", { opacity: 0, autoAlpha: 0 });
  gsap.set(".gift-model-container", { visibility: "visible", opacity: 1 });

  const tl = gsap.timeline({
    onComplete: () => (window.location.href = "/gift"),
  });

  tl.to(giftModel.rotation, {
    y: Math.PI * 4,
    duration: 3,
    ease: "none",
  }).to(
    giftModel.scale,
    { x: 8, y: 8, z: 8, duration: 2 },
    "-=1"
  );
});

  });

  function animate() {
    requestAnimationFrame(animate);
    giftRenderer.render(giftScene, giftCamera);
  }
  animate();
}

/**
 * No button escape
 */
function initNoButtonEscape(): void {
  const noBtn = document.querySelector(".btn-no") as HTMLElement;
  if (!noBtn) return;

  const moveNoButton = () => {
    const maxX = window.innerWidth - noBtn.offsetWidth - 20;
    const maxY = window.innerHeight - noBtn.offsetHeight - 20;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.transform = `rotate(${Math.random() * 40 - 20}deg)`;
  };

  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveNoButton();
  });
}

/**
 * Audio Visualizer
 */
function initAudioVisualizer(): void {
  const canvas = document.getElementById('visualizer-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  let animationId: number;

  const resize = () => {
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };
  resize();
  window.addEventListener('resize', resize);

  audioManager.initAudioContext();

  function draw() {
    animationId = requestAnimationFrame(draw);
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fillRect(0,0,w,h);

    if (!audioManager.getIsPlaying()) {
      drawIdle(w, h);
    } else {
      const data = audioManager.getAnalyserData();
      if (!data) return;
      const barCount = 50;
      const barWidth = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const val = data[i] / 255;
        const barH = val * h * 0.8;
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(i * barWidth, h - barH, barWidth - 2, barH);
      }
    }
  }

  function drawIdle(w: number, h: number) {
    const time = Date.now() * 0.002;
    for (let i = 0; i < 50; i++) {
      const barH = 10 + Math.sin(time + i * 0.2) * 5;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      ctx.fillRect(i * (w/50), h - barH, (w/50) - 2, barH);
    }
  }

  draw();
}