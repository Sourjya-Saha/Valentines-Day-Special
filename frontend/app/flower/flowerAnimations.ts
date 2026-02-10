"use client";

/**
 * Initialize flower gallery animations
 * @returns Cleanup function to clear intervals and event listeners
 */
export function initFlowerAnimations(totalSlides: number): () => void {
  let currentSlide = 0;
const slides = document.querySelectorAll<HTMLElement>('.photo-slide');


function showSlide(n: number): void {
  if (slides.length === 0) return;

  slides.forEach(slide => {
    slide.classList.remove('active', 'prev');
  });

  if (n >= slides.length) currentSlide = 0;
  if (n < 0) currentSlide = slides.length - 1;

  const prevIndex =
    currentSlide - 1 < 0 ? slides.length - 1 : currentSlide - 1;

  const prevSlide = slides[prevIndex];
  const activeSlide = slides[currentSlide];

  if (prevSlide) prevSlide.classList.add('prev');
  if (activeSlide) activeSlide.classList.add('active');
}


  function changeSlide(direction: number): void {
    currentSlide += direction;
    showSlide(currentSlide);
  }

  // Listen for custom events from arrows
  const handleChangeSlide = (e: Event) => {
    const customEvent = e as CustomEvent;
    changeSlide(customEvent.detail);
  };

  window.addEventListener('changeSlide', handleChangeSlide);

  // Auto-advance slides every 3.5 seconds
  const autoAdvance = setInterval(() => {
    changeSlide(1);
  }, 3500);

  // Touch/Swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  const gallery = document.querySelector('.gallery-container');

  function handleSwipe(): void {
    if (touchEndX < touchStartX - 50) {
      changeSlide(1); // Swipe left
    }
    if (touchEndX > touchStartX + 50) {
      changeSlide(-1); // Swipe right
    }
  }

  const handleTouchStart = (e: Event) => {
    const touch = e as TouchEvent;
    touchStartX = touch.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: Event) => {
    const touch = e as TouchEvent;
    touchEndX = touch.changedTouches[0].screenX;
    handleSwipe();
  };

  if (gallery) {
    gallery.addEventListener('touchstart', handleTouchStart);
    gallery.addEventListener('touchend', handleTouchEnd);
  }

  // Cleanup function
  return () => {
    clearInterval(autoAdvance);
    window.removeEventListener('changeSlide', handleChangeSlide);
    if (gallery) {
      gallery.removeEventListener('touchstart', handleTouchStart);
      gallery.removeEventListener('touchend', handleTouchEnd);
    }
  };
}