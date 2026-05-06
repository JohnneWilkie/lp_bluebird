const RECAPTCHA_SITE_KEY = "6LfkjNwsAAAAAILZSKi0z4qi0GSeUkGG-hkcZaPJ";
const PHONE = "17817252193";
const STORAGE_KEY = "bluebird_quote_state_v4";
const TRACKING_KEY = "bluebird_tracking";
const PARTIAL_SENT_KEY = "bluebird_partial_sent";
const FINAL_SENT_KEY = "bluebird_final_sent";

const imageMap = {
  "Vinyl Fence": "/assets/vinyl-fence.jpg",
  "Wood Fence": "/assets/wood-fence.jpg",
  "Chain Link Fence": "/assets/chain-link-fence.jpg",
  "Aluminum Fence": "/assets/aluminum-fence.jpg",
  "Commercial Fence": "/assets/commercial-fence.jpg",
  "Fence Repair": "/assets/fence-repair.jpg",
  "Temporary / Rental Fence": "/assets/temporary-fence.jpg",
  default: "/assets/hero-fence.jpg"
};

const citySuggestions = {
  "Greater Boston Metro Area": [
    "Acton", "Andover", "Arlington", "Bedford", "Belmont", "Beverly", "Billerica", "Boston", "Boxborough",
    "Braintree", "Brookline", "Burlington", "Cambridge", "Canton", "Chelmsford", "Concord", "Danvers",
    "Dedham", "Everett", "Framingham", "Gloucester", "Haverhill", "Lexington", "Lincoln", "Lowell",
    "Lynn", "Malden", "Marblehead", "Marlborough", "Maynard", "Medford", "Melrose", "Methuen", "Natick",
    "Needham", "Newton", "North Andover", "Peabody", "Reading", "Revere", "Salem", "Saugus", "Somerville",
    "Stoneham", "Sudbury", "Swampscott", "Tewksbury", "Wakefield", "Waltham", "Watertown", "Wayland",
    "Wellesley", "Wenham", "Westford", "Weston", "Wilmington", "Winchester", "Woburn"
  ],
  "Southern New Hampshire": [
    "Amherst", "Atkinson", "Auburn", "Bedford", "Bow", "Brookline", "Chester", "Concord", "Derry",
    "Dover", "Durham", "Epping", "Exeter", "Goffstown", "Hampstead", "Hampton", "Hampton Falls",
    "Hollis", "Hooksett", "Hudson", "Kingston", "Litchfield", "Londonderry", "Manchester", "Merrimack",
    "Milford", "Nashua", "New Boston", "Newfields", "Newington", "Newmarket", "Newton", "North Hampton",
    "Pelham", "Plaistow", "Portsmouth", "Raymond", "Rochester", "Rye", "Salem", "Sandown", "Seabrook",
    "Somersworth", "Stratham", "Windham"
  ]
};

const services = [
  {
    title: "Vinyl Fence",
    slug: "/vinyl-fence",
    text: "Low-maintenance privacy with a clean residential look.",
    cta: "Price Vinyl Fence",
    image: imageMap["Vinyl Fence"],
    quotePreset: { fenceStyle: "Vinyl Fence", projectType: "New Fence" },
    secondaryPageEnabled: false
  },
  {
    title: "Wood Fence",
    slug: "/wood-fence",
    text: "Classic privacy and backyard transformation projects.",
    cta: "Price Wood Fence",
    image: imageMap["Wood Fence"],
    quotePreset: { fenceStyle: "Wood Fence", projectType: "New Fence" },
    secondaryPageEnabled: false
  },
  {
    title: "Chain Link Fence",
    slug: "/chain-link-fence",
    text: "Practical, durable and cost-effective for pets, security and boundaries.",
    cta: "Price Chain Link",
    image: imageMap["Chain Link Fence"],
    quotePreset: { fenceStyle: "Chain Link Fence", projectType: "New Fence" },
    secondaryPageEnabled: false
  },
  {
    title: "Aluminum Fence",
    slug: "/aluminum-fence",
    text: "Premium-looking fencing for pools, front yards and decorative security.",
    cta: "Price Aluminum Fence",
    image: imageMap["Aluminum Fence"],
    quotePreset: { fenceStyle: "Aluminum Fence", projectType: "New Fence" },
    secondaryPageEnabled: false
  },
  {
    title: "Commercial Fence",
    slug: "/commercial-fence",
    text: "Built for businesses, access control, security and long-term durability.",
    cta: "Price Commercial Fence",
    image: imageMap["Commercial Fence"],
    quotePreset: { fenceStyle: "Commercial Fence", projectType: "Commercial Fence" },
    secondaryPageEnabled: false
  },
  {
    title: "Fence Repair",
    slug: "/fence-repair",
    text: "Damaged, leaning or broken fence? Start the repair quote online.",
    cta: "Price Fence Repair",
    image: imageMap["Fence Repair"],
    quotePreset: { projectType: "Fence Repair" },
    secondaryPageEnabled: false
  },
  {
    title: "Temporary / Rental Fence",
    slug: "/temporary-fence",
    text: "Temporary fencing for job sites, events and property protection.",
    cta: "Price Temporary Fence",
    image: imageMap["Temporary / Rental Fence"],
    quotePreset: { projectType: "Temporary/Rental", fenceStyle: "Chain Link Fence" },
    secondaryPageEnabled: false
  }
];

