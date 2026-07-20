/**
 * NATASHA PARRA — NUTRITIONIST WEBSITE
 * main.js
 *
 * 1. Mobile nav toggle
 * 2. Sticky header (scroll sentinel)
 * 3. FAQ accordion
 * 4. Scroll-reveal animation
 * 5. Mobile nav: close on anchor link click
 * 6. Testimonials carousel
 * 7. Footer year
 */

'use strict';

// ============================================================
// UTILITY: Respect prefers-reduced-motion
// ============================================================
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// ============================================================
// 1. MOBILE NAV TOGGLE
// ============================================================
(function initMobileNav() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (!hamburger || !mobileNav) return;

  // Track the element that opened the nav so we can restore focus
  let lastFocusedElement = null;

  // All focusable elements inside the mobile nav (for focus trap)
  function getFocusableElements() {
    return Array.from(
      mobileNav.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function openNav() {
    lastFocusedElement = document.activeElement;
    document.body.classList.add('nav-open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    mobileNav.hidden = false;

    // Move focus into the nav
    const focusable = getFocusableElements();
    if (focusable.length) focusable[0].focus();
  }

  function closeNav() {
    document.body.classList.remove('nav-open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    mobileNav.hidden = true;

    // Restore focus to the element that triggered the nav
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  hamburger.addEventListener('click', function () {
    const isOpen = document.body.classList.contains('nav-open');
    isOpen ? closeNav() : openNav();
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      closeNav();
    }
  });

  // Focus trap inside mobile nav
  mobileNav.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if at first, loop to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab: if at last, loop to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Close nav when any mobile nav anchor link is clicked
  const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      closeNav();
    });
  });
})();

// ============================================================
// 2. STICKY HEADER — scroll detection via IntersectionObserver
// ============================================================
(function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const sentinel = document.getElementById('scroll-sentinel');

  if (!header || !sentinel) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        // When sentinel is NOT visible, user has scrolled past it
        if (!entry.isIntersecting) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      });
    },
    { threshold: 0 }
  );

  observer.observe(sentinel);
})();

// ============================================================
// 3. FAQ ACCORDION
// ============================================================
(function initFAQ() {
  const faqButtons = document.querySelectorAll('.faq-btn');

  faqButtons.forEach(function (btn) {
    const answerId = btn.getAttribute('aria-controls');
    const answer = document.getElementById(answerId);

    if (!answer) return;

    // Initialize: ensure hidden state is properly set for CSS transitions
    answer.hidden = true;
    answer.classList.remove('is-open');

    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        // Close this item
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.remove('is-open');

        // Wait for transition, then re-hide for accessibility
        answer.addEventListener(
          'transitionend',
          function handler() {
            if (!answer.classList.contains('is-open')) {
              answer.hidden = true;
            }
            answer.removeEventListener('transitionend', handler);
          }
        );
      } else {
        // Close any other open items first
        faqButtons.forEach(function (otherBtn) {
          if (otherBtn !== btn) {
            const otherId = otherBtn.getAttribute('aria-controls');
            const otherAnswer = document.getElementById(otherId);
            if (otherAnswer && otherBtn.getAttribute('aria-expanded') === 'true') {
              otherBtn.setAttribute('aria-expanded', 'false');
              otherAnswer.classList.remove('is-open');
              // Delay hiding to allow transition
              setTimeout(function () {
                if (!otherAnswer.classList.contains('is-open')) {
                  otherAnswer.hidden = true;
                }
              }, 400);
            }
          }
        });

        // Open this item
        btn.setAttribute('aria-expanded', 'true');
        answer.hidden = false;

        // Trigger reflow so the transition fires
        answer.getBoundingClientRect();
        answer.classList.add('is-open');
      }
    });
  });
})();

// ============================================================
// 4. SCROLL REVEAL
// ============================================================
(function initScrollReveal() {
  // If reduced motion is preferred, mark all elements as visible immediately
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    // Fallback: show all immediately
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing once revealed
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px'
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });
})();

// ============================================================
// 5. STAGGERED REVEAL for method cards and testimonials
//    (slight delay between sibling [data-reveal] elements)
// ============================================================
(function initStaggeredReveal() {
  if (prefersReducedMotion) return;

  // Apply stagger delay to method cards
  const methodCards = document.querySelectorAll('.method-card[data-reveal]');
  methodCards.forEach(function (card, index) {
    card.style.transitionDelay = (index * 0.1) + 's';
  });
})();

// ============================================================
// 6. TESTIMONIALS CAROUSEL
// ============================================================
(function initCarousel() {
  const carousel = document.querySelector('.testimonials-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const trackWrap = carousel.querySelector('.carousel-track-wrap');
  const dotsContainer = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-btn--prev');
  const nextBtn = carousel.querySelector('.carousel-btn--next');
  const liveRegion = carousel.querySelector('.carousel-live');
  const cards = Array.from(track.querySelectorAll('.testimonial-card'));

  if (!cards.length) return;

  let current = 0;
  let autoTimer = null;
  const AUTO_DELAY = 5000;

  // Build dots dynamically from card count
  cards.forEach(function (_, i) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Testimonial ' + (i + 1));
    dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', function () { goTo(i); restartAuto(); });
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));

  function goTo(index) {
    current = (index + cards.length) % cards.length;

    if (prefersReducedMotion) {
      track.style.transition = 'none';
    }
    track.style.transform = 'translateX(-' + current * 100 + '%)';

    dots.forEach(function (dot, i) {
      dot.setAttribute('aria-current', i === current ? 'true' : 'false');
    });

    const author = cards[current].querySelector('cite');
    if (liveRegion && author) {
      liveRegion.textContent = 'Showing testimonial from ' + author.textContent;
    }
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

  carousel.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goTo(current - 1); restartAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); restartAuto(); }
  });

  function startAuto() {
    if (prefersReducedMotion) return;
    stopAuto();
    autoTimer = setInterval(function () { goTo(current + 1); }, AUTO_DELAY);
  }

  function stopAuto() {
    clearInterval(autoTimer);
  }

  function restartAuto() {
    stopAuto();
    startAuto();
  }

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);

  // Swipe / drag support
  let startX = 0;
  let isDragging = false;

  trackWrap.addEventListener('pointerdown', function (e) {
    startX = e.clientX;
    isDragging = true;
    trackWrap.setPointerCapture(e.pointerId);
  });

  trackWrap.addEventListener('pointerup', function (e) {
    if (!isDragging) return;
    isDragging = false;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goTo(current + 1) : goTo(current - 1);
      restartAuto();
    }
  });

  trackWrap.addEventListener('pointercancel', function () { isDragging = false; });

  startAuto();
})();

// ============================================================
// 7. FOOTER YEAR
// ============================================================
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
})();
