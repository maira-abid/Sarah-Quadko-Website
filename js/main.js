// Quadko: shared site behaviour (nav, header state, reveal-on-scroll, back-to-top)
(function () {
  "use strict";

  // ---- Backdrop: dims + blurs the page behind an open dropdown/search panel ----
  var navBackdrop = document.querySelector("[data-nav-backdrop]");
  function updateBackdrop() {
    if (!navBackdrop) return;
    var anyOpen = document.querySelector("[data-drop-panel].is-open, [data-search-panel].is-open");
    navBackdrop.classList.toggle("is-open", !!anyOpen);
  }
  function closeAllOverlayPanels() {
    document.querySelectorAll("[data-drop-panel]").forEach(function (p) { p.classList.remove("is-open"); });
    document.querySelectorAll("[data-drop-target]").forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
    var sp = document.querySelector("[data-search-panel]");
    var st = document.querySelector("[data-search-toggle]");
    if (sp) sp.classList.remove("is-open");
    if (st) st.setAttribute("aria-expanded", "false");
    updateBackdrop();
  }
  if (navBackdrop) navBackdrop.addEventListener("click", closeAllOverlayPanels);

  // ---- Sticky header: solid once scrolled, hides on scroll-down, reveals on scroll-up ----
  var header = document.querySelector(".site-header");
  var lastScrollY = window.scrollY;
  var HIDE_AFTER = 140; // don't hide until scrolled past the header's own height
  var onScroll = function () {
    if (!header) return;
    var currentY = window.scrollY;

    if (currentY > 12) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");

    if (currentY < HIDE_AFTER) {
      header.classList.remove("nav-hidden");
    } else if (currentY > lastScrollY) {
      header.classList.add("nav-hidden");
    } else if (currentY < lastScrollY) {
      header.classList.remove("nav-hidden");
    }
    lastScrollY = currentY;

    var toTop = document.querySelector(".back-to-top");
    if (toTop) {
      if (currentY > 900) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    }
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- Mobile nav toggle ----
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");
  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove("is-open");
    document.body.style.overflow = "";
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  }
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      document.body.style.overflow = isOpen ? "hidden" : "";
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    var closeBtn = mobileNav.querySelector(".mobile-nav-close");
    if (closeBtn) closeBtn.addEventListener("click", closeMobileNav);
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobileNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileNav();
    });
  }

  // ---- Mobile nav: expandable Products group ----
  document.querySelectorAll(".mobile-nav-group").forEach(function (group) {
    var toggle = group.querySelector(".mobile-nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var isOpen = group.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });

  // ---- Desktop nav: Projects / Products full-width mega-menus (hover to open, like Kelly's) ----
  function closeSearchPanel() {
    var sp = document.querySelector("[data-search-panel]");
    var st = document.querySelector("[data-search-toggle]");
    if (sp) sp.classList.remove("is-open");
    if (st) st.setAttribute("aria-expanded", "false");
  }
  var dropTriggers = document.querySelectorAll("[data-drop-target]");
  function closeAllDropPanels(exceptPanel) {
    document.querySelectorAll("[data-drop-panel]").forEach(function (p) {
      if (p !== exceptPanel) p.classList.remove("is-open");
    });
    dropTriggers.forEach(function (t) {
      var panel = document.getElementById(t.getAttribute("data-drop-target"));
      if (panel !== exceptPanel) t.setAttribute("aria-expanded", "false");
    });
  }
  if (dropTriggers.length) {
    var dropCloseTimer = null;
    function cancelDropClose() {
      if (dropCloseTimer) { clearTimeout(dropCloseTimer); dropCloseTimer = null; }
    }
    function scheduleDropClose() {
      cancelDropClose();
      dropCloseTimer = setTimeout(function () { closeAllDropPanels(); updateBackdrop(); }, 200);
    }
    dropTriggers.forEach(function (trigger) {
      var panel = document.getElementById(trigger.getAttribute("data-drop-target"));
      if (!panel) return;
      function openPanel() {
        cancelDropClose();
        closeAllDropPanels(panel);
        closeSearchPanel();
        closeMobileNav();
        panel.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        updateBackdrop();
      }
      // Hover open/close is scoped to the trigger + its own panel only (not the whole
      // header), since the panel renders visually outside the header's own box.
      trigger.addEventListener("mouseenter", openPanel);
      trigger.addEventListener("mouseleave", scheduleDropClose);
      panel.addEventListener("mouseenter", cancelDropClose);
      panel.addEventListener("mouseleave", scheduleDropClose);
      trigger.addEventListener("click", function (e) {
        if (panel.classList.contains("is-open")) return; // second click/tap lets the link through
        e.preventDefault();
        openPanel();
      });
      // Same-page links (e.g. shop.html#sofas -> shop.html#coffee-tables) don't
      // reload the page, so nothing else naturally closes the panel afterward.
      panel.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          cancelDropClose();
          closeAllDropPanels();
          updateBackdrop();
        }
      });
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-drop-target]") && !e.target.closest("[data-drop-panel]")) {
        closeAllDropPanels();
        updateBackdrop();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAllDropPanels(); updateBackdrop(); }
    });
  }

  // ---- Header search ----
  var SEARCH_INDEX = [
    { title: "Home", url: "index.html", cat: "Overview", keywords: "quadko architecture interiors furniture product design studio home" },
    { title: "Studio", url: "studio.html", cat: "About", keywords: "about studio story philosophy craft team who we are" },
    { title: "Architecture", url: "architecture.html", cat: "Discipline", keywords: "architecture buildings construction concept design services" },
    { title: "Interiors", url: "interiors.html", cat: "Discipline", keywords: "interiors interior design residential commercial spatial planning styling" },
    { title: "Furniture", url: "furniture.html", cat: "Discipline", keywords: "furniture made to order chairs tables beds consoles handcrafted joinery" },
    { title: "Products", url: "products.html", cat: "Discipline", keywords: "products objects homeware cheeseboards trays coasters games small batch" },
    { title: "Projects", url: "projects.html", cat: "Portfolio", keywords: "projects portfolio work case studies buildings" },
    { title: "Shop", url: "shop.html", cat: "Shop", keywords: "shop buy furniture objects homeware chair sofa table console" },
    { title: "Contact", url: "contact.html", cat: "Contact", keywords: "contact enquire whatsapp email phone reach out" }
  ];
  var searchToggle = document.querySelector("[data-search-toggle]");
  var searchPanel = document.querySelector("[data-search-panel]");
  if (searchToggle && searchPanel) {
    var searchInput = searchPanel.querySelector("[data-search-input]");
    var searchResults = searchPanel.querySelector("[data-search-results]");
    var searchEmpty = searchPanel.querySelector("[data-search-empty]");
    var searchClose = searchPanel.querySelector("[data-search-close]");
    var searchForm = searchPanel.querySelector("[data-search-form]");

    function renderResults(query) {
      searchResults.innerHTML = "";
      var q = query.trim().toLowerCase();
      if (!q) {
        searchEmpty.classList.remove("is-visible");
        return;
      }
      var matches = SEARCH_INDEX.filter(function (item) {
        return (item.title + " " + item.keywords).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 6);
      searchEmpty.classList.toggle("is-visible", matches.length === 0);
      matches.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.url;
        a.innerHTML = "<b>" + item.title + "</b><span>" + item.cat + "</span>";
        li.appendChild(a);
        searchResults.appendChild(li);
      });
    }

    function openSearch() {
      closeMobileNav();
      document.querySelectorAll("[data-drop-panel]").forEach(function (p) { p.classList.remove("is-open"); });
      document.querySelectorAll("[data-drop-target]").forEach(function (t) { t.setAttribute("aria-expanded", "false"); });
      searchPanel.classList.add("is-open");
      searchToggle.setAttribute("aria-expanded", "true");
      if (searchInput) searchInput.focus();
      updateBackdrop();
    }
    function closeSearch() {
      searchPanel.classList.remove("is-open");
      searchToggle.setAttribute("aria-expanded", "false");
      updateBackdrop();
    }

    searchToggle.addEventListener("click", function () {
      var isOpen = searchPanel.classList.contains("is-open");
      if (isOpen) closeSearch(); else openSearch();
    });
    if (searchClose) searchClose.addEventListener("click", closeSearch);
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderResults(searchInput.value);
      });
    }
    if (searchForm) {
      searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var first = searchResults.querySelector("a");
        if (first) window.location.href = first.getAttribute("href");
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSearch();
    });
    document.addEventListener("click", function (e) {
      if (!searchPanel.classList.contains("is-open")) return;
      if (searchPanel.contains(e.target) || searchToggle.contains(e.target)) return;
      closeSearch();
    });
    if (navToggle) navToggle.addEventListener("click", closeSearch);
  }

  // ---- Homepage: featured products (pulled from the real catalogue) ----
  var homeShop = document.querySelector("[data-home-shop]");
  if (homeShop) {
    var FEATURED_HANDLES = ["wassily-chair-reimagined", "oasis", "luna-console", "kaf-outdoor-dining-table-set"];
    fetch("assets/data/products.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var byHandle = {};
        data.products.forEach(function (p) { byHandle[p.handle] = p; });
        var catLabel = {};
        data.categories.forEach(function (c) { catLabel[c.key] = c.label; });
        FEATURED_HANDLES.forEach(function (handle) {
          var p = byHandle[handle];
          if (!p) return;
          var label = catLabel[p.category] || "Products";
          var n = Math.round(p.price).toLocaleString("en-US");
          var priceText = (p.priceFrom ? "From Rs. " : "Rs. ") + n;

          var card = document.createElement("div");
          card.className = "card product-card";

          var mediaLink = document.createElement("a");
          mediaLink.href = "product.html?p=" + encodeURIComponent(p.handle);
          mediaLink.className = "card-media";
          mediaLink.setAttribute("aria-label", p.title);
          var photo = document.createElement("div");
          photo.className = "ph-photo ar-1x1";
          var img = document.createElement("img");
          img.src = p.images[0];
          img.alt = p.title + ", " + label.toLowerCase();
          img.loading = "lazy";
          img.width = 600;
          img.height = 600;
          photo.appendChild(img);
          mediaLink.appendChild(photo);

          var titleLink = document.createElement("a");
          titleLink.href = "product.html?p=" + encodeURIComponent(p.handle);
          var h3 = document.createElement("h3");
          h3.className = "card-title";
          h3.textContent = p.title;
          titleLink.appendChild(h3);

          var meta = document.createElement("div");
          meta.className = "card-meta";
          var priceSpan = document.createElement("span");
          priceSpan.className = "price";
          priceSpan.textContent = priceText;
          var enquire = document.createElement("a");
          enquire.href = "product.html?p=" + encodeURIComponent(p.handle);
          enquire.className = "link-under";
          enquire.style.cssText = "font-size:var(--step-1); font-weight:600; text-transform:uppercase; letter-spacing:.06em;";
          enquire.setAttribute("aria-label", "View " + p.title);
          enquire.textContent = "View";
          meta.appendChild(priceSpan);
          meta.appendChild(enquire);

          card.appendChild(mediaLink);
          card.appendChild(titleLink);
          card.appendChild(meta);
          homeShop.appendChild(card);
        });
      })
      .catch(function () {});
  }

  // ---- Reveal on scroll ----
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---- Accordions: only one open at a time within a group ----
  document.querySelectorAll("[data-accordion-group]").forEach(function (group) {
    var items = group.querySelectorAll("details");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (item.open) {
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        }
      });
    });
  });

  // ---- Back to top ----
  document.querySelectorAll(".back-to-top").forEach(function (btn) {
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ---- Current year in footer ----
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---- Newsletter demo form ----
  document.querySelectorAll("[data-newsletter-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = form.querySelector("[data-form-note]");
      if (note) note.textContent = "Thank you, you're on the list.";
      form.reset();
    });
  });

  // ---- Contact form (no backend in this mockup) ----
  document.querySelectorAll("[data-demo-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector("[data-demo-form-msg]");
      if (msg) {
        msg.hidden = false;
        msg.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
})();