const state = {
  step: 0,
  serviceArea: "",
  zipCodeInitial: "",
  firstName: "",
  phone: "",
  email: "",
  projectType: "",
  fenceStyle: "",
  mainGoal: "",
  city: "",
  zipCodeProject: "",
  fullAddress: "",
  timeline: "",
  website: "",
  recaptchaToken: "",
  finalStatus: "idle"
};

function formatPhoneLabelFromDigits(rawPhone) {
  const digits = String(rawPhone || "").replace(/\D/g, "");
  const ten = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (ten.length !== 10) return rawPhone;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

function syncGlobalPhone() {
  const phoneLabel = formatPhoneLabelFromDigits(PHONE);
  document.querySelectorAll("[data-phone-link]").forEach((node) => {
    node.setAttribute("href", `tel:${PHONE}`);
  });
  document.querySelectorAll("[data-phone-display]").forEach((node) => {
    node.textContent = phoneLabel;
  });
}

function track(eventName, detail = {}) {
  if (!eventName) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...detail });
  window.dispatchEvent(new CustomEvent("bluebird_tracking", { detail: { event: eventName, ...detail } }));
}

function getTracking() {
  const params = new URLSearchParams(window.location.search);
  const existing = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || "{}");
  const captured = {
    utmSource: params.get("utm_source") || existing.utmSource || "",
    utmMedium: params.get("utm_medium") || existing.utmMedium || "",
    utmCampaign: params.get("utm_campaign") || existing.utmCampaign || "",
    utmTerm: params.get("utm_term") || existing.utmTerm || "",
    utmContent: params.get("utm_content") || existing.utmContent || "",
    gclid: params.get("gclid") || existing.gclid || ""
  };
  sessionStorage.setItem(TRACKING_KEY, JSON.stringify(captured));
  return captured;
}

function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    Object.assign(state, JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    saveState();
  }
}

function scrollQuote() {
  const section = document.querySelector("#quote-form");
  if (!section) return;
  const rect = section.getBoundingClientRect();
  const targetTop = window.scrollY + rect.top - Math.max(80, (window.innerHeight - rect.height) * 0.28);
  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
}

function applyPreset(preset = {}, origin = "card") {
  Object.assign(state, preset, { finalStatus: "idle" });
  saveState();
  updateFormImage();
  renderForm();
  track("service_preset_selected", { origin, ...preset });
  track("quote_start", { origin });
  scrollQuote();
}

function renderServiceCards(targetId, detailed = false) {
  const container = document.getElementById(targetId);
  container.innerHTML = services.map((service) => `
    <article class="${detailed ? "detail-card" : "service-card"}">
      ${detailed ? "" : `<img src="${service.image}" alt="${service.title} project by BlueBird Fence" loading="lazy" width="600" height="360">`}
      <div class="${detailed ? "" : "service-body"}">
        <h3>${service.title}</h3>
        <p>${service.text}</p>
        <div class="card-actions">
          <button class="btn btn-primary" data-service="${service.title}">${detailed ? service.cta : "Start Online Price"}</button>
          ${service.secondaryPageEnabled ? `<a class="text-link" href="${service.slug}">Learn More</a>` : ""}
        </div>
      </div>
    </article>
  `).join("");

  container.querySelectorAll("[data-service]").forEach((button) => {
    button.addEventListener("click", () => {
      const service = services.find((item) => item.title === button.dataset.service);
      track("service_card_click", { service: service.title });
      applyPreset(service.quotePreset, service.title);
    });
  });
}

