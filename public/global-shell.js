(function () {
  const data = window.BlueBirdSite;
  if (!data) return;

  function header(activePath) {
    const navItems = data.nav.map((item) => {
      const active = activePath === item.href ? "is-active" : "";
      return `<a class="${active}" href="${item.href}">${item.label}</a>`;
    }).join("");
    return `
      <header class="site-header">
        <a class="brand" href="/" aria-label="BlueBird Fence home">
          <img class="brand-logo" src="/assets/bluebird-logo.png" alt="BlueBird Fence logo" width="172" height="48">
        </a>
        <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="globalNav" aria-label="Open menu">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
        <nav class="nav-links" id="globalNav" aria-label="Main navigation">${navItems}</nav>
        <a class="btn btn-call header-call" href="tel:${data.PHONE_RAW}" data-phone-link>Call Now: ${data.PHONE_PRETTY}</a>
      </header>
    `;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="footer-wrap">
          <div class="footer-brand">
            <img class="brand-logo" src="/assets/bluebird-logo-white.png" alt="BlueBird Fence logo" width="172" height="48">
            <p>Residential and commercial fencing across Boston Metro and Southern New Hampshire.</p>
          </div>
          <div class="footer-contact">
            <h3>Contact</h3>
            <a href="tel:${data.PHONE_RAW}">${data.PHONE_PRETTY}</a>
            <a href="mailto:${data.EMAIL}">${data.EMAIL}</a>
            <p>${data.ADDRESS}</p>
          </div>
        </div>
      </footer>
    `;
  }

  function quoteBridge(variant = "hero") {
    const rootId = variant === "sticky" ? ' id="quoteBridge"' : "";
    const hidden = variant === "sticky" ? " hidden" : "";
    return `
      <section class="quote-bridge quote-bridge-${variant}${hidden}"${rootId}>
        <div class="quote-bridge-inner">
          <div class="quote-bridge-topline">
            <span>Start in under 2 minutes</span>
            <span class="finance-pill"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Financing Available</span>
          </div>
          <strong>Online Quote Available</strong>
          <a class="btn btn-primary2 quote-bridge-cta" href="#quote-form" data-scroll-quote data-track="quote_start">Quote Online Now</a>
          <div class="quote-bridge-callrow">
            <p>Want to speak with a fence specialist first?</p>
            <a class="btn btn-secondary" href="tel:${data.PHONE_RAW}" data-phone-link data-track="phone_click"><i class="fa-solid fa-phone" aria-hidden="true"></i> Call Now</a>
          </div>
        </div>
      </section>
    `;
  }

  function scrollQuote() {
    const section = document.querySelector("#quote-form");
    if (!section) return;
    const header = document.querySelector(".site-header");
    const bridge = document.getElementById("quoteBridge");
    const headerOffset = header ? header.offsetHeight : 0;
    const bridgeOffset = bridge && !bridge.classList.contains("hidden") ? bridge.offsetHeight : 0;
    const top = section.getBoundingClientRect().top + window.pageYOffset - headerOffset - bridgeOffset + 14;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function bindQuoteBridgeBehavior() {
    document.querySelectorAll("[data-scroll-quote]").forEach((node) => {
      if (node.dataset.quoteScrollBound) return;
      node.dataset.quoteScrollBound = "true";
      node.addEventListener("click", (event) => {
        if (node.getAttribute("href") === "#quote-form") event.preventDefault();
        scrollQuote();
      });
    });

    const bridge = document.getElementById("quoteBridge");
    const hero = document.querySelector(".hero");
    const form = document.getElementById("quote-form");
    if (!bridge || !hero || !form || !("IntersectionObserver" in window) || bridge.dataset.visibilityBound) return;
    bridge.dataset.visibilityBound = "true";

    let heroVisible = true;
    let formVisible = false;
    const update = () => {
      const heroRect = hero.getBoundingClientRect();
      const formRect = form.getBoundingClientRect();
      heroVisible = heroRect.bottom > 120 && heroRect.top < window.innerHeight * 0.7;
      formVisible = formRect.top < window.innerHeight * 0.68 && formRect.bottom > 120;
      bridge.classList.toggle("hidden", heroVisible || formVisible);
    };

    const heroObserver = new IntersectionObserver((entries) => {
      heroVisible = entries.some((entry) => entry.isIntersecting);
      update();
    }, { threshold: [0, 0.05, 0.2] });

    const formObserver = new IntersectionObserver((entries) => {
      formVisible = entries.some((entry) => entry.isIntersecting);
      update();
    }, { rootMargin: "-15% 0px -55% 0px", threshold: [0, 0.15, 0.4] });

    heroObserver.observe(hero);
    formObserver.observe(form);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function bindMobileMenu() {
    const toggle = document.querySelector(".mobile-menu-toggle");
    const nav = document.getElementById("globalNav");
    if (!toggle || !nav || toggle.dataset.menuBound) return;
    toggle.dataset.menuBound = "true";
    toggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.innerHTML = `<i class="fa-solid fa-${open ? "xmark" : "bars"}" aria-hidden="true"></i>`;
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
      });
    });
  }

  function renderQuoteBridges() {
    document.querySelectorAll("[data-quote-bridge]").forEach((node) => {
      node.innerHTML = quoteBridge(node.dataset.quoteBridge || "hero");
    });
    bindQuoteBridgeBehavior();
  }

  function sharedSections() {
    return `
      <section class="section reviews">
        <div class="section-head">
          <h2>Recent 5-Star Google Reviews</h2>
          <p>Public customer reviews with the original wording preserved from BlueBird Fence’s Google profile.</p>
        </div>
        <div class="review-feature">
          <div>
            <div class="stars" aria-label="5 star rating">★★★★★</div>
            <strong>5-Star Google Feedback</strong>
            <p>Recent public reviews from local fence projects.</p>
          </div>
          <a class="btn btn-secondary" href="https://share.google/u5kOYh7kBZJY6jBCV" target="_blank" rel="noopener">See More Reviews</a>
        </div>
        <div class="reviews-carousel">
          ${data.sharedReviews.map((review) => `
            <article class="google-review-card">
              <header class="google-review-head">
                <div class="google-avatar google-avatar-${review.tone}">${review.initial}</div>
                <div>
                  <strong>${review.name}</strong>
                  <span>${review.meta}</span>
                </div>
              </header>
              <div class="google-review-rating">
                <span class="google-stars" aria-label="5 star rating">★★★★★</span>
                <span>${review.age}</span>
                <b>NEW</b>
              </div>
              ${review.tag ? `<p class="google-review-tag">${review.tag}</p>` : ""}
              <p class="google-review-text">${review.text}</p>
              ${review.services ? `<div class="google-review-services"><strong>Services</strong><span>${review.services}</span></div>` : ""}
              ${review.photos.length ? `
                <div class="google-review-photos google-review-photos-${review.photos.length}">
                  ${review.photos.map((photo, index) => `<img src="${photo}" alt="${review.name} review photo ${index + 1}" loading="lazy">`).join("")}
                </div>
              ` : ""}
            </article>
          `).join("")}
        </div>
      </section>
      <section class="section financing-section">
        <div class="financing-card">
          <div>
            <p class="eyebrow">Financing Available</p>
            <h2>Start Now, Pay Over Time</h2>
            <p>Ask about financing options for your fence project. Our team helps you match scope, timeline, and payment structure so you can move forward with confidence.</p>
          </div>
          <div class="hero-actions">
            <a class="btn btn-primary2" href="#quote-form">Check Financing Options</a>
            <a class="btn btn-secondary" href="tel:${data.PHONE_RAW}">Call For Financing Help</a>
          </div>
        </div>
      </section>
      <section class="section faq">
        <div class="section-head"><h2>Fence Quote Questions</h2></div>
        ${data.sharedFaq.map((item) => `<details><summary>${item.q}</summary><p>${item.a}</p></details>`).join("")}
      </section>
    `;
  }

  window.renderBlueBirdShell = function renderBlueBirdShell(pathname) {
    const top = document.getElementById("globalHeader");
    const bottom = document.getElementById("globalFooter");
    if (top) top.innerHTML = header(pathname);
    if (bottom) bottom.innerHTML = footer();
    bindMobileMenu();
    document.querySelectorAll("[data-shared-sections]").forEach((node) => {
      node.innerHTML = sharedSections();
    });
    renderQuoteBridges();
  };

  window.renderBlueBirdQuoteBridges = renderQuoteBridges;
  window.initBlueBirdQuoteBridgeBehavior = bindQuoteBridgeBehavior;
})();
