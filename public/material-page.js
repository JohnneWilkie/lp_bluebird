(function () {
  const site = window.BlueBirdSite;
  if (!site) return;
  const pageKey = document.body.dataset.pageKey;
  const page = site.materialPages[pageKey];
  if (!page) return;
  const currentSections = window.BlueBirdCurrentContent?.materialContent?.[pageKey] || [];
  const intro = currentSections[0]?.lines?.find(Boolean) || page.heroText;
  const heroHighlights = ["24/7 Emergency Service", "Financing Available", "Labor and Material Warranties"];

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function renderLines(lines) {
    return (lines || []).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  }

  document.title = page.title;
  const hero = document.getElementById("materialHero");
  const heroDesktop = page.heroDesktop || page.image;
  const heroMobile = page.heroMobile || heroDesktop;
  const callout = page.callout || page.gallery[0] || page.image;
  hero.innerHTML = `
    <section class="hero material-hero responsive-hero-bg" style="--hero-desktop:url('${heroDesktop}');--hero-mobile:url('${heroMobile}')">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <div class="rating-pill"><span>5.0 Google Rating</span></div>
        <p class="eyebrow">Serving Boston Metro & Southern New Hampshire</p>
        <h1>${page.h1}</h1>
        <p class="hero-sub">${escapeHtml(intro)}</p>
        <ul class="check-list">
          ${heroHighlights.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <div data-quote-bridge="hero"></div>
    </section>
    <section class="photo-strip material-photo-strip" aria-label="${page.h1} projects">
      <div class="photo-track material-track">
        ${(page.gallery || []).map((src) => `<img src="${src}" alt="${page.h1} project photo" loading="lazy">`).join("")}
      </div>
    </section>
  `;

  const content = document.getElementById("materialContent");
  content.innerHTML = `
    <div data-quote-bridge="sticky"></div>
    <section class="section material-gallery-section">
      <div class="section-head">
        <h2>${page.h1} Gallery</h2>
        <p>Browse project photos and get a clearer feel for the style, finish, and installation details.</p>
      </div>
      <div class="material-gallery-grid" id="materialGalleryGrid" aria-label="${page.h1} gallery"></div>
    </section>
    <section class="section">
      <div class="current-site-layout">
        <figure class="current-site-media">
          <img src="${callout}" alt="${page.h1}" loading="lazy">
        </figure>
        <div class="current-site-copy">
          ${currentSections.map((section) => `
            <article class="source-section">
              <h2>${escapeHtml(section.title)}</h2>
              ${renderLines(section.lines)}
            </article>
          `).join("")}
        </div>
      </div>
      <div class="center-action">
        <a class="btn btn-primary2" href="#quote-form">Start My ${page.h1} Quote</a>
      </div>
    </section>
    <section class="quote-section" id="quote-form">
      <div class="quote-header-band"><p>Get your ${page.h1.toLowerCase()} quote online now.</p><span>We’re Online</span></div>
      <div class="quote-shell"><div id="quoteWidget"></div></div>
    </section>
    <div data-shared-sections></div>
  `;

  window.initQuoteWidget({
    containerId: "quoteWidget",
    preset: page.preset
  });

  async function loadMaterialGallery() {
    const grid = document.getElementById("materialGalleryGrid");
    if (!grid || !page.galleryFolder) return;
    try {
      const response = await fetch(`/api/gallery/${encodeURIComponent(page.galleryFolder)}`);
      const data = await response.json();
      const images = Array.isArray(data.images) ? data.images : [];
      grid.innerHTML = images.map((src, index) => `
        <figure>
          <img src="${src}" alt="${page.h1} gallery image ${index + 1}" loading="lazy">
        </figure>
      `).join("");
    } catch {
      grid.innerHTML = (page.gallery || []).map((src, index) => `
        <figure>
          <img src="${src}" alt="${page.h1} gallery image ${index + 1}" loading="lazy">
        </figure>
      `).join("");
    }
  }

  loadMaterialGallery();
  if (window.renderBlueBirdQuoteBridges) window.renderBlueBirdQuoteBridges();
})();