const staticReviews = [
  {
    initial: "T",
    tone: "orange",
    name: "Tao Zhang",
    meta: "3 reviews • 2 photos",
    age: "3 weeks ago",
    tag: "",
    text: "BlueBird Fence did an outstanding job replacing our fence gate after it was destroyed by the winter winds. They came out for the onsite measurement and provided a quote the same day, which made everything incredibly convenient. The team handled the work professionally and installed a brand-new gate that looks even nicer than the original. The build quality is solid, and the whole experience was smooth from start to finish. Really appreciate their reliability and craftsmanship. Highly recommend them for any fence work.",
    services: "General repairs & maintenance",
    photos: ["/assets/reviews/tao-zhang-gate-1.jpg", "/assets/reviews/tao-zhang-gate-2.jpg"]
  },
  {
    initial: "B",
    tone: "photo",
    name: "Barry Forde",
    meta: "10 reviews • 2 photos",
    age: "2 weeks ago",
    tag: "Reasonable price",
    text: "The recently installed fence has significantly enhanced our property's aesthetics and security. The team demonstrated exceptional professionalism and skill throughout the entire process. Their meticulous attention to detail was evident in every aspect of the installation. We are thoroughly impressed with the quality of workmanship and the efficient completion of the project. This new fence is a testament to their outstanding job.",
    services: "Chain link fence installation",
    photos: []
  },
  {
    initial: "M",
    tone: "blue",
    name: "Muriel Fudala",
    meta: "Local Guide • 19 reviews • 1 photo",
    age: "2 weeks ago",
    tag: "Reasonable price",
    text: "Bluebird Fence did a beautiful job of replacing sections of my big wooden fence that had been destroyed by a falling tree limb. The new sections are all pressure treated wood, the posts are cemented into the ground, and everything matches the existing fence. It looks great. And communications and timing were good.",
    services: "Custom fabrication",
    photos: []
  },
  {
    initial: "J",
    tone: "photo",
    name: "Jennifer Cazenave",
    meta: "2 reviews • 1 photo",
    age: "2 weeks ago",
    tag: "Great price",
    text: "I highly recommend BlueBird Fence! They are very professional: they quickly set up an appointment to see the work we needed to have done and to provide an estimate. After we signed the agreement, they completed the work in a timely fashion. The fence repairs, along with the installation of two gates, all look great. We are very pleased and highly recommend them.",
    services: "Dog fence installation, Privacy fence installation, Wood fence installation",
    photos: ["/assets/reviews/jennifer-cazenave-gate.jpg"]
  },
  {
    initial: "J",
    tone: "green",
    name: "John Ballantine Jr.",
    meta: "2 reviews • 2 photos",
    age: "2 weeks ago",
    tag: "Reasonable price",
    text: "Terrific oak gate installed that ties into split rail fence. Efficient prompt service and great price. Support of crafts people",
    services: "Wood fence installation",
    photos: []
  },
  {
    initial: "W",
    tone: "red",
    name: "Will Mustoe",
    meta: "2 reviews • 0 photos",
    age: "5 days ago",
    tag: "",
    text: "Extremely happy with my new fence. The communication was great from the beginning. The crew showed up as scheduled and did a great job ! Super friendly and polite. They did a great job with the clean up after the job was completed. I would absolutely recommend bluebird fence to anyone looking for one",
    services: "",
    photos: []
  }
];

