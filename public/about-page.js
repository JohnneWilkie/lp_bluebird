(function () {
  const site = window.BlueBirdSite;
  if (!site) return;
  document.title = "About BlueBird Fence | Boston Metro & Southern NH";
  const root = document.getElementById("aboutPage");
  if (!root) return;
  const aboutLines = window.BlueBirdCurrentContent?.about || [];
  const assets = site.pageAssets?.about || {};
  const mainCopy = aboutLines.find((line) => line.startsWith("BlueBird Fence Inc provides")) || "";
  const factLabels = new Set(["Year Established", "Specialties", "Associations", "Payment Options", "Languages"]);
  const stopLabels = new Set(["Watch Video", "VISIT US", "SERVING AREA", "CONTACT US", "WINTER HOURS"]);
  const facts = [];
  let active = null;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[char]);
  }

  for (const line of aboutLines) {
    if (factLabels.has(line)) {
      active = { title: line, values: [] };
      facts.push(active);
    } else if (stopLabels.has(line)) {
      active = null;
    } else if (active && line !== "BlueBird Fence Inc" && line !== "Home" && line !== "About") {
      active.values.push(line);
    }
  }

  root.innerHTML = `
    <section class="hero material-hero responsive-hero-bg" style="--hero-desktop:url('${assets.heroDesktop || "/assets/pages/about/hero-desktop.png"}');--hero-mobile:url('${assets.heroMobile || "/assets/pages/about/hero-mobile.png"}')">
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="eyebrow">About BlueBird Fence</p>
        <h1>BlueBird Fence Inc</h1>
        <p class="hero-sub">${escapeHtml(mainCopy)}</p>
        <ul class="check-list">
          <li>Year Established: 2012</li>
          <li>Financing</li>
          <li>24/7 Emergency Services</li>
        </ul>
      </div>
      <div data-quote-bridge="hero"></div>
    </section>
    <div data-quote-bridge="sticky"></div>
    <section class="section">
      <div class="current-site-layout">
        <figure class="current-site-media">
          <img src="${assets.callout || "/assets/pages/about/callout.png"}" alt="BlueBird Fence Inc" loading="lazy">
        </figure>
        <div class="current-site-copy">
          <article class="source-section">
            <h2>BlueBird Fence Inc</h2>
            <p>${escapeHtml(mainCopy)}</p>
          </article>
          <div class="detail-grid about-facts">
            ${facts.map((fact) => `
              <article class="detail-card">
                <h3>${escapeHtml(fact.title)}</h3>
                ${fact.values.map((value) => `<p>${escapeHtml(value)}</p>`).join("")}
              </article>
            `).join("")}
          </div>
        </div>
      </div>
    </section>
    <section class="quote-section" id="quote-form">
      <div class="quote-header-band"><p>Start your fence quote online now.</p><span>We’re Online</span></div>
      <div class="quote-shell"><div id="quoteWidget"></div></div>
    </section>
    <div data-shared-sections></div>
  `;
  window.initQuoteWidget({
    containerId: "quoteWidget",
    preset: { projectType: "New Fence", fenceStyle: "Not Sure Yet" }
  });
  if (window.renderBlueBirdQuoteBridges) window.renderBlueBirdQuoteBridges();
})();
