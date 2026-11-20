/**
 * enhancements.js — Corey L. Johnson author site
 * Scroll-triggered fade-ins (Intersection Observer)
 * No external libraries. Vanilla JS only.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
   * SCROLL-TRIGGERED FADE-INS
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
      initFadeIns();
    });
  } else {
    initFadeIns();
  }

}());
