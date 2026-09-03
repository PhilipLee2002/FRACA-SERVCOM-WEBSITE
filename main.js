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

  function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function productTypeName(categoryLabel) {
    var label = String(categoryLabel || "Product").trim();
    var key = label.toLowerCase();
    var named = {
      "executive office desks": "Desk",
      "pedestal desks": "Pedestal Desk",
      "reception desks": "Reception Desk",
      "student desks": "Student Desk",
      "coffee tables": "Coffee Table",
      "conference tables": "Conference Table",
      "dining sets": "Dining Set",
      "dressing mirrors": "Mirror",
      "church furniture": "Church Furniture",
      "utility chairs": "Chair",
      "office chairs": "Office Chair",
      "conference chairs": "Conference Chair",
      "visitors & boardroom chairs": "Chair",
      "link chairs": "Link Chair",
      "catalina chairs": "Catalina Chair",
      "church & assembly chairs": "Chair",
      "senior executive high back chairs": "Chair",
      "orthopedic high back chairs": "Chair",
      "mid back chairs": "Chair",
      "low back chairs": "Chair",
      "restaurant seats": "Seat",
      "rocking chairs": "Rocking Chair",
      "wardrobes": "Wardrobe",
      "sofa sets": "Sofa",
      "workstations": "Workstation",
      "filing cabinets": "Cabinet",
      "entertainment units": "Entertainment Unit",
      "library & supermarket shelves": "Shelf",
      "storage safes": "Safe",
      "coat hangers": "Coat Hanger",
      "shoe racks": "Shoe Rack",
      "beds": "Bed",
      "benches": "Bench",
    };
    if (named[key]) return named[key];

    var last = (label.split(/[&/]| and /i).pop() || label).trim().split(/\s+/).pop() || "Item";
    if (/ies$/i.test(last)) return last.replace(/ies$/i, "y");
    if (/s$/i.test(last) && !/ss$/i.test(last)) return last.replace(/s$/i, "");
    return last;
  }

  function numberedProductName(typeName, number) {
    return typeName + " " + String(number || 1);
  }

  function humanizeProductTitle(_raw, categoryLabel, index) {
    return numberedProductName(productTypeName(categoryLabel), index + 1);
  }

  var WA_GLYPH =
    '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.219-1.11a7.9 7.9 0 0 0 3.78.96h.003c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 2.729 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.486-1.353-.564-.182-.078-.315-.117-.445.117-.133.233-.513.564-.627.678-.115.114-.232.127-.43.042-.197-.084-.836-.308-1.592-.985-.59-.525-.987-1.176-1.103-1.377-.117-.198-.012-.305.088-.403.091-.091.197-.232.296-.346.1-.114.132-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.61-1.47-.16-.389-.323-.335-.445-.34-.112-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.693.677-.693 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.127.418.475.152.904.13 1.245.08.38-.058 1.171-.48 1.338-.941.164-.46.164-.855.114-.941-.049-.084-.182-.133-.38-.232"/></svg>';

  function inquireUrl(title, categoryLabel) {
    var message =
      "Hello Fraca Servcom, I am interested in " +
      title +
      " (" +
      (categoryLabel || "your furniture") +
      "). Please share availability and pricing.";
    return "https://wa.me/254725151495?text=" + encodeURIComponent(message);
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

    function makeToggle() {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "theme-toggle";
      btn.addEventListener("click", toggleTheme);
      var icon = document.createElement("i");
      icon.setAttribute("data-lucide", isDark() ? "sun" : "moon");
      icon.setAttribute("stroke-width", "2.25");
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
          icon.setAttribute("stroke-width", "2.25");
        }
      });
    }

    var actions = document.querySelector(".site-header .header-actions");
    if (actions && !actions.querySelector(".theme-toggle")) {
      actions.insertBefore(makeToggle(), actions.firstChild);
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

    function encodeImagePath(path) {
      return String(path || "")
        .split("/")
        .map(function (segment) {
          return encodeURIComponent(segment);
        })
        .join("/");
    }

    list.forEach(function (item, index) {
      var label = options.categoryLabel || "Product";
      var title = humanizeProductTitle(item.title, label, index);
      var desc = (item.desc || "").trim();
      var src = encodeImagePath(item.src);
      var wa = inquireUrl(title, label);
      var card = document.createElement("div");
      card.className = "product-card reveal";
      card.innerHTML =
        '<div class="product-card__media">' +
        '<img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(title) +
        '" loading="lazy" class="product-image">' +
        "</div>" +
        '<div class="product-card__body">' +
        "<h3>" +
        escapeHtml(title) +
        "</h3>" +
        (desc ? "<p>" + escapeHtml(desc) + "</p>" : "") +
        '<a class="product-card__inquire" href="' +
        wa.replace(/"/g, "&quot;") +
        '" target="_blank" rel="noopener noreferrer" aria-label="Inquire about ' +
        escapeHtml(title) +
        ' on WhatsApp">' +
        WA_GLYPH +
        " Inquire</a>" +
        "</div>";

      var img = card.querySelector("img");
      img.addEventListener("click", function () {
        global.FracaLightbox.open(src, desc ? title + " — " + desc : title);
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
