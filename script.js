/* ==========================================================================
   Don.dev — Interactions
   1. Setup & helpers
   2. Navbar: blur on scroll + mobile menu
   3. Active nav link on scroll
   4. Scroll reveal
   5. Hero typing effect
   6. Contact form validation
   7. Back-to-top button
   8. Footer year
   ========================================================================== */

/* 1. Setup & helpers
   ========================================================================== */

// Lets CSS know JS is available (scroll-reveal hides content only when this is set)
document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileMenu();
  initActiveNav();
  initReveal();
  initTyping();
  initContactForm();
  initBackToTop();
  initYear();
});

/* 2. Navbar: blur on scroll + mobile menu
   ========================================================================== */
function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const update = () => header.classList.toggle("header--scrolled", window.scrollY > 10);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function initMobileMenu() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const menu = document.querySelector("[data-nav-menu]");
  if (!toggle || !menu) return;

  const label = toggle.querySelector(".visually-hidden");
  const desktopQuery = window.matchMedia("(min-width: 60em)");

  const setOpen = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.classList.toggle("nav__menu--open", isOpen);
    document.body.classList.toggle("is-menu-open", isOpen);
    if (label) label.textContent = isOpen ? "Close menu" : "Open menu";
  };

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  toggle.addEventListener("click", () => setOpen(!isOpen()));

  // Close when any link inside the menu is clicked
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  // Close on Escape and return focus to the toggle
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset state when resizing up to desktop
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
}

/* 3. Active nav link on scroll
   ========================================================================== */
function initActiveNav() {
  const links = [...document.querySelectorAll(".nav__link")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("nav__link--active", active);
      if (active) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  // A section counts as "current" when it crosses a band near the top of the viewport
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));

  // Clear highlight when back at the hero
  const hero = document.querySelector(".hero");
  if (hero) {
    new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setActive(null);
      },
      { rootMargin: "-40% 0px -55% 0px" }
    ).observe(hero);
  }
}

/* 4. Scroll reveal
   ========================================================================== */
function initReveal() {
  const items = document.querySelectorAll(".reveal");

  // No observer support or reduced motion: show everything immediately
  if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target); // animate once
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((item) => observer.observe(item));
}

/* 5. Hero typing effect
   Words come from the data-typing attribute in index.html.
   ========================================================================== */
function initTyping() {
  const el = document.querySelector("[data-typing]");
  if (!el) return;

  let words;
  try {
    words = JSON.parse(el.dataset.typing);
  } catch {
    return;
  }
  if (!Array.isArray(words) || !words.length) return;

  // Reduced motion: keep the first word, no animation
  if (prefersReducedMotion.matches) {
    el.textContent = words[0];
    return;
  }

  const TYPE_SPEED = 85; // ms per character while typing
  const DELETE_SPEED = 45; // ms per character while deleting
  const HOLD_TIME = 1800; // ms to show a full word
  const GAP_TIME = 400; // ms before typing the next word

  let wordIndex = 0;
  let charIndex = words[0].length; // start with the first word already shown
  let deleting = true;

  const tick = () => {
    const word = words[wordIndex];
    charIndex += deleting ? -1 : 1;
    el.textContent = word.slice(0, charIndex);

    let delay = deleting ? DELETE_SPEED : TYPE_SPEED;

    if (!deleting && charIndex === word.length) {
      deleting = true;
      delay = HOLD_TIME;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      delay = GAP_TIME;
    }

    setTimeout(tick, delay);
  };

  setTimeout(tick, HOLD_TIME);
}

/* 6. Contact form validation
   No backend: on success the form is reset and a message is shown.
   To connect a real service (Formspree, Netlify Forms, etc.) send the
   data where the "PLACEHOLDER" comment is below.
   ========================================================================== */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const success = form.querySelector("[data-form-success]");
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // Each rule returns an error message, or "" when the value is valid
  const rules = {
    name: (value) => {
      if (!value) return "Please enter your name.";
      if (value.length < 2) return "Name should be at least 2 characters.";
      return "";
    },
    email: (value) => {
      if (!value) return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email, e.g. name@example.com.";
      return "";
    },
    message: (value) => {
      if (!value) return "Please write a short message.";
      if (value.length < 10) return "Message should be at least 10 characters.";
      return "";
    },
  };

  const validateField = (field) => {
    const rule = rules[field.name];
    if (!rule) return true;

    const message = rule(field.value.trim());
    const errorEl = document.getElementById(`${field.id}-error`);

    field.setAttribute("aria-invalid", String(Boolean(message)));
    if (errorEl) errorEl.textContent = message;
    return !message;
  };

  const fields = [...form.elements].filter((el) => el.name in rules);

  fields.forEach((field) => {
    // Validate when leaving a field, then live once it has been flagged
    field.addEventListener("blur", () => {
      if (field.value.trim()) validateField(field);
    });
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
      if (success) success.hidden = true;
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = fields.map(validateField);
    const firstInvalid = fields[results.indexOf(false)];

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // PLACEHOLDER: send the data to your backend / form service here, e.g.
    // fetch("https://formspree.io/f/your-id", { method: "POST", body: new FormData(form) });

    form.reset();
    fields.forEach((field) => field.removeAttribute("aria-invalid"));
    if (success) success.hidden = false;
  });
}

/* 7. Back-to-top button
   ========================================================================== */
function initBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) return;

  const update = () => button.classList.toggle("back-to-top--visible", window.scrollY > 600);
  update();
  window.addEventListener("scroll", update, { passive: true });

  // Move focus to the page top for keyboard users (the link itself scrolls)
  button.addEventListener("click", () => {
    const logo = document.querySelector(".nav__logo");
    if (logo) logo.focus({ preventScroll: true });
  });
}

/* 8. Footer year
   ========================================================================== */
function initYear() {
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
}
