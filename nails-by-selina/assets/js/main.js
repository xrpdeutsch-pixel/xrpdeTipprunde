(() => {
  "use strict";

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    const closeNav = () => {
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Portfolio filter ---------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      galleryItems.forEach((item) => {
        const cats = (item.dataset.category || "").split(" ");
        const show = filter === "all" || cats.includes(filter);
        item.classList.toggle("is-filtered-out", !show);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  const lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  let lastFocusedEl = null;

  function openLightbox(fullSrc, name) {
    if (!lightbox || !lightboxImg) return;
    lastFocusedEl = document.activeElement;
    lightboxImg.src = fullSrc;
    lightboxImg.alt = name || "";
    if (lightboxCaption) lightboxCaption.textContent = name || "";
    lightbox.classList.add("is-open");
    document.body.classList.add("nav-open");
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  document.querySelectorAll(".gallery-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".gallery-item");
      const fullSrc = item?.dataset.full;
      const name = item?.dataset.name;
      openLightbox(fullSrc, name);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  /* ---------- Contact form ---------- */
  const form = document.querySelector(".contact-form");
  const formStatus = document.querySelector(".form-status");

  if (form && formStatus) {
    form.addEventListener("submit", () => {
      formStatus.textContent =
        "Danke für deine Nachricht! Dein E-Mail-Programm sollte sich gleich öffnen – falls nicht, schreib mir gerne direkt auf TikTok.";
      formStatus.classList.add("is-visible");
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
