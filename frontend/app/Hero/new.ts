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
const renderer = new THREE.WebGLRenderer({
  antialias: !isMobile(), // ❗
  alpha: true,
  powerPreference: "low-power" // ❗
});

  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
 renderer.setPixelRatio(isMobile() ? 1 : Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = !isMobile();
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

const controller = createRendererController(renderer, scene, camera);

setupProductScrollAnimations(fullHeart, controller);

// Desktop only continuous rendering


    }
  );

function setupProductScrollAnimations(
  heart: any,
  controller: {
    renderOnce: () => void;
    startContinuous: () => void;
    stopContinuous: () => void;
  }
): void {


const scrollTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".product-overview",
    start: "top top",
    end: "+=500%",
    pin: true,
    scrub: 1,
    anticipatePin: 1,

    onUpdate: () => {
      controller.renderOnce();
    },

    onEnter: () => {
      const model = document.querySelector(".model-container") as HTMLElement;
      if (model) {
        model.style.opacity = "1";
        model.style.visibility = "visible";
      }
      controller.startContinuous(); // ▶ start rendering
      controller.renderOnce();
    },

    onLeave: () => {
      const model = document.querySelector(".model-container") as HTMLElement;
      if (model) {
        model.style.opacity = "0";
        model.style.visibility = "hidden";
      }
      controller.stopContinuous(); // ⛔ stop rendering
    },

    onLeaveBack: () => {
      const model = document.querySelector(".model-container") as HTMLElement;
      if (model) {
        model.style.opacity = "0";
        model.style.visibility = "hidden";
      }
      controller.stopContinuous(); // ⛔ stop rendering
    }
  }
});


  scrollTL
    .fromTo(
      ".header-1 h1 .char > span",
      { y: "100%" },
      { y: "0%", stagger: 0.01, duration: 0.6, ease: "power3.out" },
      0
    )
    .to(
      ".header-1 h1 .char > span",
      { xPercent: -150, stagger: 0.01, duration: 1, ease: "power2.inOut" },
      0.4
    )
    .fromTo(
      ".circular-mask",
      { clipPath: "circle(0% at 50% 50%)" },
      { clipPath: "circle(80% at 50% 50%)", duration: 0.8, ease: "power2.inOut" },
      0.9
    )
    .fromTo(
      ".header-2",
      { xPercent: 150 },
      { xPercent: -150, duration: 1.4, ease: "power1.inOut" },
      1.7
    )

    // TOOLTIP 1
    .fromTo(".tooltip:nth-child(1)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 2.6)
    .fromTo(".tooltip:nth-child(1) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 2.65)
    .fromTo(".tooltip:nth-child(1) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4 }, 2.7)
    .fromTo(".tooltip:nth-child(1) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4 }, 2.85)
    .fromTo(".tooltip:nth-child(1) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.0)

    // TOOLTIP 2
    .fromTo(".tooltip:nth-child(2)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 3.3)
    .fromTo(".tooltip:nth-child(2) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 3.35)
    .fromTo(".tooltip:nth-child(2) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4 }, 3.4)
    .fromTo(".tooltip:nth-child(2) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4 }, 3.55)
    .fromTo(".tooltip:nth-child(2) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 3.7)

    // TOOLTIP 3
    .fromTo(".tooltip:nth-child(3)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.0)
    .fromTo(".tooltip:nth-child(3) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.05)
    .fromTo(".tooltip:nth-child(3) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4 }, 4.1)
    .fromTo(".tooltip:nth-child(3) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4 }, 4.25)
    .fromTo(".tooltip:nth-child(3) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 4.4)

    // TOOLTIP 4
    .fromTo(".tooltip:nth-child(4)", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35 }, 4.7)
    .fromTo(".tooltip:nth-child(4) .divider", { scaleX: 0 }, { scaleX: 1, duration: 0.35 }, 4.75)
    .fromTo(".tooltip:nth-child(4) .icon ion-icon", { y: "125%" }, { y: "0%", duration: 0.4 }, 4.8)
    .fromTo(".tooltip:nth-child(4) .title .line > span", { y: "125%" }, { y: "0%", stagger: 0.05, duration: 0.4 }, 4.95)
    .fromTo(".tooltip:nth-child(4) .description .line > span", { y: "125%" }, { y: "0%", stagger: 0.03, duration: 0.4 }, 5.1)

    .to(".tooltip", { opacity: 0, y: -30, duration: 0.5, stagger: 0.1 }, 5.5)
 .to(heart.scale, {
  x: isMobile() ? 4 : 6.5,
  y: isMobile() ? 4 : 6.5,
  z: isMobile() ? 4 : 6.5,
  duration: 2,
  ease: "power2.inOut"
}, 6.0)

.to(heart.scale, {
  x: 0.01,
  y: 0.01,
  z: 0.01,
  duration: 2,
  ease: "power2.in"
}, 8.0);


  // 🔄 ROTATION — scroll driven, mobile safe
  ScrollTrigger.create({
    trigger: ".product-overview",
    start: "top top",
    end: "+=500%",
    scrub: 1,
    onUpdate: (self: any) => {
      if (heart && self.progress < 0.6) {
        heart.rotation.y = Math.PI * 2 * 6 * self.progress;
        controller.renderOnce();
      }
    }
  });
}


 function createRendererController(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  let rafId: number | null = null;

  const renderOnce = () => {
    renderer.render(scene, camera);
  };

  const startContinuous = () => {
    if (rafId !== null) return;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };
    loop();
  };

  const stopContinuous = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { renderOnce, startContinuous, stopContinuous };
}


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
  // 🛑 Mobile safety
 const isMobileView = isMobile();


  let outroHeart: any = null;
  let outroModelSize: any = null;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobileView,
  alpha: true,
  powerPreference: isMobileView ? "low-power" : "high-performance"
});

renderer.setPixelRatio(isMobileView ? 1 : Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = !isMobileView;
const maxScale = isMobileView ? 4.5 : 8.5;


  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
 
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const container = document.querySelector(".outro-model-container");
  if (!container) return;
  container.appendChild(renderer.domElement);

  // 💡 Lighting
  scene.add(new THREE.AmbientLight(0xfce7f3, 1.5));

  const keyLight = new THREE.DirectionalLight(0xf472b6, 2);
  keyLight.position.set(5, 5, 5);
  keyLight.castShadow = true;
  scene.add(keyLight);

  scene.add(new THREE.DirectionalLight(0xec4899, 1.2));
  scene.add(new THREE.DirectionalLight(0xfce7f3, 0.8));

  // 🎮 Renderer controller
  const controller = createRendererController(renderer, scene, camera);

  function setupModel(model: any): void {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    outroModelSize = size;

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    camera.position.z = (maxDim / Math.tan(fov / 2)) * 1.8;
    camera.lookAt(0, 0, 0);
  }

  // 📦 Load model
  const loader = new GLTFLoader();
  loader.load("/models/broken_heart.glb", (gltf) => {
    outroHeart = gltf.scene;

    outroHeart.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.castShadow = true;
        node.receiveShadow = true;
        node.material.metalness = 0.3;
        node.material.roughness = 0.6;
        node.material.needsUpdate = true;
      }
    });

    scene.add(outroHeart);
    setupModel(outroHeart);

    setupOutroAnimations(outroHeart);

    // ▶ Start rendering ONLY when visible
   
  });

  function setupOutroAnimations(heart: any): void {
    const initialScale = heart.scale.clone();
    const initialY = heart.position.y;

    const tl = gsap.timeline({
      scrollTrigger: {
        id: "outro",
        trigger: ".outro",
        start: "top top",
        end: "+=500%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,

    onUpdate: (self: any) => {
  const p = self.progress;

  // rotation (unchanged)
  if (p < 0.6) {
    heart.rotation.y = Math.PI * 12 * p;
  } else {
    heart.rotation.y = 0;
  }

  // 🔥 SMOOTH ZOOM-IN
  const zoomStart = 0.45;
  const zoomEnd = 0.75;

  if (p > zoomStart) {
    const t = Math.min((p - zoomStart) / (zoomEnd - zoomStart), 1);
   const scale = gsap.utils.interpolate(1, maxScale, t);

    heart.scale.set(scale, scale, scale);
    heart.position.y = -(outroModelSize.y * (scale - 1)) / 2;
  }

  controller.renderOnce();
},



        onEnter: () => {
          toggleContainers(false);
          resetHeart();
          controller.startContinuous();
        },

        onEnterBack: () => {
          toggleContainers(false);
          resetHeart();
          controller.startContinuous();
        },

        onLeave: () => {
  toggleContainers(true);
  controller.stopContinuous();
},
onLeaveBack: () => {
  toggleContainers(true);
  controller.stopContinuous();
}

      }
    });

    tl.to(".outro-question", { opacity: 1, duration: 0.5 }, 0)
      .fromTo(
        ".outro-question h1 .char > span",
        { y: "100%" },
        { y: "0%", stagger: 0.01, duration: 0.6 },
        0
      )
      .to(
        ".outro-question h1 .char > span",
        { xPercent: -150, stagger: 0.01, duration: 1 },
        0.4
      )
      .to(".outro-question", { opacity: 0, duration: 1 }, 4.5)
      .to(
        heart.scale,
        {
          x: 6.5,
          y: 6.5,
          z: 6.5,
          duration: 2,
          ease: "power2.inOut",
          onUpdate: () => {
            heart.position.y =
              -(outroModelSize.y * (heart.scale.y - 1)) / 2;
          }
        },
        5
      )
      .to(
        heart.scale,
        {
          x: initialScale.x,
          y: initialScale.y,
          z: initialScale.z,
          duration: 1.5
        },
        7
      )
      .to(
        ".outro-final-message",
        {
          opacity: 1,
          duration: 1,
          onComplete: () => {
            document
              .querySelector(".outro-final-message")
              ?.classList.add("active");
            initNoButtonEscape();
          }
        },
        8.5
      );

    function resetHeart(): void {
      gsap.set(heart.scale, initialScale);
      gsap.set(heart.position, { y: initialY });
      gsap.set(heart.rotation, { x: 0, y: 0, z: 0 });
    }

    function toggleContainers(showProduct: boolean): void {
      const product = document.querySelector(".model-container") as HTMLElement;
      const outro = document.querySelector(".outro-model-container") as HTMLElement;

      if (product) {
        product.style.opacity = showProduct ? "1" : "0";
        product.style.visibility = showProduct ? "visible" : "hidden";
      }

      if (outro) {
        outro.style.opacity = showProduct ? "0" : "1";
        outro.style.visibility = showProduct ? "hidden" : "visible";
      }
    }
  }

  // 🔄 Resize safety (RAF-friendly)
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controller.renderOnce();
  });
}


/**
 * Setup Gift Scene
 */
function setupGiftScene(): void {
  // 🛑 Mobile safety (same strategy as Outro)
const isMobileView = isMobile();


  let giftModel: any = null;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

const renderer = new THREE.WebGLRenderer({
  antialias: !isMobileView,
  alpha: true,
  powerPreference: isMobileView ? "low-power" : "high-performance"
});

renderer.setPixelRatio(isMobileView ? 1 : Math.min(window.devicePixelRatio, 2));
const maxGiftScale = isMobileView ? 6.5 : 8.5;


  renderer.setClearColor(0x000000, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const container = document.querySelector(".gift-model-container") as HTMLElement;
  if (container) {
    container.appendChild(renderer.domElement);
    container.style.opacity = "0";
    container.style.visibility = "hidden";
  }

  // 💡 Lighting
  scene.add(new THREE.AmbientLight(0xfce7f3, 1.5));

  const keyLight = new THREE.DirectionalLight(0xf472b6, 2);
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);

  scene.add(new THREE.DirectionalLight(0xec4899, 1.2));
  scene.add(new THREE.DirectionalLight(0xfce7f3, 0.8));

  // 🎮 Renderer controller
  const controller = createRendererController(renderer, scene, camera);

  function setupModel(model: any) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    camera.position.z = (maxDim / Math.tan(fov / 2)) * 1.8;
    camera.lookAt(0, 0, 0);
  }

  // 📦 Load model
  const loader = new GLTFLoader();
  loader.load("/models/gift.glb", (gltf) => {
    giftModel = gltf.scene;

    giftModel.traverse((node: any) => {
      if (node.isMesh && node.material) {
        node.material.metalness = 0.4;
        node.material.roughness = 0.4;
        node.material.needsUpdate = true;
      }
    });

    scene.add(giftModel);
    setupModel(giftModel);
    controller.renderOnce(); // first paint
  });

  // 🎁 YES button interaction
  function setupYesButtonInteraction(): void {
    const yesBtn = document.querySelector(".btn-yes");
    if (!yesBtn) return;

    yesBtn.addEventListener("click", () => {
      if (!giftModel) return;

      ScrollTrigger.getAll().forEach((st: any) => st.kill());

      const outro = document.querySelector(".outro-model-container") as HTMLElement;
      const gift = document.querySelector(".gift-model-container") as HTMLElement;

      if (outro) {
        gsap.to(outro, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => (outro.style.visibility = "hidden")
        });
      }

      if (gift) {
        gift.style.visibility = "visible";
        gsap.to(gift, { opacity: 1, duration: 0.8, ease: "power2.out" });
      }

      const baseScale = 1;
      gsap.set(giftModel.scale, { x: baseScale, y: baseScale, z: baseScale });
      gsap.set(giftModel.rotation, { x: 0, y: 0, z: 0 });

      controller.startContinuous();

      const idleSpin = gsap.to(giftModel.rotation, {
        y: "+=0.5",
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.timeline({
        onStart: () => idleSpin.kill(),
        onUpdate: () => controller.renderOnce(),
        onComplete: () => {
          controller.stopContinuous();
          window.location.href = "/gift";
        }
      })
        .to(giftModel.rotation, { y: Math.PI * 4, duration: 3, ease: "none" })
      .to(
  giftModel.scale,
  {
    x: maxGiftScale,
    y: maxGiftScale,
    z: maxGiftScale,
    duration: 2,
    ease: "power2.inOut"
  },
  "-=1"
);

    });
  }

  setupYesButtonInteraction();

  // 🔄 Resize safety
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controller.renderOnce();
  });
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

  ctx.setTransform(1, 0, 0, 1, 0, 0); // 🔥 REQUIRED
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}


  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize audio context through audioManager
window.addEventListener(
  "touchstart",
  () => audioManager.initAudioContext(),
  { once: true }
);


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


// keep ONLY this one at the very bottom
function createRendererController(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera
) {
  let rafId: number | null = null;

  const renderOnce = () => renderer.render(scene, camera);

  const startContinuous = () => {
    if (rafId !== null) return;
    const loop = () => {
      rafId = requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };
    loop();
  };

  const stopContinuous = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return { renderOnce, startContinuous, stopContinuous };
}

