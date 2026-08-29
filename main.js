/**
 * Fraca Servcom — shared site scripts
 */
(function (global) {
  "use strict";

  function createIcons() {
    if (global.lucide && typeof global.lucide.createIcons === "function") {
      global.lucide.createIcons();
    }
  }

  function initTheme() {
    var root = document.documentElement;
    var KEY = "fraca-theme";

    function isDark() {
      return root.getAttribute("data-theme") === "dark";
    }

    function setTheme(theme) {
      if (theme === "dark") {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      localStorage.setItem(KEY, theme);
      syncToggles();
      createIcons();
    }

    function toggleTheme() {
      setTheme(isDark() ? "light" : "dark");
    }

    function makeToggle(className) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle" + (className ? " " + className : "");
      btn.addEventListener("click", toggleTheme);
      var icon = document.createElement("i");
      icon.setAttribute("data-lucide", isDark() ? "sun" : "moon");
      icon.className = "w-5 h-5";
      btn.appendChild(icon);
      return btn;
    }

    function syncToggles() {
      document.querySelectorAll(".theme-toggle").forEach(function (btn) {
        btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
        btn.setAttribute("title", isDark() ? "Light mode" : "Dark mode");
        var icon = btn.querySelector("[data-lucide]");
        if (icon) {
          icon.setAttribute("data-lucide", isDark() ? "sun" : "moon");
        }
      });
    }

    var nav = document.querySelector(".site-header nav");
    if (nav && nav.classList.contains("hidden")) {
      var whatsapp = nav.querySelector(".btn-whatsapp");
      var desktopToggle = makeToggle("hidden md:inline-flex");
      if (whatsapp) {
        nav.insertBefore(desktopToggle, whatsapp);
      } else {
        nav.appendChild(desktopToggle);
      }
    }

    var menuToggle = document.getElementById("menu-toggle");
    if (menuToggle) {
      var mobileToggle = makeToggle("md:hidden");
      var actions = menuToggle.parentElement;
      if (actions && !actions.classList.contains("header-actions")) {
        actions.classList.add("header-actions");
      }
      menuToggle.parentNode.insertBefore(mobileToggle, menuToggle);
    }

    syncToggles();
  }

  function initNav() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("hidden") === false;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year], #current-year").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = anchor.getAttribute("href");
        if (!targetId || targetId === "#") return;
        var target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
        var mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.add("hidden");
        }
      });
    });
  }

  function initReveal() {
    var reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    if (!("IntersectionObserver" in global)) {
      reveals.forEach(function (el) {
        el.classList.add("show");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  function ensureLightbox() {
    var lb = document.getElementById("lightbox");
    if (lb) return lb;

    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.className = "lightbox";
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Image preview");
    lb.innerHTML =
      '<button type="button" class="lightbox__close" id="lightbox-close" title="Close (Esc)" aria-label="Close">' +
      '<i data-lucide="x" class="w-8 h-8"></i></button>' +
      '<img id="lightbox-img" class="lightbox__img" alt="Preview">' +
      '<p id="lightbox-caption" class="lightbox__caption"></p>';
    document.body.appendChild(lb);
    createIcons();
    return lb;
  }

  function initLightbox() {
    var lb = ensureLightbox();
    var lbImg = document.getElementById("lightbox-img");
    var lbCaption = document.getElementById("lightbox-caption");
    var lbClose = document.getElementById("lightbox-close");

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lbImg) lbImg.src = "";
      if (lbCaption) lbCaption.textContent = "";
    }

    function open(src, caption) {
      if (!lbImg) return;
      lbImg.src = src;
      lbImg.alt = caption || "Product preview";
      if (lbCaption) lbCaption.textContent = caption || "";
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }

    if (lbClose) lbClose.addEventListener("click", close);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    global.FracaLightbox = { open: open, close: close };
    return global.FracaLightbox;
  }

  /**
   * @param {string|HTMLElement} container
   * @param {Array<{src:string,title?:string,desc?:string}|string>} items
   * @param {{emptySelector?:string, categoryLabel?:string}} [options]
   */
  function initGallery(container, items, options) {
    options = options || {};
    var el =
      typeof container === "string" ? document.querySelector(container) : container;
    if (!el) return;

    var list = (items || []).map(function (item) {
      if (typeof item === "string") {
        return { src: item, title: "", desc: "" };
      }
      return item;
    });

    var emptySel = options.emptySelector;
    var emptyEl = emptySel ? document.querySelector(emptySel) : null;

    if (!list.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    if (!global.FracaLightbox) initLightbox();

    list.forEach(function (item, index) {
      var label = options.categoryLabel || "Product";
      var title = item.title || label + " " + (index + 1);
      var desc = (item.desc || "").trim();
      var hasDesc = desc.length > 0;
      var alt = hasDesc ? title : label + " " + (index + 1);
      var card = document.createElement("div");
      card.className = "product-card reveal" + (hasDesc ? "" : " product-card--image-only");
      card.innerHTML =
        '<div class="product-card__media">' +
        '<img src="' +
        item.src.replace(/"/g, "&quot;") +
        '" alt="' +
        alt.replace(/"/g, "&quot;") +
        '" loading="lazy" class="product-image">' +
        "</div>" +
        (hasDesc
          ? '<div class="product-card__body"><h3>' +
            title.replace(/</g, "&lt;") +
            "</h3><p>" +
            desc.replace(/</g, "&lt;") +
            "</p></div>"
          : "");

      var img = card.querySelector("img");
      img.addEventListener("click", function () {
        global.FracaLightbox.open(item.src, hasDesc ? title + " — " + desc : "");
      });
      el.appendChild(card);
    });

    createIcons();
    initReveal();
  }

  /**
   * Multi-section galleries: { sectionId: items[] }
   */
  function initGalleries(map, options) {
    Object.keys(map || {}).forEach(function (id) {
      initGallery("#" + id, map[id], options);
    });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var action = form.getAttribute("action") || "";
      if (action.indexOf("YOUR_FORM_ID") !== -1 || action.indexOf("YOUR_ID") !== -1) {
        if (status) {
          status.className = "form-status is-error";
          status.textContent =
            "Form is not configured yet. Please email fracaservcomltd@yahoo.com or WhatsApp us, or replace YOUR_FORM_ID in the form action with your Formspree ID.";
        }
        return;
      }

      var data = new FormData(form);
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (status) {
              status.className = "form-status is-success";
              status.textContent = "Thank you — your message has been sent.";
            }
          } else {
            throw new Error("Submit failed");
          }
        })
        .catch(function () {
          if (status) {
            status.className = "form-status is-error";
            status.textContent =
              "Something went wrong. Please try WhatsApp or email us directly.";
          }
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function init() {
    initTheme();
    createIcons();
    initNav();
    initYear();
    initSmoothScroll();
    initLightbox();
    initReveal();
    initContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.FracaGallery = {
    init: initGallery,
    initMany: initGalleries,
  };
})(typeof window !== "undefined" ? window : this);
