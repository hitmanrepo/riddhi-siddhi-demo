/* Riddhi Siddhi — vanilla JS: mobile nav, sticky header shadow,
   reveal-on-scroll, smooth anchor scroll with header offset, nav highlight. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  /* ---- Mobile nav toggle ---- */
  if (navToggle && header) {
    navToggle.addEventListener("click", function () {
      var isOpen = header.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    if (mobilePanel) {
      mobilePanel.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          header.classList.remove("nav-open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  /* ---- Sticky header shadow on scroll ---- */
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Smooth anchor scrolling with header offset ---- */
  var headerOffset = function () {
    return header ? header.getBoundingClientRect().height + 16 : 16;
  };

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var hash = link.getAttribute("href");
    if (!hash || hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target) return;
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.pushState(null, "", hash);
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- Current-section nav highlight ---- */
  var navLinks = document.querySelectorAll(".main-nav a[href^='#'], .mobile-panel a[href^='#']");
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute("href");
    var sec = id && id.length > 1 ? document.querySelector(id) : null;
    if (sec) sections.push({ id: id, el: sec });
  });

  if (sections.length && "IntersectionObserver" in window) {
    var setActive = function (id) {
      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === id) {
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        } else {
          link.classList.remove("is-active");
          link.removeAttribute("aria-current");
        }
      });
    };

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var match = sections.find(function (s) { return s.el === entry.target; });
            if (match) setActive(match.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (s) { sectionObserver.observe(s.el); });
  }
})();
