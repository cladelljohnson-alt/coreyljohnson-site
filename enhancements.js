/**
 * enhancements.js — Corey L. Johnson author site
 * 1. Parallax hero (CSS fixed + JS mobile fallback)
 * 2. Scroll-triggered fade-ins (Intersection Observer)
 * 3. Typewriter hero tagline
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
      // Override CSS fixed to scroll, then drive position via JS
      hero.style.backgroundAttachment = 'scroll';

      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            var scrolled = window.scrollY;
            // Move bg at 30% of scroll speed for subtle parallax
            hero.style.backgroundPositionY = 'calc(center + ' + (scrolled * 0.3) + 'px)';
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
    // On desktop, CSS background-attachment:fixed does the work — no JS needed.
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
   * 3. TYPEWRITER HERO TAGLINE
   * Reads the target text from data-text attribute,
   * types it character by character, then fades in
   * the subtitle and CTA buttons once complete.
   * Total animation completes in < 2 seconds.
   * ───────────────────────────────────────── */
  function initTypewriter() {
    var tagline  = document.getElementById('hero-tagline');
    var subtitle = document.getElementById('hero-subtitle');
    var ctas     = document.getElementById('hero-ctas');

    if (!tagline) return;

    var fullText = tagline.getAttribute('data-text') || 'Stories That Move You.';
    var totalDuration = 1500; // ms — full typing done in 1.5s
    var charDelay = totalDuration / fullText.length;

    // Build cursor element
    var cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    // Match h1 line height for cursor sizing
    cursor.style.height = '0.85em';

    tagline.innerHTML = '';
    tagline.appendChild(cursor);

    var index = 0;

    function typeNext() {
      if (index < fullText.length) {
        // Insert character before the cursor
        var char = document.createTextNode(fullText[index]);
        tagline.insertBefore(char, cursor);
        index++;
        setTimeout(typeNext, charDelay);
      } else {
        // Typing done — remove cursor after a short pause
        setTimeout(function () {
          cursor.style.animation = 'none';
          cursor.style.opacity   = '0';

          // Fade in subtitle
          if (subtitle) {
            subtitle.style.opacity = '1';
          }

          // Fade in CTAs slightly after subtitle
          if (ctas) {
            setTimeout(function () {
              ctas.style.opacity = '1';
            }, 220);
          }
        }, 350);
      }
    }

    // Small initial delay so the page has painted before typing starts
    setTimeout(typeNext, 120);
  }


  /* ─────────────────────────────────────────
   * INIT — run after DOM is ready
   * ───────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initParallax();
      initFadeIns();
      initTypewriter();
    });
  } else {
    // DOMContentLoaded already fired (script loaded with defer or at end of body)
    initParallax();
    initFadeIns();
    initTypewriter();
  }

}());
