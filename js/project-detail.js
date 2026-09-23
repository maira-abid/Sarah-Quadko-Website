// Quadko: dynamic project detail page — reads ?p=<slug>, renders from assets/data/projects.json
// Layout follows an editorial case-study pattern: full-bleed hero, title + meta grid,
// description, then a rhythm of full-bleed / paired gallery images, ending in a
// full-bleed "next project" tile.
(function () {
  "use strict";

  function buildNextTile(project) {
    var a = document.createElement("a");
    a.className = "project-next reveal is-visible";
    a.href = "project-detail.html?p=" + encodeURIComponent(project.slug);

    var img = document.createElement("img");
    img.src = project.images && project.images.length ? project.images[0] : "";
    img.alt = project.title;
    img.loading = "lazy";
    if (!img.src) a.style.background = "var(--qk-black)";
    a.appendChild(img);

    var inner = document.createElement("div");
    inner.className = "project-next-inner";
    var eyebrow = document.createElement("span");
    eyebrow.className = "project-next-eyebrow";
    eyebrow.textContent = "Next Project";
    var title = document.createElement("span");
    title.className = "project-next-title";
    title.textContent = project.title;
    var link = document.createElement("span");
    link.className = "project-next-link";
    link.textContent = "Discover More";
    inner.appendChild(eyebrow);
    inner.appendChild(title);
    inner.appendChild(link);
    a.appendChild(inner);

    return a;
  }

  async function init() {
    var params = new URLSearchParams(window.location.search);
    var slug = params.get("p");
    var root = document.querySelector("[data-project-root]");
    var notFound = document.querySelector("[data-project-notfound]");
    var nextSection = document.querySelector("[data-project-next-section]");

    var res = await fetch("assets/data/projects.json");
    var data = await res.json();
    var catLabel = {};
    data.categories.forEach(function (c) { catLabel[c.key] = c.label; });

    var project = data.projects.find(function (p) { return p.slug === slug; });

    if (!project) {
      if (root) root.hidden = true;
      var breadcrumb = document.querySelector("[data-project-breadcrumb]");
      if (breadcrumb) {
        var span = document.createElement("span");
        span.textContent = "Not Found";
        breadcrumb.appendChild(document.createElement("span")).textContent = "/";
        breadcrumb.appendChild(span);
      }
      if (notFound) notFound.hidden = false;
      return;
    }

    var label = catLabel[project.category] || "Projects";

    document.title = project.title + " | Quadko";
    var shortDesc = project.description;
    if (shortDesc.length > 200) shortDesc = shortDesc.slice(0, 197) + "…";
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", shortDesc);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", project.title + " | Quadko");
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", shortDesc);
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && project.images[0]) ogImage.setAttribute("content", "https://quadko.com/" + project.images[0]);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://quadko.com/project-detail.html?p=" + project.slug);

    var ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": project.title,
      "creator": { "@type": "Organization", "name": "Quadko" },
      "about": label,
      "locationCreated": { "@type": "Place", "name": project.location || "Pakistan" },
      "dateCreated": project.year || undefined,
      "image": project.images.map(function (src) { return "https://quadko.com/" + src; }),
      "url": "https://quadko.com/project-detail.html?p=" + project.slug
    });
    document.head.appendChild(ld);

    var breadcrumbNav = document.querySelector("[data-project-breadcrumb]");
    if (breadcrumbNav) {
      var catA = document.createElement("a");
      catA.href = "projects.html#" + project.category;
      catA.textContent = label;
      var sep1 = document.createElement("span");
      sep1.textContent = "/";
      var titleSpan = document.createElement("span");
      titleSpan.textContent = project.title;
      var sep2 = document.createElement("span");
      sep2.textContent = "/";
      breadcrumbNav.appendChild(sep1);
      breadcrumbNav.appendChild(catA);
      breadcrumbNav.appendChild(sep2);
      breadcrumbNav.appendChild(titleSpan);
    }

    root.hidden = false;

    // Hero: first image full-bleed, no header text overlay (matches the reference
    // case-study layout — title and meta live in the content block just below it).
    var hero = document.querySelector("[data-project-hero]");
    if (project.images && project.images.length) {
      var heroImg = document.createElement("img");
      heroImg.src = project.images[0];
      heroImg.alt = project.title;
      hero.appendChild(heroImg);
    } else {
      hero.style.background = "var(--qk-cream)";
      hero.style.display = "flex";
      hero.style.alignItems = "center";
      hero.style.justifyContent = "center";
      var conceptTag = document.createElement("span");
      conceptTag.textContent = "Concept in progress";
      conceptTag.style.color = "var(--qk-black)";
      conceptTag.style.fontSize = ".75rem";
      conceptTag.style.letterSpacing = ".1em";
      conceptTag.style.textTransform = "uppercase";
      hero.appendChild(conceptTag);
    }

    document.querySelector("[data-project-title]").textContent = project.title;
    document.querySelector("[data-project-location]").textContent = project.location || "Pakistan";
    document.querySelector("[data-project-cat-label]").textContent = "Category";
    document.querySelector("[data-project-eyebrow]").textContent = label;
    document.querySelector("[data-project-scope]").textContent = label === "Residential" ? "Interiors, Furniture" : "Architecture, Interiors";

    var yearRow = document.querySelector("[data-project-year-row]");
    if (project.year) {
      document.querySelector("[data-project-year]").textContent = project.year;
    } else if (yearRow) {
      yearRow.hidden = true;
    }

    if (project.isConcept) {
      var noteBox = document.querySelector("[data-project-concept-note]");
      var noteText = document.querySelector("[data-project-concept-text]");
      noteText.textContent = project.conceptNote || "This project is at concept stage. Photography and final scheme to follow.";
      noteBox.hidden = false;
    }

    document.querySelector("[data-project-description]").textContent = project.description;

    // Gallery: the rest of the images (hero already used image 0), alternating
    // full-bleed singles with edge-to-edge pairs — the rhythm of the reference layout.
    var gallery = document.querySelector("[data-project-gallery]");

    // Before & after: a single contained comparison pair (sized like any other
    // gallery pair, not a page-length stack) makes the point once; any extra
    // before/after photos flow into the regular gallery rhythm below it so the
    // rest of the page reads like every other project, not one long comparison.
    var hasBeforeAfter = project.beforeImages && project.beforeImages.length && project.afterImages && project.afterImages.length;
    if (hasBeforeAfter) {
      var ba = document.createElement("div");
      ba.className = "project-before-after reveal is-visible";
      [["Before", project.beforeImages[0]], ["After", project.afterImages[0]]].forEach(function (entry) {
        var item = document.createElement("div");
        item.className = "project-ba-item";
        var label = document.createElement("span");
        label.className = "project-ba-label";
        label.textContent = entry[0];
        var ph = document.createElement("div");
        ph.className = "ph-photo";
        var img = document.createElement("img");
        img.src = entry[1];
        img.alt = project.title + ", " + entry[0];
        img.loading = "lazy";
        ph.appendChild(img);
        item.appendChild(label);
        item.appendChild(ph);
        ba.appendChild(item);
      });
      gallery.appendChild(ba);
    }

    var rest = (project.images || []).slice(1);
    if (hasBeforeAfter) {
      var maxLen = Math.max(project.beforeImages.length, project.afterImages.length);
      for (var b = 1; b < maxLen; b++) {
        if (project.beforeImages[b]) rest.push(project.beforeImages[b]);
        if (project.afterImages[b]) rest.push(project.afterImages[b]);
      }
    }
    var i = 0;
    var full = true;
    while (i < rest.length) {
      if (full || rest.length - i === 1) {
        var wrap = document.createElement("div");
        wrap.className = "project-gallery-full reveal is-visible";
        var ph = document.createElement("div");
        ph.className = "ph-photo";
        var img = document.createElement("img");
        img.src = rest[i];
        img.alt = project.title + ", image " + (i + 2);
        img.loading = "lazy";
        ph.appendChild(img);
        wrap.appendChild(ph);
        gallery.appendChild(wrap);
        i += 1;
      } else {
        var pair = document.createElement("div");
        pair.className = "project-gallery-pair reveal is-visible";
        [rest[i], rest[i + 1]].forEach(function (src, j) {
          var p = document.createElement("div");
          p.className = "ph-photo";
          var pimg = document.createElement("img");
          pimg.src = src;
          pimg.alt = project.title + ", image " + (i + 2 + j);
          pimg.loading = "lazy";
          p.appendChild(pimg);
          pair.appendChild(p);
        });
        gallery.appendChild(pair);
        i += 2;
      }
      full = !full;
    }

    // Next project: cycle sequentially through the same category (wrapping
    // around) so every project points somewhere different, not always the
    // first match in the list.
    var sameCat = data.projects.filter(function (p) { return p.category === project.category; });
    var pool = sameCat.length > 1 ? sameCat : data.projects;
    var currentIndex = pool.findIndex(function (p) { return p.slug === project.slug; });
    var nextProject = pool[(currentIndex + 1) % pool.length];
    if (nextProject) {
      nextSection.appendChild(buildNextTile(nextProject));
      nextSection.hidden = false;
    }

    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  init();
})();
