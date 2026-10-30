/**
 * enhancements.js — Corey L. Johnson author site
 * 1. Parallax hero (CSS fixed on desktop)
 * 2. Scroll-triggered fade-ins (Intersection Observer)
 * No external libraries. Vanilla JS only.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
   * 1. PARALLAX HERO
   * CSS handles desktop via background-attachment:fixed.
   * JS detects iOS (where fixed attachment is broken) and
   * applies a scroll-based backgroundPositionY instead.
   * ───────────────────────────────────────── */
  function initParallax() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var isMobile = window.innerWidth <= 768;

    if (isIOS || isMobile) {
      // Fixed backgrounds are unreliable on phones, and a scroll-driven
      // background position fights the hero image loading. Leave it static.
      hero.style.backgroundAttachment = 'scroll';
      return;
    }
  }


  /* ─────────────────────────────────────────
   * 2. SCROLL-TRIGGERED FADE-INS
   * Elements with class="fade-in" start invisible
   * and animate in when they enter the viewport.
   * Falls back to instant-show on browsers without
   * IntersectionObserver support.
   * ───────────────────────────────────────── */
  function initFadeIns() {
    var elements = document.querySelectorAll('.fade-in');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: immediately show all fade-in elements
      elements.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px' // trigger as soon as element is barely on screen
    });

    elements.forEach(function (el) { observer.observe(el); });
  }


  /* ─────────────────────────────────────────
   * INIT — run after DOM is ready
   * ───────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initParallax();
      initFadeIns();
    });
  } else {
    initParallax();
    initFadeIns();
  }

}());
