// Quadko: shop page — renders as a dynamic "category page" driven by the URL hash.
// #<subtype>  -> exact sub-type (e.g. #coffee-tables)
// #<category> -> one leaf category (e.g. #chairs)
// #<group>    -> a whole nav group (e.g. #seating = chairs + benches)
// (none)      -> everything
(function () {
  "use strict";

  function fmtPrice(p) {
    var n = Math.round(p.price).toLocaleString("en-US");
    return (p.priceFrom ? "From Rs. " : "Rs. ") + n;
  }

  function buildCard(p, label, showPrice) {
    var a = document.createElement("a");
    a.className = "card product-card reveal is-visible";
    a.href = "product.html?p=" + encodeURIComponent(p.handle);

    var media = document.createElement("div");
    media.className = "card-media";
    var photo = document.createElement("div");
    photo.className = "ph-photo ar-1x1";
    var img = document.createElement("img");
    img.src = p.images[0];
    img.alt = p.title + ", " + label.toLowerCase();
    img.loading = "lazy";
    img.width = 600;
    img.height = 600;
    photo.appendChild(img);
    media.appendChild(photo);

    var h3 = document.createElement("h3");
    h3.className = "card-title";
    h3.textContent = p.title;

    a.appendChild(media);
    a.appendChild(h3);

    if (showPrice) {
      var meta = document.createElement("div");
      meta.className = "card-meta";
      var price = document.createElement("span");
      price.className = "price";
      price.textContent = fmtPrice(p);
      meta.appendChild(price);
      a.appendChild(meta);
    }

    return a;
  }

  async function init() {
    var grid = document.querySelector("[data-shop-grid]");
    var emptyMsg = document.querySelector("[data-shop-empty]");
    var breadcrumb = document.querySelector("[data-shop-breadcrumb]");
    var eyebrowEl = document.querySelector("[data-shop-eyebrow]");
    var titleEl = document.querySelector("[data-shop-title]");
    var ledeEl = document.querySelector("[data-shop-lede]");
    var backlink = document.querySelector("[data-shop-backlink]");
    if (!grid) return;

    var res = await fetch("assets/data/products.json");
    var data = await res.json();

    var categoryLabel = {};
    data.categories.forEach(function (c) { categoryLabel[c.key] = c.label; });
    var subtypeByKey = {};
    data.subtypes.forEach(function (s) { subtypeByKey[s.key] = s; });
    var groupByKey = {};
    data.groups.forEach(function (g) { groupByKey[g.key] = g; });

    function groupForCategory(catKey) {
      return data.groups.find(function (g) { return g.categories.indexOf(catKey) !== -1; });
    }

    var othersGroup = data.groups.find(function (g) { return g.key === "others"; });
    var othersCategories = othersGroup ? othersGroup.categories : [];
    function showsPrice(p) { return othersCategories.indexOf(p.category) !== -1; }

    function crumb(parts) {
      breadcrumb.innerHTML = "";
      var home = document.createElement("a");
      home.href = "index.html";
      home.textContent = "Home";
      breadcrumb.appendChild(home);
      parts.forEach(function (part) {
        var sep = document.createElement("span");
        sep.textContent = "/";
        breadcrumb.appendChild(sep);
        if (part.href) {
          var a = document.createElement("a");
          a.href = part.href;
          a.textContent = part.label;
          breadcrumb.appendChild(a);
        } else {
          var span = document.createElement("span");
          span.textContent = part.label;
          breadcrumb.appendChild(span);
        }
      });
    }

    function render(matches, view) {
      grid.innerHTML = "";
      matches.forEach(function (p) {
        grid.appendChild(buildCard(p, view.label, showsPrice(p)));
      });
      emptyMsg.hidden = matches.length > 0;

      document.title = (view.key === "all" ? "Products" : view.label) + " | Quadko";
      if (eyebrowEl) eyebrowEl.textContent = view.eyebrow;
      titleEl.textContent = view.label;
      if (view.key === "all") {
        ledeEl.hidden = false;
        backlink.hidden = true;
        crumb([{ label: "Products", href: "shop.html" }]);
      } else {
        ledeEl.hidden = true;
        backlink.hidden = false;
        crumb(view.crumbParts);
      }
    }

    function resolve(key) {
      if (!key || key === "all") {
        return { key: "all", label: "Products", eyebrow: "The Collection", matchFn: function () { return true; } };
      }
      if (key === "furniture") {
        return {
          key: key,
          label: "Furniture",
          eyebrow: "The Collection",
          matchFn: function (p) { var g = groupForCategory(p.category); return !g || g.key !== "others"; },
          crumbParts: [{ label: "Products", href: "shop.html" }, { label: "Furniture" }]
        };
      }
      var subtype = subtypeByKey[key];
      if (subtype) {
        var parentGroup = groupForCategory(subtype.parent);
        return {
          key: key,
          label: subtype.label,
          eyebrow: parentGroup ? parentGroup.label : "The Collection",
          matchFn: function (p) { return (p.subtypes || []).indexOf(key) !== -1; },
          crumbParts: [
            { label: "Products", href: "shop.html" },
            parentGroup ? { label: parentGroup.label, href: "shop.html#" + parentGroup.key } : null,
            { label: subtype.label }
          ].filter(Boolean)
        };
      }
      var group = groupByKey[key];
      if (group) {
        return {
          key: key,
          label: group.label,
          eyebrow: "The Collection",
          matchFn: function (p) { return group.categories.indexOf(p.category) !== -1; },
          crumbParts: [{ label: "Products", href: "shop.html" }, { label: group.label }]
        };
      }
      var cat = data.categories.find(function (c) { return c.key === key; });
      if (cat) {
        var g = groupForCategory(key);
        return {
          key: key,
          label: cat.label,
          eyebrow: g ? g.label : "The Collection",
          matchFn: function (p) { return p.category === key; },
          crumbParts: [
            { label: "Products", href: "shop.html" },
            g ? { label: g.label, href: "shop.html#" + g.key } : null,
            { label: cat.label }
          ].filter(Boolean)
        };
      }
      return resolve("all");
    }

    function renderFromHash() {
      var key = (window.location.hash || "").replace("#", "");
      var view = resolve(key);
      var matches = data.products.filter(view.matchFn);
      render(matches, view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Links between categories on this page only change the URL's hash, and
    // browsers don't reload the page for a same-document hash change — so we
    // have to listen for it ourselves and re-render instead of relying on init().
    window.addEventListener("hashchange", renderFromHash);
    renderFromHash();
  }

  init();
})();
