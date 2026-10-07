(function () {
  const variants = {
    general: {
      h1: "9 out of 10 homeowners choose BlueBird.",
      support: "Local Fence Installation. Start Your Free Quote Online.",
      cta: "Start My Free Fence Quote"
    },
    install: {
      h1: "9 out of 10 homeowners choose BlueBird.",
      support: "Professional Fence Installation. Start Your Free Quote Online.",
      cta: "Start My Free Fence Quote"
    },
    wood: {
      h1: "9 out of 10 homeowners choose BlueBird.",
      support: "Wood Fence Installation. Start Your Free Quote Online.",
      cta: "Start My Wood Fence Quote"
    },
    vinyl: {
      h1: "9 out of 10 homeowners choose BlueBird.",
      support: "Vinyl Fence Installation. Start Your Free Quote Online.",
      cta: "Start My Vinyl Fence Quote"
    },
    chainlink: {
      h1: "9 out of 10 homeowners choose BlueBird.",
      support: "Chain Link Fence Installation. Start Your Free Quote Online.",
      cta: "Start My Chain Link Quote"
    },
    commercial: {
      h1: "Commercial Fence Installation for Your Business",
      support: "Secure Your Property. Start Your Free Commercial Fence Quote.",
      cta: "Start My Commercial Quote"
    }
  };

  const materialCopy = {
    "Vinyl Fence": {
      title: "Vinyl Fence Installation",
      description: "Low-maintenance fencing installed for lasting privacy, clean curb appeal and dependable performance."
    },
    "Wood Fence": {
      title: "Wood Fence Installation",
      description: "Natural, customizable fencing installed for privacy, warmth and a timeless property finish."
    },
    "Chain Link Fence": {
      title: "Chain Link Fence Installation",
      description: "Durable, practical fencing installed for secure boundaries, pets and commercial properties."
    },
    "Aluminum Fence": {
      title: "Aluminum Fence Installation",
      description: "Refined, low-maintenance fencing installed for security without blocking visibility."
    },
    "Commercial Fence": {
      title: "Commercial Fence Installation",
      description: "Reliable perimeter fencing installed for businesses, multifamily properties and active sites."
    }
  };

  const params = new URLSearchParams(window.location.search);
  const requestedIntent = String(params.get("bb_intent") || "general").toLowerCase();
  const intent = Object.prototype.hasOwnProperty.call(variants, requestedIntent) ? requestedIntent : "general";
  const variant = variants[intent];

  document.body.dataset.bbIntent = intent;

  const h1 = document.querySelector("[data-intent-h1]");
  const support = document.querySelector("[data-intent-support]");
  const cta = document.querySelector("[data-intent-cta]");
  if (h1) h1.textContent = variant.h1;
  if (support) support.textContent = variant.support;
  if (cta) cta.textContent = variant.cta;

  function refineMaterialCards() {
    document.querySelectorAll("#detailServiceCards .detail-card").forEach((card) => {
      const heading = card.querySelector("h3");
      const description = card.querySelector("p");
      if (!heading) return;
      const sourceTitle = heading.textContent.trim();
      const copy = materialCopy[sourceTitle];
      if (!copy) return;
      heading.textContent = copy.title;
      if (description) description.textContent = copy.description;
      if (intent !== "general" && copy.title.toLowerCase().startsWith(intent === "chainlink" ? "chain link" : intent)) {
        card.classList.add("is-intent-match");
      }
    });
  }

  function prioritizeInstallationReviews() {
    const container = document.getElementById("reviewsCarousel");
    if (!container) return;
    const priority = ["Barry Forde", "Will Mustoe", "Jennifer Cazenave", "John Ballantine Jr."];
    const cards = Array.from(container.children);
    cards.sort((a, b) => {
      const nameA = a.querySelector(".google-review-head strong")?.textContent.trim() || "";
      const nameB = b.querySelector(".google-review-head strong")?.textContent.trim() || "";
      const indexA = priority.indexOf(nameA);
      const indexB = priority.indexOf(nameB);
      return (indexA < 0 ? priority.length : indexA) - (indexB < 0 ? priority.length : indexB);
    });
    cards.forEach((card) => container.appendChild(card));
  }

  function syncIntentCtas() {
    document.querySelectorAll(".root-lp .header-quote, .root-lp .quote-bridge-cta").forEach((node) => {
      node.textContent = variant.cta;
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    syncIntentCtas();
    refineMaterialCards();
    prioritizeInstallationReviews();
  });
})();