function renderReviews() {
  const container = document.getElementById("reviewsCarousel");
  if (!container) return;
  container.innerHTML = staticReviews.map((review) => `
    <article class="google-review-card">
      <header class="google-review-head">
        <div class="google-avatar google-avatar-${review.tone}">${escapeHtml(review.initial)}</div>
        <div>
          <strong>${escapeHtml(review.name)}</strong>
          <span>${escapeHtml(review.meta)}</span>
        </div>
      </header>
      <div class="google-review-rating">
        <span class="google-stars" aria-label="5 star rating">★★★★★</span>
        <span>${escapeHtml(review.age)}</span>
        <b>NEW</b>
      </div>
      ${review.tag ? `<p class="google-review-tag">${escapeHtml(review.tag)}</p>` : ""}
      <p class="google-review-text">${escapeHtml(review.text)}</p>
      ${review.services ? `<div class="google-review-services"><strong>Services</strong><span>${escapeHtml(review.services)}</span></div>` : ""}
      ${review.photos.length ? `
        <div class="google-review-photos google-review-photos-${review.photos.length}">
          ${review.photos.map((photo, index) => `<img src="${photo}" alt="${escapeHtml(review.name)} review photo ${index + 1}" loading="lazy">`).join("")}
        </div>
      ` : ""}
    </article>
  `).join("");
}

const steps = [
  {
    key: "region",
    title: "Where is the project located?",
    sub: "Choose the region that best matches the property.",
    render: () => optionStep(["Greater Boston Metro Area", "Southern New Hampshire"], "serviceArea", "region_selected", "", "Continue"),
    validate: () => requireField("serviceArea", "Please choose your service area.")
  },
  {
    key: "contact",
    title: "Who should we prepare this for?",
    sub: "We’ll keep your project details connected so the next step is easier.",
    onEnter: () => track("contact_info_started"),
    render: () => fields(`
      <div class="field-grid">
        <label><span class="field-label"><i>01</i> First Name</span><input id="firstName" value="${escapeHtml(formatName(state.firstName))}" autocomplete="given-name" required></label>
        <label><span class="field-label"><i>02</i> Phone Number</span><input id="phone" value="${escapeHtml(formatUSPhone(state.phone))}" inputmode="tel" autocomplete="tel" placeholder="(781) 725-2193" required></label>
        <label><span class="field-label"><i>03</i> Email Address</span><input id="email" value="${escapeHtml(state.email)}" inputmode="email" autocomplete="email" required></label>
        <div class="captcha-wrap" aria-hidden="true"></div>
        <p class="email-note">Your information stays attached to this fence plan so the team can pick up where you left off.</p>
      </div>
    `, "Continue to Fence Details"),
    validate: () => requireField("firstName", "Please add your first name.") && requireField("phone", "Please add your phone number.") && requireEmail(),
    onComplete: () => track("contact_info_submitted")
  },
  {
    key: "project",
    title: () => state.firstName ? `${formatName(state.firstName)}, what type of project is this?` : "What type of project is this?",
    render: () => optionStep(["New Fence", "Fence Repair", "Commercial Fence", "Temporary/Rental"], "projectType", "project_type_selected", "", "Next"),
    validate: () => requireField("projectType", "Please choose a project type.")
  },
  {
    key: "style",
    title: "Choose the fence style",
    sub: "Choose the material or style that best matches what you have in mind.",
    render: () => optionStep(["Vinyl Fence", "Wood Fence", "Chain Link Fence", "Aluminum Fence", "Commercial Fence"], "fenceStyle", "fence_style_selected", "", "Continue", true),
    validate: () => requireField("fenceStyle", "Please choose a fence style.")
  },
  {
    key: "city",
    title: "What city is the project in?",
    sub: "Start typing and choose a suggestion if it matches. You can also type another city.",
    render: () => cityStep(),
    validate: () => requireField("city", "Please add the project city."),
    onComplete: () => track("location_info_submitted")
  },
  {
    key: "snapshot",
    title: () => state.firstName ? `${formatName(state.firstName)}, your fence plan is ready to continue` : "Your fence plan is ready to continue",
    sub: "BlueBird Fence has the core details needed to move your quote conversation forward.",
    onEnter: () => sendLead("quote_complete", false),
    render: () => snapshotStep(),
    validate: () => true
  }
];

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function formatName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
}

function formatUSPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function getCaptchaToken(action = "contact_capture") {
  return new Promise((resolve) => {
    if (!window.grecaptcha || typeof window.grecaptcha.ready !== "function") {
      console.warn("reCAPTCHA v3 is not loaded.");
      resolve("");
      return;
    }

    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(RECAPTCHA_SITE_KEY, { action })
        .then((token) => resolve(token || ""))
        .catch((error) => {
          console.warn("reCAPTCHA v3 failed:", error);
          resolve("");
        });
    });
  });
}

