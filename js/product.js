// Quadko: dynamic product detail page — reads ?p=<handle>, renders from assets/data/products.json
(function () {
  "use strict";

  function fmtPrice(p) {
    var n = Math.round(p.price).toLocaleString("en-US");
    return (p.priceFrom ? "From Rs. " : "Rs. ") + n;
  }

  function waLink(title) {
    var text = encodeURIComponent("Hi Quadko, I'd like to ask about the " + title + ".");
    return "https://api.whatsapp.com/send?phone=923400008758&text=" + text;
  }

  function mailLink(title) {
    var subject = encodeURIComponent("Enquiry: " + title);
    return "mailto:studio@quadko.com?subject=" + subject;
  }

  function paragraphs(text) {
    return text
      .split(/\n{2,}/)
      .map(function (block) { return block.trim(); })
      .filter(Boolean);
  }

  function buildCard(p, categoryLabel, showPrice) {
    var a = document.createElement("a");
    a.className = "card product-card reveal";
    a.href = "product.html?p=" + encodeURIComponent(p.handle);

    var media = document.createElement("div");
    media.className = "card-media";
    var photo = document.createElement("div");
    photo.className = "ph-photo ar-1x1";
    var img = document.createElement("img");
    img.src = p.images[0];
    img.alt = p.title + ", " + categoryLabel.toLowerCase();
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
    var params = new URLSearchParams(window.location.search);
    var handle = params.get("p");
    var root = document.querySelector("[data-product-root]");
    var notFound = document.querySelector("[data-product-notfound]");
    var relatedSection = document.querySelector("[data-product-related-section]");

    var res = await fetch("assets/data/products.json");
    var data = await res.json();
    var catLabel = {};
    data.categories.forEach(function (c) { catLabel[c.key] = c.label; });
    var othersGroup = data.groups.find(function (g) { return g.key === "others"; });
    var othersCategories = othersGroup ? othersGroup.categories : [];
    function showsPrice(p) { return othersCategories.indexOf(p.category) !== -1; }

    var product = data.products.find(function (p) { return p.handle === handle; });

    if (!product) {
      if (root) root.hidden = true;
      var breadcrumb = document.querySelector("[data-product-breadcrumb]");
      if (breadcrumb) {
        var span = document.createElement("span");
        span.textContent = "Not Found";
        breadcrumb.appendChild(document.createElement("span")).textContent = "/";
        breadcrumb.appendChild(span);
      }
      if (notFound) notFound.hidden = false;
      return;
    }

    root.hidden = false;
    var label = catLabel[product.category] || "Products";

    document.title = product.title + " | Quadko";
    var metaDesc = document.querySelector('meta[name="description"]');
    var shortDesc = paragraphs(product.description)[0] || product.description;
    if (shortDesc.length > 200) shortDesc = shortDesc.slice(0, 197) + "…";
    if (metaDesc) metaDesc.setAttribute("content", shortDesc);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", product.title + " | Quadko");
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", shortDesc);
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && product.images[0]) ogImage.setAttribute("content", "https://quadko.com/" + product.images[0]);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", "https://quadko.com/product.html?p=" + product.handle);

    var ld = document.createElement("script");
    ld.type = "application/ld+json";
    var ldData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": product.images.map(function (src) { return "https://quadko.com/" + src; }),
      "description": shortDesc,
      "brand": { "@type": "Brand", "name": "Quadko" },
      "category": label
    };
    if (showsPrice(product)) {
      ldData.offers = {
        "@type": "Offer",
        "priceCurrency": "PKR",
        "price": product.price,
        "availability": "https://schema.org/InStock",
        "url": "https://quadko.com/product.html?p=" + product.handle
      };
    }
    ld.textContent = JSON.stringify(ldData);
    document.head.appendChild(ld);

    var breadcrumbNav = document.querySelector("[data-product-breadcrumb]");
    if (breadcrumbNav) {
      var catA = document.createElement("a");
      catA.href = "shop.html#" + product.category;
      catA.textContent = label;
      var sep1 = document.createElement("span");
      sep1.textContent = "/";
      var titleSpan = document.createElement("span");
      titleSpan.textContent = product.title;
      var sep2 = document.createElement("span");
      sep2.textContent = "/";
      breadcrumbNav.appendChild(sep1);
      breadcrumbNav.appendChild(catA);
      breadcrumbNav.appendChild(sep2);
      breadcrumbNav.appendChild(titleSpan);
    }

    var mainMedia = document.querySelector("[data-product-main-media]");
    var mainImg = document.createElement("img");
    mainImg.src = product.images[0];
    mainImg.alt = product.title + ", " + label.toLowerCase();
    mainImg.width = 800;
    mainImg.height = 800;
    mainMedia.appendChild(mainImg);

    var thumbs = document.querySelector("[data-product-thumbs]");
    if (product.images.length > 1) {
      product.images.forEach(function (src, i) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ph-photo ar-1x1 product-thumb" + (i === 0 ? " is-active" : "");
        btn.setAttribute("aria-label", "Show image " + (i + 1) + " of " + product.title);
        var timg = document.createElement("img");
        timg.src = src;
        timg.alt = "";
        timg.loading = "lazy";
        timg.width = 200;
        timg.height = 200;
        btn.appendChild(timg);
        btn.addEventListener("click", function () {
          mainImg.src = src;
          thumbs.querySelectorAll(".product-thumb").forEach(function (t) { t.classList.remove("is-active"); });
          btn.classList.add("is-active");
        });
        thumbs.appendChild(btn);
      });
    } else {
      thumbs.hidden = true;
    }

    document.querySelector("[data-product-category]").textContent = label;
    document.querySelector("[data-product-title]").textContent = product.title;
    var priceEl = document.querySelector("[data-product-price]");
    if (showsPrice(product)) {
      priceEl.textContent = fmtPrice(product);
    } else {
      priceEl.hidden = true;
    }

    var descRoot = document.querySelector("[data-product-description]");
    paragraphs(product.description).forEach(function (block) {
      var p = document.createElement("p");
      p.className = "muted";
      p.style.marginTop = "14px";
      p.textContent = block;
      descRoot.appendChild(p);
    });

    var emailBtn = document.querySelector("[data-product-email]");
    emailBtn.href = mailLink(product.title);
    var waBtn = document.querySelector("[data-product-whatsapp]");
    waBtn.href = waLink(product.title);
    waBtn.target = "_blank";
    waBtn.rel = "noopener";

    var related = data.products
      .filter(function (p) { return p.category === product.category && p.handle !== product.handle; })
      .slice(0, 4);
    if (related.length) {
      var relatedRoot = document.querySelector("[data-product-related]");
      related.forEach(function (p) { relatedRoot.appendChild(buildCard(p, label, showsPrice(p))); });
      relatedSection.hidden = false;
      relatedSection.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }

    root.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
  }

  init();
})();
