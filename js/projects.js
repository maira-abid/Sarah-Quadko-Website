// Quadko: projects page — renders real project cards grouped by category from projects.json
(function () {
  "use strict";

  function buildCard(project) {
    var row = document.createElement("div");
    row.className = "project-index-row reveal is-visible";

    var info = document.createElement("div");
    info.className = "project-index-info";
    var h3 = document.createElement("h3");
    h3.textContent = project.title;
    var link = document.createElement("a");
    link.className = "link-under serif-italic";
    link.href = "project-detail.html?p=" + encodeURIComponent(project.slug);
    link.textContent = "Explore the Project";
    info.appendChild(h3);
    info.appendChild(link);
    row.appendChild(info);

    var images = document.createElement("a");
    images.href = "project-detail.html?p=" + encodeURIComponent(project.slug);
    images.className = "project-index-images";
    images.setAttribute("aria-label", project.title);

    var imgs = project.images && project.images.length ? project.images.slice(0, 3) : [];
    if (imgs.length === 0) {
      var ph = document.createElement("div");
      ph.className = "ph-photo";
      ph.style.background = "var(--qk-cream)";
      ph.style.display = "flex";
      ph.style.alignItems = "center";
      ph.style.justifyContent = "center";
      var tag = document.createElement("span");
      tag.textContent = "Concept in progress";
      tag.style.color = "var(--qk-black)";
      tag.style.fontSize = ".7rem";
      tag.style.letterSpacing = ".08em";
      tag.style.textTransform = "uppercase";
      ph.appendChild(tag);
      images.appendChild(ph);
    } else {
      imgs.forEach(function (src) {
        var wrap = document.createElement("div");
        wrap.className = "ph-photo";
        var img = document.createElement("img");
        img.src = src;
        img.alt = project.title;
        img.loading = "lazy";
        wrap.appendChild(img);
        images.appendChild(wrap);
      });
    }
    row.appendChild(images);

    return row;
  }

  async function init() {
    var res = await fetch("assets/data/projects.json");
    var data = await res.json();

    var order = ["residential", "commercial", "restaurant", "retail"];
    var byCat = {};
    order.forEach(function (k) { byCat[k] = []; });
    data.projects.forEach(function (p) {
      if (!byCat[p.category]) byCat[p.category] = [];
      byCat[p.category].push(p);
    });
    var catLabel = {};
    data.categories.forEach(function (c) { catLabel[c.key] = c.label; });

    order.forEach(function (catKey, i) {
      var section = document.querySelector('[data-project-category="' + catKey + '"]');
      if (!section) return;
      var list = byCat[catKey] || [];
      var root = section.querySelector("[data-project-list]");
      var numEl = section.querySelector("[data-project-num]");
      if (numEl) numEl.textContent = String(i + 1).padStart(2, "0");
      if (!list.length) {
        section.hidden = true;
        return;
      }
      list.forEach(function (p) { root.appendChild(buildCard(p)); });
    });

    // Content loads asynchronously, so a #hash present on page load scrolls to the
    // right spot before the section grows to its real height — correct it once rendered.
    if (window.location.hash) {
      var target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView();
    }
  }

  init();
})();