function renderCaptcha() {
  return;
}

function fields(html, nextLabel) {
  return `${html}<div class="form-actions">${backButton()}<button class="btn btn-primary" type="button" data-next>${nextLabel}</button></div>`;
}

function optionStep(options, key, eventName, extra = "", nextLabel = "Continue", withImages = false) {
  return `
    <div class="option-grid">
      ${options.map((option) => `
        <button class="option" type="button" data-option-key="${key}" data-option-value="${option}" aria-pressed="${state[key] === option}">
          ${withImages ? `<img src="${imageMap[option] || imageMap.default}" alt="${option}" loading="lazy">` : ""}
          ${withImages ? "" : `<b class="option-check">${state[key] === option ? "✓" : ""}</b>`}
          <span>${option}</span>
        </button>
      `).join("")}
    </div>
    ${extra}
    <div class="form-actions">${backButton()}<button class="btn btn-primary" type="button" data-next data-event="${eventName}">${nextLabel}</button></div>
  `;
}

function cityStep() {
  const listId = "citySuggestions";
  const menuId = "cityMenu";
  const suggestions = [...new Set([
    ...(citySuggestions[state.serviceArea] || []),
    ...citySuggestions["Greater Boston Metro Area"],
    ...citySuggestions["Southern New Hampshire"]
  ])].sort();

  return fields(`
    <div class="field-grid">
      <label>City
        <input id="city" value="${escapeHtml(state.city)}" list="${listId}" autocomplete="address-level2" placeholder="Start typing your city" data-city-input="true">
      </label>
      <datalist id="${listId}">
        ${suggestions.map((city) => `<option value="${city}"></option>`).join("")}
      </datalist>
      <div class="city-menu hidden" id="${menuId}" role="listbox" aria-label="City suggestions"></div>
    </div>
  `, "View My Quote Snapshot");
}

function backButton() {
  return state.step > 0 && state.step < steps.length - 1 ? `<button class="btn back-btn" type="button" data-back>Back</button>` : "";
}

function snapshotStep() {
  const rows = [
    ["Service Area", state.serviceArea],
    ["Name", formatName(state.firstName)],
    ["Phone", formatUSPhone(state.phone)],
    ["Email", state.email],
    ["Project", state.projectType],
    ["Style", state.fenceStyle],
    ["City", state.city]
  ].filter(([, value]) => value);
  const statusCopy = {
    idle: "Preparing your quote snapshot...",
    sending: "Preparing your quote snapshot...",
    sent: "Thanks, your quote request was received. Our team will contact you as quickly as possible. If you prefer immediate help, call us now.",
    error: "Your details are still saved here. Please call us if this screen does not update."
  }[state.finalStatus || "idle"];

  return `
    <div class="quote-snapshot">
      <div class="snapshot-meter">
        <span>Online quote progress</span>
        <strong>${state.finalStatus === "sent" ? "Ready" : "Processing"}</strong>
      </div>
      <div class="summary-box">${rows.map(([label, value]) => `<div class="summary-row"><span>${label}</span><span>${escapeHtml(value)}</span></div>`).join("")}</div>
      <p class="${state.finalStatus === "error" ? "error" : "microcopy"}">${statusCopy}</p>
      <div class="form-actions">
        <a class="btn btn-primary snapshot-call" href="tel:${PHONE}" data-track="phone_click">Call Now</a>
      </div>
    </div>
  `;
}

function renderForm(error = "") {
  const current = steps[state.step];
  const title = typeof current.title === "function" ? current.title() : current.title;
  const fakeProgress = [18, 62, 74, 86, 94, 100];
  document.getElementById("progressText").textContent = "";
  document.getElementById("progressBar").style.width = `${fakeProgress[state.step] || 100}%`;
  document.getElementById("formSteps").innerHTML = `
    <div class="form-step">
      <h2>${title}</h2>
      ${current.sub ? `<p>${current.sub}</p>` : ""}
      ${current.render()}
      ${error ? `<p class="error">${error}</p>` : ""}
    </div>
  `;
  bindFormEvents();
  setTimeout(renderCaptcha, 100);
  if (current.onEnter && current.enteredForStep !== state.step) {
    current.enteredForStep = state.step;
    current.onEnter();
  }
}

