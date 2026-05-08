(function () {
  const site = window.BlueBirdSite;
  if (!site) return;
  document.title = "Gallery | BlueBird Fence";
  const root = document.getElementById("galleryPage");
  if (!root) return;
  const assets = site.pageAssets?.gallery || {};
  const currentGallery = window.BlueBirdCurrentContent?.galleryImages || [];
  const galleryItems = currentGallery.length ? currentGallery : site.galleryItems;

  root.innerHTML = `
    <section class="hero material-hero responsive-hero-bg" style="--hero-desktop:url('${assets.heroDesktop || "/assets/pages/gallery/hero-desktop.jpg"}');--hero-mobile:url('${assets.heroMobile || "/assets/pages/gallery/hero-mobile.jpg"}')">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="eyebrow">BlueBird Fence Gallery</p>
        <h1>Recent Fencing Projects</h1>
        <p class="hero-sub">Recent Fencing Projects</p>
      </div>
      <div data-quote-bridge="hero"></div>
    </section>
    <div data-quote-bridge="sticky"></div>
    <section class="section">
      <div class="gallery-filters" id="galleryFilters"></div>
      <div class="gallery-grid gallery-filter-grid" id="galleryGrid"></div>
    </section>
    <section class="quote-section" id="quote-form">
      <div class="quote-header-band"><p>Start your fence quote online now.</p><span>We’re Online</span></div>
      <div class="quote-shell"><div id="quoteWidget"></div></div>
    </section>
    <div data-shared-sections></div>
  `;

  const categories = ["all", ...Array.from(new Set(galleryItems.map((item) => item.category)))];
  let current = "all";
  const filters = document.getElementById("galleryFilters");
  const grid = document.getElementById("galleryGrid");

  function renderFilters() {
    filters.innerHTML = categories.map((key) => `
      <button class="btn ${current === key ? "btn-primary2" : "btn-secondary"}" data-filter="${key}">
        ${key === "all" ? "All Projects" : key.replace("-", " ")}
      </button>
    `).join("");
    filters.querySelectorAll("[data-filter]").forEach((node) => {
      node.addEventListener("click", () => {
        current = node.dataset.filter;
        renderFilters();
        renderGrid();
      });
    });
  }

  function renderGrid() {
    const items = galleryItems.filter((item) => current === "all" || item.category === current);
    grid.innerHTML = items.map((item) => `
      <figure>
        <img src="${item.src}" alt="${item.alt}" loading="lazy">
        <figcaption>${item.category}</figcaption>
      </figure>
    `).join("");
  }

  renderFilters();
  renderGrid();
  window.initQuoteWidget({
    containerId: "quoteWidget",
    preset: { projectType: "New Fence", fenceStyle: "Not Sure Yet" }
  });
  if (window.renderBlueBirdQuoteBridges) window.renderBlueBirdQuoteBridges();
})();
