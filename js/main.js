/**
 * الرواق للسفر — main.js
 * Handles: page loader, navbar scroll, mobile menu, hero slider, scroll animations, counter animation
 */

/* ─── PAGE LOADER ─── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('hidden'), 600);
});

/* ─── NAVBAR: scroll effect + mobile toggle ─── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');
const backdrop  = document.getElementById('nav-backdrop');

// Add scrolled class when page is scrolled (except pages where it's already scrolled)
if (navbar && !navbar.classList.contains('scrolled')) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// Mobile menu open/close
function openMenu()  {
  navLinks.classList.add('open');
  backdrop.classList.add('open');
  navToggle.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  navLinks.classList.remove('open');
  backdrop.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle)  navToggle.addEventListener('click', () =>
  navLinks.classList.contains('open') ? closeMenu() : openMenu()
);
if (backdrop)   backdrop.addEventListener('click', closeMenu);

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link =>
  link.addEventListener('click', closeMenu)
);

// Keyboard: Escape closes menu
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

/* ─── HERO SLIDER ─── */
(function initSlider() {
  const slider = document.getElementById('hero-slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dots   = slider.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  let current  = 0;
  let interval = null;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startAuto() { interval = setInterval(next, 5500); }
  function stopAuto()  { clearInterval(interval); }

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      stopAuto();
      goTo(Number(dot.dataset.slide));
      startAuto();
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  slider.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      diff > 0 ? goTo(current + 1) : goTo(current - 1);
      startAuto();
    }
  }, { passive: true });

  startAuto();
})();

/* ─── SCROLL ANIMATIONS (Intersection Observer) ─── */
(function initScrollAnimations() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          // Optionally unobserve for performance
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ─── COUNTER ANIMATION ─── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1800;
        const step   = target / (duration / 16);
        let current  = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target.toLocaleString('ar');
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current).toLocaleString('ar');
          }
        }, 16);

        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();

/* ─── SMOOTH SCROLL for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
