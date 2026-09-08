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
      "church chairs": "Chair",
      "church pews": "Pew",
      "pulpits & lecterns": "Pulpit",
      "office chairs": "Office Chair",
      "conference chairs": "Conference Chair",
      "visitors & boardroom chairs": "Chair",
      "link chairs": "Link Chair",
      "catalina chairs": "Catalina Chair",
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

  function humanizeProductTitle(raw, categoryLabel, index) {
    var custom = String(raw || "").trim();
    // Prefer real model names; ignore leftover filename-style titles (b1, lb002-01, Chair 9).
    if (
      custom &&
      (/\s/.test(custom) || /^FOS\b/i.test(custom)) &&
      !/^(Chair|Pew|Pulpit|Bag|Desk|Table)\s+\d+$/i.test(custom)
    ) {
      return custom;
    }
    return numberedProductName(productTypeName(categoryLabel), index + 1);
  }

  function contactFormUrl() {
    var path = String((global.location && location.pathname) || "/");
    var isHome =
      /(?:^|\/)(?:index\.html)?$/i.test(path.replace(/\/+$/, "") + "/") ||
      path === "/" ||
      /(?:^|\/)index\.html$/i.test(path);
    return isHome ? "#contact" : "index.html#contact";
  }

  function encodeImagePath(path) {
    return String(path || "")
      .split("/")
      .map(function (segment) {
        return encodeURIComponent(segment);
      })
      .join("/");
  }

  function normalizeVariants(item) {
    var variants = Array.isArray(item.variants) ? item.variants.slice() : [];
    if (!variants.length && item.src) {
      variants.push({ src: item.src, color: "" });
    }
    return variants
      .filter(function (v) {
        return v && v.src;
      })
      .map(function (v) {
        return {
          src: encodeImagePath(v.src),
          color: String(v.color || "").trim(),
        };
      });
  }

  function swatchButtonsHtml(variants, activeIndex) {
    if (variants.length < 2) return "";
    return (
      '<div class="product-swatches" role="list">' +
      variants
        .map(function (v, i) {
          var label = v.color || "View " + (i + 1);
          return (
            '<button type="button" class="product-swatch' +
            (i === activeIndex ? " is-active" : "") +
            '" role="listitem" data-variant-index="' +
            i +
            '" aria-label="' +
            escapeHtml(label) +
            '" title="' +
            escapeHtml(label) +
            '">' +
            '<span class="product-swatch__label">' +
            escapeHtml(label) +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  var SITE_ORIGIN = "https://fracaservcom.co.ke";

  function slugifyId(value) {
    var slug = String(value || "item")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return slug || "item";
  }

  function uniqueProductId(title, container) {
    var base = slugifyId(title);
    if (!document.getElementById(base)) return base;
    var prefix = container && container.id ? slugifyId(container.id) : "item";
    var next = prefix + "-" + base;
    var n = 2;
    while (document.getElementById(next)) {
      next = prefix + "-" + base + "-" + n;
      n += 1;
    }
    return next;
  }

  function currentProductPagePath() {
    var path = String((global.location && location.pathname) || "/");
    path = path.replace(/index\.html$/i, "").replace(/\.html$/i, "");
    if (!path || path.charAt(0) !== "/") path = "/" + path;
    if (path.length > 1 && path.slice(-1) === "/") path = path.slice(0, -1);
    return path || "/";
  }

  function productShareUrl(anchorId) {
    return SITE_ORIGIN + currentProductPagePath() + "#" + anchorId;
  }

  function scrollToProductHash() {
    var raw = String((global.location && location.hash) || "").replace(/^#/, "");
    if (!raw) return false;
    var id = decodeURIComponent(raw);
    var target = document.getElementById(id);
    if (!target) return false;
    document.querySelectorAll(".product-card.is-anchored").forEach(function (card) {
      if (card !== target) card.classList.remove("is-anchored");
    });
    target.classList.add("show", "is-anchored");
    target.scrollIntoView({ block: "start" });
    return true;
  }

  function scheduleProductHashScroll() {
    if (scrollToProductHash()) return;
    requestAnimationFrame(function () {
      if (scrollToProductHash()) return;
      setTimeout(scrollToProductHash, 60);
    });
  }

  var WA_GLYPH =
    '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.219-1.11a7.9 7.9 0 0 0 3.78.96h.003c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 2.729 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.486-1.353-.564-.182-.078-.315-.117-.445.117-.133.233-.513.564-.627.678-.115.114-.232.127-.43.042-.197-.084-.836-.308-1.592-.985-.59-.525-.987-1.176-1.103-1.377-.117-.198-.012-.305.088-.403.091-.091.197-.232.296-.346.1-.114.132-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.61-1.47-.16-.389-.323-.335-.445-.34-.112-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.693.677-.693 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.127.418.475.152.904.13 1.245.08.38-.058 1.171-.48 1.338-.941.164-.46.164-.855.114-.941-.049-.084-.182-.133-.38-.232"/></svg>';

  function inquireUrl(title, categoryLabel, productUrl) {
    var message =
      "Hello Fraca Servcom, I am interested in " +
      title +
      " (" +
      (categoryLabel || "your furniture") +
      "). Please share availability and pricing.";
    if (productUrl) message += "\n\n" + productUrl;
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

  var FRACA_CATEGORY_GROUPS = [
    {
      group: "Desks & Workstations",
      items: [
        { name: "Executive Office Desks", href: "Executive-tables.html", keywords: "executive desk office table" },
        { name: "Pedestal Desks", href: "Pedestal-desks.html", keywords: "pedestal desk" },
        { name: "Reception Desks", href: "Reception-desks.html", keywords: "reception desk" },
        { name: "Conference Tables", href: "Conference-tables.html", keywords: "conference table boardroom" },
        { name: "Workstations", href: "Workstations.html", keywords: "workstation cubicle" },
        { name: "Student Desks", href: "Student-desks.html", keywords: "student desk school" },
      ],
    },
    {
      group: "Home Furniture",
      items: [
        { name: "Beds", href: "Beds.html", keywords: "bed bedroom" },
        { name: "Dining Sets", href: "Dining-sets.html", keywords: "dining table chairs set" },
        { name: "Coffee Tables", href: "Coffee-tables.html", keywords: "coffee table living" },
        { name: "Sofa Sets", href: "Sofa-sets.html", keywords: "sofa couch lounge" },
        { name: "Entertainment Units", href: "Entertainment-units.html", keywords: "tv entertainment unit" },
        { name: "Dressing Mirrors", href: "Dressing-mirrors.html", keywords: "mirror dressing" },
      ],
    },
    {
      group: "Storage",
      items: [
        { name: "Filing Cabinets", href: "Filing-cabinets.html", keywords: "filing cabinet" },
        { name: "Wardrobes", href: "Wardrobes.html", keywords: "wardrobe closet" },
        { name: "Library & Supermarket Shelves", href: "Library-shelves.html", keywords: "shelf library supermarket" },
        { name: "Storage Safes", href: "Storage-safes.html", keywords: "safe storage" },
        { name: "Shoe Racks", href: "Shoe-racks.html", keywords: "shoe rack" },
        { name: "Coat Hangers", href: "Coat-hangers.html", keywords: "coat hanger stand" },
      ],
    },
    {
      group: "Seating",
      items: [
        { name: "Executive Chairs", href: "Executive-chairs.html", keywords: "executive chair" },
        { name: "Office Chairs", href: "Office-chairs.html", keywords: "office chair" },
        { name: "Conference Chairs", href: "Conference-chairs.html", keywords: "conference banquet chair" },
        { name: "Visitors & Boardroom Chairs", href: "Visitors-boardroom-chairs.html", keywords: "visitor boardroom chair" },
        { name: "Link Chairs", href: "Link-chairs.html", keywords: "link interlocking chair" },
        { name: "Catalina Chairs", href: "Catalina-chairs.html", keywords: "catalina chair" },
        { name: "Rocking Chairs", href: "Rocking-chairs.html", keywords: "rocking chair" },
        { name: "Restaurant Seats", href: "Restaurant-seats.html", keywords: "restaurant seat" },
      ],
    },
    {
      group: "Institutional & Specialty",
      items: [
        { name: "Church Furniture", href: "Church-furniture.html", keywords: "church pew pulpit assembly" },
        { name: "Benches", href: "Benches.html", keywords: "bench" },
      ],
    },
    {
      group: "Bags",
      items: [{ name: "Bags Division", href: "Bags.html", keywords: "bag handbag backpack tote travel" }],
    },
  ];

  function flatCatalogItems() {
    var list = [];
    FRACA_CATEGORY_GROUPS.forEach(function (group) {
      group.items.forEach(function (item) {
        list.push(item);
      });
    });
    return list;
  }

  function findCatalogMatch(query) {
    var q = String(query || "")
      .toLowerCase()
      .trim();
    if (!q) return null;
    var items = flatCatalogItems();
    var exact = items.find(function (item) {
      return item.name.toLowerCase() === q;
    });
    if (exact) return exact;
    return (
      items.find(function (item) {
        var hay = (item.name + " " + (item.keywords || "")).toLowerCase();
        return hay.indexOf(q) !== -1 || q.split(/\s+/).every(function (part) {
          return part && hay.indexOf(part) !== -1;
        });
      }) || null
    );
  }

  function applyProductCardFilter(query) {
    var q = String(query || "")
      .toLowerCase()
      .trim();
    var cards = document.querySelectorAll(".product-card");
    if (!cards.length) return;
    var shown = 0;
    cards.forEach(function (card) {
      if (card.classList.contains("category-card") && !q) {
        card.hidden = false;
        shown += 1;
        return;
      }
      var text = (
        (card.querySelector("h3") && card.querySelector("h3").textContent) ||
        ""
      ).toLowerCase();
      var match = !q || text.indexOf(q) !== -1;
      card.hidden = !match;
      if (match) shown += 1;
    });
    var empty = document.getElementById("search-empty");
    if (empty) empty.hidden = shown > 0 || !q;
  }

  function initSiteSearch() {
    var header = document.querySelector(".site-header");
    if (!header || header.querySelector(".site-tools")) return;

    var tools = document.createElement("div");
    tools.className = "site-tools";
    tools.innerHTML =
      '<div class="container mx-auto px-4 site-tools__inner">' +
      '<div class="browse-menu">' +
      '<button type="button" class="browse-menu__toggle" id="browse-categories-toggle" aria-expanded="false" aria-controls="browse-categories-panel">' +
      '<i data-lucide="menu" class="w-4 h-4" aria-hidden="true"></i>' +
      "<span>Browse categories</span>" +
      '<i data-lucide="chevron-down" class="w-4 h-4 browse-menu__chevron" aria-hidden="true"></i>' +
      "</button>" +
      '<div class="browse-menu__panel" id="browse-categories-panel" hidden></div>' +
      "</div>" +
      '<form class="site-search" id="site-search-form" role="search" action="furniture.html" method="get">' +
      '<label class="sr-only" for="site-search-input">Search products</label>' +
      '<input type="search" id="site-search-input" name="q" placeholder="Search for products…" autocomplete="off">' +
      '<label class="sr-only" for="site-search-category">Category</label>' +
      '<select id="site-search-category" name="category" aria-label="Select category">' +
      '<option value="">All categories</option>' +
      "</select>" +
      '<button type="submit" class="site-search__submit" aria-label="Search">' +
      '<i data-lucide="search" class="w-4 h-4" aria-hidden="true"></i>' +
      "</button>" +
      "</form>" +
      "</div>";

    header.appendChild(tools);

    var panel = tools.querySelector("#browse-categories-panel");
    var select = tools.querySelector("#site-search-category");
    var panelHtml = "";
    FRACA_CATEGORY_GROUPS.forEach(function (group) {
      panelHtml +=
        '<div class="browse-menu__group">' +
        "<h3>" +
        escapeHtml(group.group) +
        "</h3><ul>";
      group.items.forEach(function (item) {
        panelHtml +=
          "<li><a href=\"" +
          escapeHtml(item.href) +
          '">' +
          escapeHtml(item.name) +
          "</a></li>";
        var opt = document.createElement("option");
        opt.value = item.href;
        opt.textContent = item.name;
        select.appendChild(opt);
      });
      panelHtml += "</ul></div>";
    });
    panel.innerHTML = panelHtml;

    var toggle = tools.querySelector("#browse-categories-toggle");
    function closeBrowse() {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      tools.classList.remove("is-browse-open");
    }
    function openBrowse() {
      panel.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      tools.classList.add("is-browse-open");
    }
    toggle.addEventListener("click", function () {
      if (panel.hidden) openBrowse();
      else closeBrowse();
    });
    document.addEventListener("click", function (e) {
      if (!tools.contains(e.target)) closeBrowse();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeBrowse();
    });

    var params = new URLSearchParams(global.location.search || "");
    var initialQ = params.get("q") || "";
    var input = tools.querySelector("#site-search-input");
    if (initialQ) input.value = initialQ;

    var path = String((global.location && location.pathname) || "");
    var currentFile = path.split("/").pop() || "";
    if (!currentFile || currentFile === "") currentFile = "index.html";
    flatCatalogItems().forEach(function (item) {
      if (item.href.toLowerCase() === currentFile.toLowerCase()) {
        select.value = item.href;
      }
    });

    tools.querySelector("#site-search-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      var href = select.value;
      if (href) {
        global.location.href = href + (q ? "?q=" + encodeURIComponent(q) : "");
        return;
      }
      var match = findCatalogMatch(q);
      if (match) {
        global.location.href = match.href + (q ? "?q=" + encodeURIComponent(q) : "");
        return;
      }
      global.location.href = "furniture.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });

    input.addEventListener("input", function () {
      applyProductCardFilter(input.value);
    });

    applyProductCardFilter(initialQ);
    createIcons();
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
    lb.setAttribute("aria-label", "Product details");
    lb.innerHTML =
      '<button type="button" class="lightbox__close" id="lightbox-close" title="Close (Esc)" aria-label="Close">' +
      '<i data-lucide="x" class="w-8 h-8"></i></button>' +
      '<div class="lightbox__panel">' +
      '<div class="lightbox__media">' +
      '<img id="lightbox-img" class="lightbox__img" alt="Product preview">' +
      '<div id="lightbox-swatches" class="product-swatches product-swatches--detail"></div>' +
      "</div>" +
      '<div class="lightbox__info">' +
      '<h3 id="lightbox-title" class="lightbox__title"></h3>' +
      '<p id="lightbox-desc" class="lightbox__desc"></p>' +
      '<div class="lightbox__actions">' +
      '<a id="lightbox-inquire" class="product-card__inquire lightbox__inquire" href="#" target="_blank" rel="noopener noreferrer">' +
      WA_GLYPH +
      " Inquire on WhatsApp</a>" +
      '<a id="lightbox-contact" class="btn btn-outline lightbox__contact" href="#contact">Contact form</a>' +
      "</div>" +
      "</div>" +
      "</div>";
    document.body.appendChild(lb);
    createIcons();
    return lb;
  }

  function initLightbox() {
    var lb = ensureLightbox();
    var lbImg = document.getElementById("lightbox-img");
    var lbTitle = document.getElementById("lightbox-title");
    var lbDesc = document.getElementById("lightbox-desc");
    var lbSwatches = document.getElementById("lightbox-swatches");
    var lbInquire = document.getElementById("lightbox-inquire");
    var lbContact = document.getElementById("lightbox-contact");
    var lbClose = document.getElementById("lightbox-close");
    var activeDetail = null;

    function close() {
      lb.classList.remove("is-open");
      document.body.style.overflow = "";
      if (lbImg) lbImg.src = "";
      if (lbTitle) lbTitle.textContent = "";
      if (lbDesc) lbDesc.textContent = "";
      if (lbSwatches) lbSwatches.innerHTML = "";
      activeDetail = null;
    }

    function syncDetailVariant(index) {
      if (!activeDetail || !lbImg) return;
      var variants = activeDetail.variants;
      var i = Math.max(0, Math.min(index, variants.length - 1));
      var variant = variants[i];
      var color = variant.color;
      var displayTitle = color ? activeDetail.title + " — " + color : activeDetail.title;
      lbImg.src = variant.src;
      lbImg.alt = displayTitle;
      if (lbTitle) lbTitle.textContent = activeDetail.title;
      if (lbDesc) {
        lbDesc.textContent =
          activeDetail.desc || "Ask us for specs, finishes and pricing.";
      }
      if (lbInquire) {
        lbInquire.href = inquireUrl(
          displayTitle,
          activeDetail.categoryLabel,
          activeDetail.productUrl
        );
        lbInquire.setAttribute(
          "aria-label",
          "Inquire about " + displayTitle + " on WhatsApp"
        );
      }
      if (lbContact) {
        lbContact.href = contactFormUrl();
      }
      if (lbSwatches) {
        lbSwatches.innerHTML = swatchButtonsHtml(variants, i);
        lbSwatches.querySelectorAll("[data-variant-index]").forEach(function (btn) {
          btn.addEventListener("click", function (e) {
            e.stopPropagation();
            var next = parseInt(btn.getAttribute("data-variant-index"), 10);
            syncDetailVariant(next);
            if (typeof activeDetail.onVariantChange === "function") {
              activeDetail.onVariantChange(next);
            }
          });
        });
      }
      if (typeof activeDetail.onVariantChange === "function") {
        activeDetail.onVariantChange(i);
      }
    }

    function open(detail) {
      if (!lbImg || !detail) return;
      activeDetail = {
        title: detail.title || "Product",
        desc: (detail.desc || "").trim(),
        categoryLabel: detail.categoryLabel || "Product",
        productUrl: detail.productUrl || "",
        variants: detail.variants && detail.variants.length
          ? detail.variants
          : [{ src: detail.src || "", color: "" }],
        onVariantChange: detail.onVariantChange,
      };
      syncDetailVariant(typeof detail.activeIndex === "number" ? detail.activeIndex : 0);
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      createIcons();
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
   * @param {Array<{src:string,title?:string,desc?:string,variants?:Array}|string>} items
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
      var title = humanizeProductTitle(item.title, label, index);
      var desc = (item.desc || "").trim();
      var variants = normalizeVariants(item);
      if (!variants.length) return;

      var activeIndex = 0;
      var src = variants[0].src;
      var anchorId = uniqueProductId(title, el);
      var productUrl = productShareUrl(anchorId);
      var wa = inquireUrl(title, label, productUrl);
      var card = document.createElement("div");
      card.className = "product-card reveal";
      card.id = anchorId;
      card.innerHTML =
        '<div class="product-card__media">' +
        '<img src="' +
        escapeHtml(src) +
        '" alt="' +
        escapeHtml(title) +
        '" loading="lazy" class="product-image">' +
        "</div>" +
        swatchButtonsHtml(variants, activeIndex) +
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
      var inquire = card.querySelector(".product-card__inquire");

      function setActiveVariant(i) {
        activeIndex = Math.max(0, Math.min(i, variants.length - 1));
        var variant = variants[activeIndex];
        var color = variant.color;
        var displayTitle = color ? title + " — " + color : title;
        img.src = variant.src;
        img.alt = displayTitle;
        if (inquire) {
          inquire.href = inquireUrl(displayTitle, label, productUrl);
          inquire.setAttribute(
            "aria-label",
            "Inquire about " + displayTitle + " on WhatsApp"
          );
        }
        card.querySelectorAll(".product-swatch").forEach(function (btn) {
          var idx = parseInt(btn.getAttribute("data-variant-index"), 10);
          btn.classList.toggle("is-active", idx === activeIndex);
        });
      }

      card.querySelectorAll("[data-variant-index]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          setActiveVariant(parseInt(btn.getAttribute("data-variant-index"), 10));
        });
      });

      function openDetail() {
        global.FracaLightbox.open({
          title: title,
          desc: desc,
          categoryLabel: label,
          productUrl: productUrl,
          variants: variants,
          activeIndex: activeIndex,
          onVariantChange: setActiveVariant,
        });
      }

      img.addEventListener("click", openDetail);
      card.querySelector("h3").addEventListener("click", openDetail);
      el.appendChild(card);
    });

    createIcons();
    initReveal();
    scheduleProductHashScroll();
    var searchInput = document.getElementById("site-search-input");
    if (searchInput && searchInput.value) {
      applyProductCardFilter(searchInput.value);
    }
  }

  /**
   * Multi-section galleries: { sectionId: items[] }
   */
  function initGalleries(map, options) {
    Object.keys(map || {}).forEach(function (id) {
      initGallery("#" + id, map[id], options);
    });
  }

  function contactEndpoint(form) {
    var action = form.getAttribute("action") || "/api/contact";
    var base = (form.getAttribute("data-api-base") || global.FRACA_API_BASE || "").replace(/\/$/, "");
    if (!base) return action;
    return action.indexOf("http") === 0 ? action : base + (action.charAt(0) === "/" ? action : "/" + action);
  }

  function fieldValue(form, name) {
    var el = form.elements.namedItem(name);
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('[type="submit"]');
      var endpoint = contactEndpoint(form);
      var payload = {
        name: fieldValue(form, "name"),
        email: fieldValue(form, "email"),
        subject: fieldValue(form, "subject"),
        phone: fieldValue(form, "phone"),
        message: fieldValue(form, "message"),
        website: fieldValue(form, "website"),
      };

      if (status) {
        status.className = "form-status";
        status.textContent = "";
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        if (!submitBtn.getAttribute("data-label")) {
          submitBtn.setAttribute("data-label", submitBtn.textContent);
        }
        submitBtn.textContent = "Sending…";
      }

      fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (res) {
          return res.json().then(
            function (body) {
              return { ok: res.ok, body: body || {} };
            },
            function () {
              return { ok: res.ok, body: {} };
            }
          );
        })
        .then(function (result) {
          if (result.ok && result.body.ok !== false) {
            form.reset();
            if (status) {
              status.className = "form-status is-success";
              status.textContent = "Thank you — your message has been sent.";
            }
            return;
          }
          if (status) {
            status.className = "form-status is-error";
            status.textContent =
              result.body.error ||
              "Something went wrong. Please try WhatsApp or email us directly.";
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
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.getAttribute("data-label") || "Send Message";
          }
        });
    });
  }

  function init() {
    initTheme();
    createIcons();
    initNav();
    initSiteSearch();
    initYear();
    initSmoothScroll();
    initLightbox();
    initReveal();
    initContactForm();
    global.addEventListener("hashchange", scheduleProductHashScroll);
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
