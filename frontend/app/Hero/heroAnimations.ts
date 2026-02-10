"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { audioManager } from '@/app/utils/audioManager';

// Global type declarations
declare const gsap: any;
declare const ScrollTrigger: any;

// Utility function
function isMobile(): boolean {
  return window.innerWidth <= 600;
}

// Global variable for gift model
let giftModel: any = null;

/**
 * Main initialization function
 */
export function initHeroAnimations(): any {
  // Check if GSAP is loaded
  if (typeof gsap === "undefined") {
    console.error("❌ GSAP not loaded!");
    return null;
  }

  console.log("🚀 Hero animations initialized");

  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Add tooltip click handlers
  setupTooltipInteractions();

  // Split text for animations
  splitAllText();

  // Initialize Three.js scenes
  setupProductOverviewScene();
  setupOutroScene();
  setupGiftScene();

  // Initialize audio visualizer
  initAudioVisualizer();

  // Return GSAP context for cleanup
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

/**
 * Split all text elements
 */
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
    console.log("✅ Canvas added (product overview)");
  }

  // Lighting
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

  function setupModel(model: any): void {
    if (!model || !modelSize) return;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    model.rotation.set(0, 0, 0);

    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(0, 0, 0);
  }

  // Load heart model
  const loader = new GLTFLoader();
  loader.load(
    "/models/heart.glb",
    (gltf) => {
      console.log("✅ FULL HEART LOADED!");
      fullHeart = gltf.scene;

      fullHeart.traverse((node: any) => {
        if (node.isMesh && node.material) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (Array.isArray(node.material)) {
            node.material.forEach((mat: any) => {
              mat.metalness = 0.3;
              mat.roughness = 0.6;
              mat.needsUpdate = true;
            });
          } else {
            node.material.metalness = 0.3;
            node.material.roughness = 0.6;
            node.material.needsUpdate = true;
          }
        }
      });

      const box = new THREE.Box3().setFromObject(fullHeart);
      modelSize = box.getSize(new THREE.Vector3());

      if (isMobile()) {
        fullHeart.scale.set(0.4, 0.4, 0.4);
      } else {
        fullHeart.scale.set(1, 1, 1);
      }

      fullHeart.visible = true;
      scene.add(fullHeart);
      setupModel(fullHeart);
      setupProductScrollAnimations(fullHeart);
    }
  );

  function setupProductScrollAnimations(heart: any): void {
    const scrollTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".product-overview",
        start: "top top",
        end: "+=500%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        onEnter: () => {
          const model = document.querySelector(".model-container") as HTMLElement;
          if (model) {
            model.style.opacity = "1";
            model.style.visibility = "visible";
          }
        },
        onLeaveBack: () => {
          const model = document.querySelector(".model-container") as HTMLElement;
          if (model) {
            model.style.opacity = "0";
            model.style.visibility = "hidden";
          }
        }
      }
    });

    scrollTL
      .fromTo(".header-1 h1 .char > span", { y: "100%" }, { y: "0%", stagger: 0.01, duration: 0.6, ease: "power3.out" }, 0)
      .to(".header-1 h1 .char > span", { xPercent: -150, stagger: 0.01, duration: 1, ease: "power2.inOut" }, 0.4)
      .fromTo(".circular-mask", { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(80% at 50% 50%)", duration: 0.8, ease: "power2.inOut" }, 0.9)
      .fromTo(".header-2", { xPercent: 150 }, { xPercent: -150, duration: 1.4, ease: "power1.inOut" }, 1.7)
      .fromTo(".tooltip:nth-child(1)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 2.6)
      .fromTo(".tooltip:nth-child(1) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 2.65)
      .fromTo(".tooltip:nth-child(1) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 2.7)
      .fromTo(".tooltip:nth-child(1) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 2.85)
      .fromTo(".tooltip:nth-child(1) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.0)
      .fromTo(".tooltip:nth-child(2)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 3.3)
      .fromTo(".tooltip:nth-child(2) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 3.35)
      .fromTo(".tooltip:nth-child(2) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 3.4)
      .fromTo(".tooltip:nth-child(2) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 3.55)
      .fromTo(".tooltip:nth-child(2) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.7)
      .fromTo(".tooltip:nth-child(3)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.0)
      .fromTo(".tooltip:nth-child(3) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.05)
      .fromTo(".tooltip:nth-child(3) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 4.1)
      .fromTo(".tooltip:nth-child(3) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 4.25)
      .fromTo(".tooltip:nth-child(3) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 4.4)
      .fromTo(".tooltip:nth-child(4)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.7)
      .fromTo(".tooltip:nth-child(4) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.75)
      .fromTo(".tooltip:nth-child(4) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4, ease: "power3.out" }, 4.8)
      .fromTo(".tooltip:nth-child(4) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4, ease: "power3.out" }, 4.95)
      .fromTo(".tooltip:nth-child(4) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 5.1)
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
          heart.rotation.y = Math.PI * 2 * 6 * self.progress;
        }
      }
    });
  }

  function animate(): void {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
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
  outroRenderer.shadowMap.enabled = true;
  outroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const outroModelContainer = document.querySelector(".outro-model-container");
  if (outroModelContainer) {
    outroModelContainer.appendChild(outroRenderer.domElement);
  }

  // Lighting
  outroScene.add(new THREE.AmbientLight(0xfce7f3, 1.5));
  
  const outroMainLight = new THREE.DirectionalLight(0xf472b6, 2.0);
  outroMainLight.position.set(5, 5, 5);
  outroMainLight.castShadow = true;
  outroScene.add(outroMainLight);
  
  const outroFill1 = new THREE.DirectionalLight(0xec4899, 1.2);
  outroFill1.position.set(-5, 3, -3);
  outroScene.add(outroFill1);
  
  const outroFill2 = new THREE.DirectionalLight(0xfce7f3, 0.8);
  outroFill2.position.set(0, -3, -5);
  outroScene.add(outroFill2);

  function setupOutroModel(model: any): void {
    if (!model || !outroModelSize) return;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);
    model.rotation.set(0, 0, 0);

    const maxDim = Math.max(outroModelSize.x, outroModelSize.y, outroModelSize.z);
    const fov = outroCamera.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.8;
    outroCamera.position.set(0, 0, cameraZ);
    outroCamera.lookAt(0, 0, 0);
  }

  const outroLoader = new GLTFLoader();
  outroLoader.load("/models/broken_heart.glb", (gltf) => {
    console.log("✅ Outro broken heart loaded!");
    outroHeart = gltf.scene;

    outroHeart.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.castShadow = true;
        node.receiveShadow = true;
        if (Array.isArray(node.material)) {
          node.material.forEach((mat: any) => {
            mat.metalness = 0.3;
            mat.roughness = 0.6;
            mat.needsUpdate = true;
          });
        } else {
          node.material.metalness = 0.3;
          node.material.roughness = 0.6;
          node.material.needsUpdate = true;
        }
      }
    });

    const box = new THREE.Box3().setFromObject(outroHeart);
    outroModelSize = box.getSize(new THREE.Vector3());

    if (isMobile()) {
      outroHeart.scale.set(0.4, 0.4, 0.4);
    } else {
      outroHeart.scale.set(1, 1, 1);
    }

    outroHeart.visible = true;
    outroScene.add(outroHeart);
    setupOutroModel(outroHeart);
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
        anticipatePin: 1,
        onEnter: () => {
          const productContainer = document.querySelector(".model-container") as HTMLElement;
          const outroContainer = document.querySelector(".outro-model-container") as HTMLElement;
          if (productContainer) {
            productContainer.style.opacity = "0";
            productContainer.style.visibility = "hidden";
          }
          if (outroContainer) {
            outroContainer.style.opacity = "1";
            outroContainer.style.visibility = "visible";
          }
          if (heart && outroInitial) {
            gsap.set(heart.scale, { x: outroInitial.scale.x, y: outroInitial.scale.y, z: outroInitial.scale.z });
            gsap.set(heart.position, { y: outroInitial.y });
            gsap.set(heart.rotation, { x: 0, y: 0, z: 0 });
          }
        },
        onEnterBack: () => {
          const productContainer = document.querySelector(".model-container") as HTMLElement;
          const outroContainer = document.querySelector(".outro-model-container") as HTMLElement;
          if (productContainer) {
            productContainer.style.opacity = "0";
            productContainer.style.visibility = "hidden";
          }
          if (outroContainer) {
            outroContainer.style.opacity = "1";
            outroContainer.style.visibility = "visible";
          }
          if (heart && outroInitial) {
            gsap.set(heart.scale, { x: outroInitial.scale.x, y: outroInitial.scale.y, z: outroInitial.scale.z });
            gsap.set(heart.position, { y: outroInitial.y });
            gsap.set(heart.rotation, { x: 0, y: 0, z: 0 });
          }
        },
        onLeaveBack: () => {
          const productContainer = document.querySelector(".model-container") as HTMLElement;
          const outroContainer = document.querySelector(".outro-model-container") as HTMLElement;
          if (productContainer) {
            productContainer.style.opacity = "1";
            productContainer.style.visibility = "visible";
          }
          if (outroContainer) {
            outroContainer.style.opacity = "0";
            outroContainer.style.visibility = "hidden";
          }
        }
      }
    });

    outroScrollTL
      .to(".outro-question", { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
      .fromTo(".outro-question h1 .char > span", { y: "100%" }, { y: "0%", stagger: 0.01, duration: 0.6, ease: "power3.out" }, 0)
      .to(".outro-question h1 .char > span", { xPercent: -150, stagger: 0.01, duration: 1, ease: "power2.inOut" }, 0.4)
      .to(".outro-question", { opacity: 0, duration: 1, ease: "power2.in" }, 4.5)
      .to(heart.scale, {
        x: isMobile() ? 4.5 : 6.5,
        y: isMobile() ? 4.5 : 6.5,
        z: isMobile() ? 4.5 : 6.5,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => { heart.position.y = -(modelSize.y * (heart.scale.y - 1)) / 2; }
      }, 5.0)
      .to(heart.scale, { x: outroInitial.scale.x, y: outroInitial.scale.y, z: outroInitial.scale.z, duration: 1.5, ease: "power2.inOut" }, 7.0)
      .to(".outro-final-message", {
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        onComplete: () => {
          const finalMessage = document.querySelector(".outro-final-message");
          if (finalMessage) finalMessage.classList.add("active");
          initNoButtonEscape();
        }
      }, 8.5);

    ScrollTrigger.create({
      trigger: ".outro",
      start: "top top",
      end: "+=100%",
      scrub: 1,
      onUpdate: (self: any) => {
        if (heart && self.progress < 0.6) {
          heart.rotation.y = Math.PI * 2 * 6 * self.progress;
        } else if (heart) {
          heart.rotation.y = 0;
        }
      }
    });
  }

  function animate(): void {
    requestAnimationFrame(animate);
    outroRenderer.render(outroScene, outroCamera);
  }
  animate();

  window.addEventListener("resize", () => {
    outroCamera.aspect = window.innerWidth / window.innerHeight;
    outroCamera.updateProjectionMatrix();
    outroRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/**
 * Setup Gift Scene
 */
function setupGiftScene(): void {
  const giftScene = new THREE.Scene();
  const giftCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const giftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

  giftRenderer.setClearColor(0x000000, 0);
  giftRenderer.setSize(window.innerWidth, window.innerHeight);
  giftRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const giftContainer = document.querySelector(".gift-model-container");
  if (giftContainer) {
    giftContainer.appendChild(giftRenderer.domElement);
    (giftContainer as HTMLElement).style.opacity = "0";
    (giftContainer as HTMLElement).style.visibility = "hidden";
  }

  giftScene.add(new THREE.AmbientLight(0xfce7f3, 1.5));
  const giftKey = new THREE.DirectionalLight(0xf472b6, 2);
  giftKey.position.set(5, 5, 5);
  giftScene.add(giftKey);
  giftScene.add(new THREE.DirectionalLight(0xec4899, 1.2));
  giftScene.add(new THREE.DirectionalLight(0xfce7f3, 0.8));

  const giftLoader = new GLTFLoader();
  giftLoader.load("/models/gift.glb", (gltf) => {
    giftModel = gltf.scene;

    giftModel.traverse((n: any) => {
      if (n.isMesh && n.material) {
        n.material.metalness = 0.4;
        n.material.roughness = 0.4;
      }
    });

    const box = new THREE.Box3().setFromObject(giftModel);
    const giftSize = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    giftModel.position.set(-center.x, -center.y, -center.z);

    const maxDim = Math.max(giftSize.x, giftSize.y, giftSize.z);
    const fov = giftCamera.fov * Math.PI / 180;
    giftCamera.position.z = (maxDim / Math.tan(fov / 2)) * 1.8;
    giftCamera.lookAt(0, 0, 0);

    giftScene.add(giftModel);
    setupYesButtonInteraction();
  });

  function animate(): void {
    requestAnimationFrame(animate);
    giftRenderer.render(giftScene, giftCamera);
  }
  animate();

  window.addEventListener("resize", () => {
    giftCamera.aspect = window.innerWidth / window.innerHeight;
    giftCamera.updateProjectionMatrix();
    giftRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  function setupYesButtonInteraction(): void {
    const yesBtn = document.querySelector(".btn-yes");
    if (yesBtn) {
      yesBtn.addEventListener("click", () => {
        if (!giftModel) return;

        ScrollTrigger.getAll().forEach((st: any) => st.kill());

        const outroContainer = document.querySelector(".outro-model-container") as HTMLElement;
        const giftContainer = document.querySelector(".gift-model-container") as HTMLElement;

        gsap.to(outroContainer, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => { outroContainer.style.visibility = "hidden"; }
        });

        giftContainer.style.visibility = "visible";
        gsap.to(giftContainer, { opacity: 1, duration: 0.8, ease: "power2.out" });

        const baseScale = isMobile() ? 0.8 : 1;
        gsap.set(giftModel.scale, { x: baseScale, y: baseScale, z: baseScale });
        gsap.set(giftModel.rotation, { x: 0, y: 0, z: 0 });

        const idleSpin = gsap.to(giftModel.rotation, { y: "+=0.5", duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" });

        gsap.timeline({
          onStart: () => { idleSpin.kill(); },
          onComplete: () => { window.location.href = "/gift"; }
        })
        .to(giftModel.rotation, { y: Math.PI * 4, duration: 3, ease: "none" })
        .to(giftModel.scale, {
          x: isMobile() ? 6.5 : 8.5,
          y: isMobile() ? 6.5 : 8.5,
          z: isMobile() ? 6.5 : 8.5,
          duration: 2,
          ease: "power2.inOut"
        }, "-=1");
      });
    }
  }
}

/**
 * No button escape
 */
function initNoButtonEscape(): void {
  const noBtn = document.querySelector(".btn-no") as HTMLElement;
  const yesBtn = document.querySelector(".btn-yes") as HTMLElement;
  if (!noBtn || !yesBtn) return;

  const yesRect = yesBtn.getBoundingClientRect();
  noBtn.style.left = `${yesRect.right + 40}px`;
  noBtn.style.top = `${yesRect.top}px`;

  function moveNoButton(): void {
    const padding = 20;
    const btnRect = noBtn.getBoundingClientRect();
    const maxX = window.innerWidth - btnRect.width - padding;
    const maxY = window.innerHeight - btnRect.height - padding;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    const rotation = Math.random() * 120 - 60;
    const scale = 0.85 + Math.random() * 0.6;

    noBtn.style.left = `${x}px`;
    noBtn.style.top = `${y}px`;
    noBtn.style.transform = `rotate(${rotation}deg) scale(${scale})`;
  }

  noBtn.addEventListener("mouseenter", moveNoButton);
  noBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveNoButton();
    setTimeout(moveNoButton, 120);
  });

  if (!isMobile()) {
    document.addEventListener("mousemove", (e) => {
      const rect = noBtn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 120) moveNoButton();
    });
  }
}

/**
 * Initialize Audio Visualizer - Uses audioManager for persistent audio
 */
function initAudioVisualizer(): void {
  const canvas = document.getElementById('visualizer-canvas') as HTMLCanvasElement;
  
  if (!canvas) return;

  const ctx = canvas.getContext('2d')!;
  let animationId: number;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize audio context through audioManager
  audioManager.initAudioContext();

  function drawVisualizer() {
    animationId = requestAnimationFrame(drawVisualizer);

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, width, height);

    // Get audio data from audioManager
    if (!audioManager.hasAnalyser()) {
      drawIdle();
      return;
    }

    const dataArray = audioManager.getAnalyserData();
    if (!dataArray) {
      drawIdle();
      return;
    }

    const bufferLength = audioManager.getBufferLength();
    const barCount = 50;
    const barWidth = width / barCount;
    const gap = 1.5;

    for (let i = 0; i < barCount; i++) {
      const percent = i / barCount;
      const exponentialPercent = Math.pow(percent, 1.5);
      const dataIndex = Math.floor(exponentialPercent * bufferLength * 0.7);
      let value = dataArray[dataIndex];

      if (i < barCount * 0.2) value *= 1.3;
      else if (i < barCount * 0.6) value *= 1.5;
      else value *= 1.2;

      const normalizedValue = Math.min(value / 255, 1);
      const barHeight = normalizedValue * height * 0.85;

      const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
      if (normalizedValue > 0.7) {
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.3, '#f472b6');
        gradient.addColorStop(0.6, '#ec4899');
        gradient.addColorStop(1, '#db2777');
      } else if (normalizedValue > 0.4) {
        gradient.addColorStop(0, '#f9a8d4');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#db2777');
      } else {
        gradient.addColorStop(0, '#f472b6');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#be185d');
      }

      ctx.fillStyle = gradient;
      const x = i * barWidth;
      const y = height - barHeight;
      const actualBarWidth = barWidth - gap;

      ctx.shadowBlur = 15;
      ctx.shadowColor = normalizedValue > 0.6 ? 'rgba(236, 72, 153, 0.8)' : 'rgba(236, 72, 153, 0.4)';

      ctx.beginPath();
      ctx.roundRect(x, y, actualBarWidth, barHeight, [3, 3, 0, 0]);
      ctx.fill();

      if (barHeight > height * 0.3) {
        ctx.shadowBlur = 0;
        const reflectionGradient = ctx.createLinearGradient(0, height, 0, height - 8);
        reflectionGradient.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
        reflectionGradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
        ctx.fillStyle = reflectionGradient;
        ctx.fillRect(x, height - 8, actualBarWidth, 8);
      }

      ctx.shadowBlur = 0;
    }

    const centerGlow = ctx.createRadialGradient(width/2, height, 0, width/2, height, width/2);
    centerGlow.addColorStop(0, 'rgba(236, 72, 153, 0.1)');
    centerGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, width, height);
  }

  function drawIdle() {
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, width, height);

    const barCount = 50;
    const barWidth = width / barCount;
    const gap = 1.5;
    const time = Date.now() * 0.0015;

    for (let i = 0; i < barCount; i++) {
      const wave1 = Math.sin(time + i * 0.2) * 6;
      const wave2 = Math.sin(time * 1.5 + i * 0.15) * 4;
      const wave3 = Math.sin(time * 0.8 + i * 0.25) * 3;
      const waveHeight = wave1 + wave2 + wave3 + 15;

      const gradient = ctx.createLinearGradient(0, height - waveHeight, 0, height);
      gradient.addColorStop(0, 'rgba(244, 114, 182, 0.5)');
      gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.4)');
      gradient.addColorStop(1, 'rgba(219, 39, 119, 0.5)');

      ctx.fillStyle = gradient;
      const x = i * barWidth;
      const y = height - waveHeight;
      const actualBarWidth = barWidth - gap;

      ctx.shadowBlur = 8;
      ctx.shadowColor = 'rgba(236, 72, 153, 0.3)';

      ctx.beginPath();
      ctx.roundRect(x, y, actualBarWidth, waveHeight, [3, 3, 0, 0]);
      ctx.fill();

      ctx.shadowBlur = 0;
    }

    const ambientGlow = ctx.createRadialGradient(width/2, height, 0, width/2, height, width/2);
    ambientGlow.addColorStop(0, 'rgba(236, 72, 153, 0.08)');
    ambientGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = ambientGlow;
    ctx.fillRect(0, 0, width, height);
  }

  // Listen for audio state changes
  function handleAudioStateChange(e: any) {
    if (e.detail.isPlaying) {
      cancelAnimationFrame(animationId);
      drawVisualizer();
    } else {
      cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(function loop() {
        drawIdle();
        animationId = requestAnimationFrame(loop);
      });
    }
  }

  window.addEventListener('audioStateChange', handleAudioStateChange);

  // Start with idle or visualizer based on current state
  if (audioManager.getIsPlaying()) {
    drawVisualizer();
  } else {
    animationId = requestAnimationFrame(function loop() {
      drawIdle();
      animationId = requestAnimationFrame(loop);
    });
  }
}