function bindFormEvents() {
  document.querySelectorAll("[data-option-key]").forEach((button) => {
    button.addEventListener("click", () => {
      state[button.dataset.optionKey] = button.dataset.optionValue;
      state.finalStatus = "idle";
      saveState();
      if (button.dataset.optionKey === "fenceStyle") updateFormImage();
      track(button.closest(".form-step").querySelector("[data-next]")?.dataset.event, { value: button.dataset.optionValue });
      renderForm();
    });
  });
  document.querySelectorAll("input").forEach((input) => input.addEventListener("input", () => {
    if (input.id === "phone") input.value = formatUSPhone(input.value);
    syncInputs();
    state.finalStatus = "idle";
    saveState();
  }));
  bindCityMenu();
  document.querySelector("[data-next]")?.addEventListener("click", nextStep);
  document.querySelector("[data-back]")?.addEventListener("click", () => {
    syncInputs();
    state.step = Math.max(0, state.step - 1);
    state.finalStatus = "idle";
    saveState();
    renderForm();
  });
  bindGlobalTracking();
}

function bindCityMenu() {
  const input = document.getElementById("city");
  const menu = document.getElementById("cityMenu");
  if (!input || !menu) return;

  const allSuggestions = [...new Set([
    ...(citySuggestions[state.serviceArea] || []),
    ...citySuggestions["Greater Boston Metro Area"],
    ...citySuggestions["Southern New Hampshire"]
  ])].sort();

  const render = (value) => {
    const term = String(value || "").trim().toLowerCase();
    if (!term) {
      menu.classList.add("hidden");
      menu.innerHTML = "";
      return;
    }
    const matches = allSuggestions.filter((city) => city.toLowerCase().includes(term)).slice(0, 8);
    if (!matches.length) {
      menu.classList.add("hidden");
      menu.innerHTML = "";
      return;
    }
    menu.innerHTML = matches.map((city) => `<button type="button" class="city-menu-item" data-city-value="${escapeHtml(city)}">${escapeHtml(city)}</button>`).join("");
    menu.classList.remove("hidden");
    menu.querySelectorAll("[data-city-value]").forEach((node) => {
      node.addEventListener("click", () => {
        input.value = node.dataset.cityValue || "";
        state.city = input.value.trim();
        menu.classList.add("hidden");
        saveState();
      });
    });
  };

  input.addEventListener("focus", () => render(input.value));
  input.addEventListener("input", () => render(input.value));
  input.addEventListener("blur", () => {
    setTimeout(() => menu.classList.add("hidden"), 120);
  });
}

function syncInputs() {
  ["firstName", "phone", "email", "city", "website"].forEach((key) => {
    const node = document.getElementById(key);
    if (node && key === "firstName") state[key] = formatName(node.value);
    else if (node && key === "phone") state[key] = formatUSPhone(node.value);
    else if (node) state[key] = node.value.trim();
  });
state.recaptchaToken = "";
}

function setError(message) {
  renderForm(message);
  return false;
}

function requireField(key, message) {
  syncInputs();
  if (!String(state[key] || "").trim()) return setError(message);
  return true;
}

function requireEmail() {
  syncInputs();
  if (!state.email.trim()) return setError("Please add your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return setError("Please enter a valid email address.");
  return true;
}

function requireCaptcha() {
  return true;
}

function nextStep() {
  syncInputs();
  const current = steps[state.step];
  if (!current.validate()) return;
  current.onComplete?.();
  track("quote_step_completed", { step: current.key, stepNumber: state.step + 1 });
  state.step = Math.min(steps.length - 1, state.step + 1);
  saveState();
  renderForm();
}

function updateFormImage() {
  const image = document.getElementById("formImage");
  const src = imageMap[state.fenceStyle] || imageMap.default;
  image.src = src;
  image.alt = `${state.fenceStyle || "Fence"} quote preview`;
}

function buildPayload(stage) {
  return {
    stage,
    source: "BlueBird Fence Main LP",
    leadType: stage === "contact_capture" ? "Partial Fence Quote Contact" : "Fence Quote Request",
    serviceArea: state.serviceArea,
    zipCodeInitial: "",
    firstName: formatName(state.firstName),
    phone: formatUSPhone(state.phone),
    email: state.email,
    projectType: state.projectType,
    fenceStyle: state.fenceStyle,
    mainGoal: "",
    city: state.city,
    zipCodeProject: "",
    fullAddress: "",
    timeline: "",
    pagePath: window.location.pathname,
    landingPage: "Main Quote Landing Page",
    ...getTracking(),
    timestamp: new Date().toISOString(),
    website: state.website,
    recaptchaToken: stage === "contact_capture" ? state.recaptchaToken : ""
  };
}

async function sendLead(stage, silent) {
  syncInputs();
  const cacheKey = FINAL_SENT_KEY;
  const fingerprint = JSON.stringify(buildPayload(stage));
  if (sessionStorage.getItem(cacheKey) === fingerprint) return true;
  if (stage === "quote_complete") {
    state.finalStatus = "sending";
    saveState();
    renderForm();
  }
  try {
    const response = await fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: fingerprint
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Submit failed");
    sessionStorage.setItem(cacheKey, fingerprint);
    if (stage === "quote_complete") {
      state.finalStatus = "sent";
      saveState();
      track("quote_submit", { serviceArea: state.serviceArea, projectType: state.projectType, fenceStyle: state.fenceStyle });
      renderForm();
    } else {
      track("contact_capture_submit", { serviceArea: state.serviceArea });
    }
    return true;
  } catch {
    if (stage === "quote_complete") {
      state.finalStatus = "error";
      saveState();
      track("quote_submit_error", { step: "snapshot" });
      renderForm();
    } else if (!silent) {
      track("quote_submit_error", { step: "contact_capture" });
    }
    return false;
  }
}

function bindGlobalTracking() {
  document.querySelectorAll("[data-track]").forEach((node) => {
    if (node.dataset.trackingBound) return;
    node.dataset.trackingBound = "true";
    node.addEventListener("click", () => {
      track(node.dataset.track, { label: node.textContent.trim() });
      if (node.dataset.trackExtra) {
        node.dataset.trackExtra.split(/\s+/).forEach((eventName) => track(eventName, { label: node.textContent.trim() }));
      }
    });
  });
}

function initAreaCards() {
  document.querySelectorAll("[data-area]").forEach((button) => {
    button.addEventListener("click", () => {
      state.serviceArea = button.dataset.area;
      state.step = 0;
      state.finalStatus = "idle";
      saveState();
      track("region_selected", { value: state.serviceArea });
      track("quote_start", { origin: "area_card" });
      renderForm();
      scrollQuote();
    });
  });
}

function initScrollButtons() {
  document.querySelectorAll("[data-scroll-quote]").forEach((button) => {
    button.addEventListener("click", () => {
      track("quote_start", { label: button.textContent.trim() });
      scrollQuote();
    });
  });
}

function initAbandonmentTracking() {
  let submitted = false;
  window.addEventListener("bluebird_tracking", (event) => {
    if (event.detail.event === "quote_submit") submitted = true;
  });
  window.addEventListener("beforeunload", () => {
    if (!submitted && state.step > 0 && (state.firstName || state.phone || state.projectType || state.fenceStyle)) {
      track("form_abandonment", { step: state.step + 1 });
    }
  });
}

loadState();
if (state.projectType === "New Fence Installation") state.projectType = "New Fence";
if (state.projectType === "Commercial Fencing") state.projectType = "Commercial Fence";
if (state.projectType === "Temporary / Rental Fence" || state.projectType === "Temporary / Rental") state.projectType = "Temporary/Rental";
state.mainGoal = "";
state.timeline = "";
state.zipCodeInitial = "";
state.zipCodeProject = "";
getTracking();
syncGlobalPhone();
renderServiceCards("quickServiceCards", false);
renderServiceCards("detailServiceCards", true);
renderReviews();
renderForm();
updateFormImage();
bindGlobalTracking();
initAreaCards();
initScrollButtons();
initAbandonmentTracking();

const reviewObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      track("review_section_view");
      reviewObserver.disconnect();
    }
  });
}, { threshold: 0.35 });
reviewObserver.observe(document.getElementById("reviews"));
