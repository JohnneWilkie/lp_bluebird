(() => {
const GEOAPIFY_API_KEY = "d5bb983df17a4e15aebf7c4906e6e005";
const RECAPTCHA_SITE_KEY = "6LfkjNwsAAAAAILZSKi0z4qi0GSeUkGG-hkcZaPJ";
const TRACKING_KEY = "bluebird_tracking";
const PARTIAL_SENT_KEY = "bluebird_financing_partial_sent";
const DETAILS_SENT_KEY = "bluebird_financing_details_sent";
const FINAL_SENT_KEY = "bluebird_financing_final_sent";
const LEAD_SESSION_KEY = "bluebird_financing_lead_session_id";

const PRICES = {
  vinyl: {
    name: "6'H White Solid Privacy",
    shortName: "White Solid Privacy",
    pricePerFoot: 46,
    image: "/assets/vinyl-fence.jpg"
  },
  cedar: {
    name: "6'H No. 1 Cedar Stockade",
    shortName: "Cedar Stockade",
    pricePerFoot: 58,
    image: "/assets/cedar-stockade.jpg"
  },
  chain: {
    name: "4'H Black Chain Link Fence",
    shortName: "Black Chain Link",
    pricePerFoot: 33,
    image: "/assets/chain-link-fence.jpg"
  },
  aluminum: {
    name: "54\" Black Aluminum Commercial Grade",
    shortName: "Commercial Aluminum",
    pricePerFoot: 61,
    image: "/assets/aluminum-fence.jpg"
  },
  other: {
    name: "Other Fence Style",
    shortName: "Other Fence Style",
    pricePerFoot: null,
    image: "/assets/hero-fence.jpg",
    customQuote: true
  }
};

const REMOVAL_PRICE_PER_FOOT = 6;
const GATE_PRICE = 800;
const PAYMENT_COUNT = 12;
const STORAGE_KEY = "bluebird_finance_quote_v5";
const PRICING_STEP_COUNT = 4;

const state = {
  step: 0,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  projectAddress: "",
  city: "",
  stateCode: "",
  zipCode: "",
  fenceType: "",
  linearFeet: "",
  hasRemoval: false,
  gates: 0,
  website: ""
};

let addressTimer = 0;
let addressAbortController = null;
let isSending = false;

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const formSteps = document.getElementById("formSteps");
const formImage = document.getElementById("formImage");
const quoteSummary = document.getElementById("quoteSummary");

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!stored.firstName && stored.fullName) {
      const parts = String(stored.fullName).trim().split(/\s+/);
      stored.firstName = parts.shift() || "";
      stored.lastName = parts.join(" ");
    }
    delete stored.step;
    Object.assign(state, stored);
    state.step = 0;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function saveState() {
  const { step, ...persistedState } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  }[char]));
}

function track(eventName, detail = {}) {
  if (!eventName) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...detail });
  window.dispatchEvent(new CustomEvent("bluebird_tracking", { detail: { event: eventName, ...detail } }));
}

function getStoredTracking() {
  try {
    return JSON.parse(sessionStorage.getItem(TRACKING_KEY) || "{}");
  } catch {
    return {};
  }
}

function getTracking() {
  const params = new URLSearchParams(window.location.search);
  const existing = getStoredTracking();
  const captured = {
    utmSource: params.get("utm_source") || existing.utmSource || "",
    utmMedium: params.get("utm_medium") || existing.utmMedium || "",
    utmCampaign: params.get("utm_campaign") || existing.utmCampaign || "",
    utmTerm: params.get("utm_term") || existing.utmTerm || "",
    utmContent: params.get("utm_content") || existing.utmContent || "",
    gclid: params.get("gclid") || existing.gclid || "",
    msclkid: params.get("msclkid") || existing.msclkid || "",
    fbclid: params.get("fbclid") || existing.fbclid || ""
  };
  try {
    sessionStorage.setItem(TRACKING_KEY, JSON.stringify(captured));
  } catch {}
  return captured;
}

function getLeadSessionId() {
  try {
    const existing = localStorage.getItem(LEAD_SESSION_KEY);
    if (existing) return existing;
    const id = `fin_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`;
    localStorage.setItem(LEAD_SESSION_KEY, id);
    return id;
  } catch {
    return `fin_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function getCaptchaToken(action = "contact_capture") {
  if (!window.grecaptcha || !RECAPTCHA_SITE_KEY) return Promise.resolve("");
  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action })
        .then(resolve)
        .catch(() => resolve(""));
    });
  });
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

function parseLinearFeet(value) {
  const cleaned = String(value || "").replace(/[^0-9.]/g, "");
  return Math.max(0, Number(cleaned) || 0);
}

function parseWholeNumber(value) {
  const cleaned = String(value || "").replace(/\D/g, "");
  return Math.max(0, Math.floor(Number(cleaned) || 0));
}

function getFirstName() {
  return String(state.firstName || "").trim();
}

function getProjectAddress() {
  return state.projectAddress;
}

function getQuote() {
  const fence = PRICES[state.fenceType] || PRICES.vinyl;
  const linearFeet = parseLinearFeet(state.linearFeet);
  const gates = parseWholeNumber(state.gates);
  const hasCustomQuote = Boolean(fence.customQuote);
  const fenceTotal = hasCustomQuote ? 0 : linearFeet * fence.pricePerFoot;
  const removalTotal = state.hasRemoval ? linearFeet * REMOVAL_PRICE_PER_FOOT : 0;
  const gateTotal = gates * GATE_PRICE;
  const total = hasCustomQuote ? 0 : fenceTotal + removalTotal + gateTotal;
  const monthly = total / PAYMENT_COUNT;

  return { fence, linearFeet, gates, fenceTotal, removalTotal, gateTotal, total, monthly, hasCustomQuote };
}

function syncInputs() {
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const phone = document.getElementById("phone");
  const email = document.getElementById("email");
  const projectAddress = document.getElementById("projectAddress");
  const linearFeet = document.getElementById("linearFeet");
  const hasRemoval = document.getElementById("hasRemoval");
  const gates = document.getElementById("gates");
  const website = document.getElementById("website");

  if (firstName) state.firstName = formatName(firstName.value);
  if (lastName) state.lastName = formatName(lastName.value);
  if (phone) state.phone = formatUSPhone(phone.value);
  if (email) state.email = email.value.trim();
  if (projectAddress) state.projectAddress = projectAddress.value.trim();
  if (linearFeet) state.linearFeet = linearFeet.value.trim();
  if (hasRemoval) state.hasRemoval = hasRemoval.checked;
  if (gates) state.gates = parseWholeNumber(gates.value);
  if (website) state.website = website.value.trim();
}

function requireField(key, message) {
  syncInputs();
  if (!String(state[key] || "").trim()) return showError(message);
  return true;
}

function requireEmail() {
  syncInputs();
  if (!state.email) return showError("Please add your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) return showError("Please enter a valid email address.");
  return true;
}

function showError(message) {
  render(message);
  return false;
}

function contactStep() {
  return `
    <div class="form-step">
      <h2>Who should we prepare this quote for?</h2>
      <p>Build your fence. See your payment. Get your fence estimate in minutes and preview your monthly payment with 0% APR financing before you apply.</p>
      <div class="field-grid">
        <label>
          <span class="field-label">First Name</span>
          <input id="firstName" value="${escapeHtml(state.firstName)}" autocomplete="given-name" required>
        </label>
        <label>
          <span class="field-label">Last Name</span>
          <input id="lastName" value="${escapeHtml(state.lastName)}" autocomplete="family-name" required>
        </label>
        <label>
          <span class="field-label">Phone Number</span>
          <input id="phone" value="${escapeHtml(formatUSPhone(state.phone))}" inputmode="tel" autocomplete="tel" required>
        </label>
        <label>
          <span class="field-label">Email Address</span>
          <input id="email" value="${escapeHtml(state.email)}" inputmode="email" autocomplete="email" required>
        </label>
        <label class="span-full address-field">
          <span class="field-label">Project Address</span>
          <input id="projectAddress" value="${escapeHtml(state.projectAddress)}" autocomplete="off" placeholder="123 Main Street, Boston, MA 02110" required>
          <div class="autocomplete-menu hidden" id="addressSuggestions" role="listbox" aria-label="Address suggestions"></div>
          <small>Start typing and choose the matching U.S. address.</small>
        </label>
      </div>
      ${actions("", "Continue to Fence Details")}
    </div>
  `;
}

function fenceStep() {
  return `
    <div class="form-step">
      <h2>Choose your fence style</h2>
      <p>Select the option that most closely matches the fence you are planning.</p>
      <div class="option-grid">
        ${Object.entries(PRICES).map(([key, fence]) => `
          <button class="option" type="button" data-fence-type="${key}" aria-pressed="${state.fenceType === key}">
            ${fence.customQuote ? genericFenceIcon() : `<img src="${fence.image}" alt="${escapeHtml(fence.shortName)}">`}
            <span>
              <strong>${escapeHtml(fence.name)}</strong>
              <span>${fence.customQuote ? "Custom review needed" : "Material and installation estimate"}</span>
            </span>
            <b aria-hidden="true"></b>
          </button>
        `).join("")}
      </div>
      ${actions("Back", "Continue to Project Details")}
    </div>
  `;
}

function projectDetailsStep() {
  const quote = getQuote();

  return `
    <div class="form-step">
      <h2>Tell us about your fence project</h2>
      <p>Enter the approximate linear feet and add any gates or existing fence removal.</p>
      <div class="quote-input-grid">
        <label>
          <span class="field-label">Linear Feet Needed</span>
          <input id="linearFeet" type="text" value="${escapeHtml(state.linearFeet)}" inputmode="numeric" autocomplete="off">
        </label>
        <label>
          <span class="field-label">Number of Gates</span>
          <input id="gates" type="number" min="0" step="1" value="${quote.gates}" inputmode="numeric">
        </label>
        <div class="toggle-row">
          <span>Existing fence removal
            <small>Include old fence removal in my estimate</small>
          </span>
          <label class="switch" aria-label="Include old fence removal">
            <input id="hasRemoval" type="checkbox" ${state.hasRemoval ? "checked" : ""}>
            <i></i>
          </label>
        </div>
        <div class="configuration-note">
          <strong>Your estimate will include material, installation, selected gates and removal if selected.</strong>
        </div>
      </div>
      ${actions("Back", "See My Estimated Payment", "btn-finance")}
    </div>
  `;
}

function genericFenceIcon() {
  return `
    <span class="option-icon fence-generic-icon" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
    </span>
  `;
}

function estimateStep() {
  return `
    <div class="form-step">
      <h2>Your estimated payment is ready</h2>
      <p>Review your estimated monthly payment and project total before requesting the financing application.</p>
      ${estimateBox()}
      ${selectedSummary()}
      <p class="finance-disclaimer">0% APR financing available to qualified buyers on approved credit. Subject to credit approval. Terms, conditions and program eligibility requirements may apply. The payment shown is an estimate and may vary based on final project scope and lender approval.</p>
      ${actions("Edit Details", "Request Financing Application", "btn-finance")}
    </div>
  `;
}

function estimateBox() {
  const quote = getQuote();
  if (quote.hasCustomQuote) {
    return `
      <div class="live-estimate" aria-live="polite">
        <p>Custom fence style selected</p>
        <strong class="monthly-price estimate-review">Review needed</strong>
        <span class="total-price">BlueBird Fence will confirm material, installation and financing details for this fence style.</span>
      </div>
    `;
  }

  return `
    <div class="live-estimate" aria-live="polite">
      <p>Estimated 0% APR financing</p>
      <strong class="monthly-price">12x ${currency.format(quote.monthly)}</strong>
      <span class="total-price">Estimated project total: ${currency.format(quote.total)} for material and installation</span>
    </div>
  `;
}

function selectedSummary() {
  const quote = getQuote();
  const rows = [
    ["Fence Type", quote.fence.name],
    ["Linear Feet", `${quote.linearFeet || 0} ft`],
    ["Gates", String(quote.gates)],
    ["Existing Fence Removal", state.hasRemoval ? "Included" : "Not selected"]
  ];

  return `<div class="summary-box">${rows.map(([label, value]) => `<div class="summary-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`).join("")}</div>`;
}

function thanksStep() {
  return `
    <div class="form-step thanks-step">
      <p class="eyebrow dark">Request received</p>
      <h2>Thank you. Your financing request is ready.</h2>
      <p>BlueBird Fence has the project details needed to continue. The next step is to confirm your site details, final measurements and financing eligibility.</p>
      <p class="success-note">A team member can follow up with the financing application and confirm the final quote after reviewing the project.</p>
      <p class="finance-disclaimer">0% APR financing is available to qualified buyers on approved credit. Subject to credit approval. Terms, conditions and program eligibility requirements may apply.</p>
    </div>
  `;
}

function actions(backLabel, nextLabel, nextClass = "", type = "button") {
  const label = isSending && nextLabel === "Request Financing Application" ? "Sending..." : nextLabel;
  return `
    <div class="form-actions">
      ${backLabel ? `<button class="btn btn-secondary" type="button" data-back>${backLabel}</button>` : ""}
      <button class="btn btn-primary ${nextClass}" type="${type}" data-next ${isSending ? "disabled" : ""}>${label}</button>
    </div>
  `;
}

function setQuoteSummary() {
  const quote = getQuote();
  const lines = [
    "BlueBird Fence Online Quote",
    `First Name: ${state.firstName}`,
    `Last Name: ${state.lastName}`,
    `Name: ${[state.firstName, state.lastName].filter(Boolean).join(" ")}`,
    `Phone: ${state.phone}`,
    `Email: ${state.email}`,
    `Project Address: ${getProjectAddress()}`,
    `Fence Type: ${quote.fence.name}`,
    `Linear Feet: ${quote.linearFeet}`,
    `Fence Price: ${quote.hasCustomQuote ? "Custom review needed" : `${currency.format(quote.fence.pricePerFoot)} per ft`}`,
    `Old Fence Removal: ${state.hasRemoval ? "Yes" : "No"}`,
    `Removal Total: ${currency.format(quote.removalTotal)}`,
    `Gates: ${quote.gates}`,
    `Gate Total: ${currency.format(quote.gateTotal)}`,
    `Estimated Total: ${quote.hasCustomQuote ? "Custom review needed" : currency.format(quote.total)}`,
    `12-Month 0% APR Estimate: ${quote.hasCustomQuote ? "Custom review needed" : `12x ${currency.format(quote.monthly)}`}`
  ];
  if (quoteSummary) quoteSummary.value = lines.join("\n");
}

function buildPayload(stage, recaptchaToken = "") {
  const quote = getQuote();
  const eventName = stage === "contact_capture"
    ? "Lead"
    : stage === "details_capture"
      ? "LeadDetails"
      : "LeadComplete";
  const leadType = stage === "contact_capture"
    ? "Partial Financing Calculator Contact"
    : stage === "details_capture"
      ? "Financing Calculator Project Details"
      : "Financing Calculator Request";
  const payload = {
    stage,
    source: "BlueBird Fence Financing Calculator",
    leadType,
    leadSessionId: getLeadSessionId(),
    firstName: formatName(state.firstName),
    lastName: formatName(state.lastName),
    phone: formatUSPhone(state.phone),
    email: state.email,
    projectAddress: getProjectAddress(),
    fullAddress: getProjectAddress(),
    city: state.city,
    state: state.stateCode,
    stateCode: state.stateCode,
    zipCode: state.zipCode,
    zipCodeProject: state.zipCode,
    pagePath: window.location.pathname,
    landingPage: "August Special Financing Calculator",
    ...getTracking(),
    timestamp: new Date().toISOString(),
    website: state.website || "",
    recaptchaToken
  };

  if (stage !== "contact_capture") {
    Object.assign(payload, {
      serviceArea: "Boston Metro & Southern New Hampshire",
      projectType: "Fence Financing",
      fenceType: state.fenceType,
      fenceName: quote.fence.name,
      fenceShortName: quote.fence.shortName,
      fenceStyle: quote.fence.name,
      linearFeet: quote.linearFeet,
      gates: quote.gates,
      hasRemoval: state.hasRemoval,
      fencePricePerFoot: quote.fence.pricePerFoot || "",
      fenceTotal: quote.fenceTotal,
      removalTotal: quote.removalTotal,
      gateTotal: quote.gateTotal,
      estimatedTotal: quote.hasCustomQuote ? "" : quote.total,
      monthlyEstimate: quote.hasCustomQuote ? "" : quote.monthly,
      paymentCount: PAYMENT_COUNT,
      hasCustomQuote: quote.hasCustomQuote,
      quoteSummary: quoteSummary?.value || "",
      mainGoal: "0% APR Financing"
    });
  }

  return window.BlueBirdMeta?.enrichPayload
    ? window.BlueBirdMeta.enrichPayload(payload, eventName)
    : payload;
}

async function sendFinancingLead(stage, silent = false) {
  syncInputs();
  setQuoteSummary();
  const recaptchaToken = stage === "contact_capture" ? await getCaptchaToken("contact_capture") : "";
  const cacheKey = stage === "contact_capture"
    ? PARTIAL_SENT_KEY
    : stage === "details_capture"
      ? DETAILS_SENT_KEY
      : FINAL_SENT_KEY;
  const payload = buildPayload(stage, recaptchaToken);
  const fingerprint = JSON.stringify(payload);
  if (sessionStorage.getItem(cacheKey) === fingerprint) return true;

  isSending = stage !== "contact_capture";
  if (isSending) render();

  try {
    const response = await fetch("/api/financing-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: fingerprint
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.message || "Submit failed");
    sessionStorage.setItem(cacheKey, fingerprint);

    if (stage === "contact_capture") {
      track("contact_capture_submit", { leadType: payload.leadType });
    } else if (stage === "details_capture") {
      window.BlueBirdMeta?.trackLeadDetails(payload);
      if (!window.BlueBirdMeta) track("details_capture_submit", { leadType: payload.leadType, fenceStyle: payload.fenceStyle });
    } else {
      window.BlueBirdMeta?.trackLead(payload);
      window.BlueBirdMeta?.trackLeadComplete(payload);
      if (!window.BlueBirdMeta) track("quote_submit", { leadType: payload.leadType, fenceStyle: payload.fenceStyle });
    }
    return true;
  } catch {
    if (!silent) track("quote_submit_error", { step: stage });
    return false;
  } finally {
    isSending = false;
  }
}

function updateVisual() {
  const quote = getQuote();
  formImage.src = quote.fence.image;
  formImage.alt = `${quote.fence.shortName} fence`;
  setQuoteSummary();
}

function render(error = "") {
  const steps = [contactStep, fenceStep, projectDetailsStep, estimateStep, thanksStep];
  const currentStep = Math.min(state.step, steps.length - 1);
  if (currentStep >= PRICING_STEP_COUNT) {
    progressText.textContent = "Request received";
    progressBar.style.width = "100%";
  } else {
    progressText.textContent = `Step ${currentStep + 1} of ${PRICING_STEP_COUNT}`;
    progressBar.style.width = `${((currentStep + 1) / PRICING_STEP_COUNT) * 100}%`;
  }
  formSteps.innerHTML = `${steps[currentStep]()}${error ? `<p class="error">${escapeHtml(error)}</p>` : ""}`;

  bindEvents();
  updateVisual();
}

function bindEvents() {
  formSteps.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.id === "phone") input.value = formatUSPhone(input.value);
      syncInputs();
      saveState();
      if (input.id === "projectAddress") scheduleAddressAutocomplete(input.value);
      updateVisual();
    });

    input.addEventListener("change", () => {
      syncInputs();
      saveState();
      updateVisual();
    });
  });

  formSteps.querySelectorAll("[data-fence-type]").forEach((button) => {
    button.addEventListener("click", () => {
      state.fenceType = button.dataset.fenceType || "vinyl";
      saveState();
      render();
    });
  });

  formSteps.querySelector("[data-back]")?.addEventListener("click", () => {
    syncInputs();
    state.step = Math.max(0, state.step - 1);
    saveState();
    render();
  });

  formSteps.querySelector("[data-next]")?.addEventListener("click", nextStep);
  bindAddressMenu();
}

async function nextStep() {
  if (isSending) return;
  renderAddressSuggestions([]);
  syncInputs();

  if (state.step === 0) {
    if (!requireField("firstName", "Please add your first name.")) return;
    if (!requireField("lastName", "Please add your last name.")) return;
    if (!requireField("phone", "Please add your phone number.")) return;
    if (!requireEmail()) return;
    if (!requireField("projectAddress", "Please add the full project address.")) return;
    await sendFinancingLead("contact_capture", true);
  }

  if (state.step === 1 && !state.fenceType) {
    showError("Please choose a fence style.");
    return;
  }

  if (state.step === 2 && getQuote().linearFeet <= 0) {
    showError("Please enter the number of linear feet needed.");
    return;
  }

  if (state.step === 2) {
    const sent = await sendFinancingLead("details_capture", false);
    if (!sent) {
      showError("We could not save your project details right now. Please try again or call BlueBird Fence.");
      return;
    }
  }

  if (state.step === 3) {
    const sent = await sendFinancingLead("quote_complete", false);
    if (!sent) {
      showError("We could not send your financing request right now. Please try again or call BlueBird Fence.");
      return;
    }
  }

  if (state.step >= 4) return;

  state.step = Math.min(4, state.step + 1);
  saveState();
  render();
}

function bindAddressMenu() {
  const input = document.getElementById("projectAddress");
  const menu = document.getElementById("addressSuggestions");
  if (!input || !menu) return;

  input.addEventListener("focus", () => {
    if (menu.children.length) menu.classList.remove("hidden");
  });

  input.addEventListener("blur", () => {
    setTimeout(() => menu.classList.add("hidden"), 150);
  });
}

function scheduleAddressAutocomplete(value) {
  const query = String(value || "").trim();
  clearTimeout(addressTimer);
  if (query.length < 4) {
    renderAddressSuggestions([]);
    return;
  }

  addressTimer = setTimeout(() => fetchAddressSuggestions(query), 260);
}

async function fetchAddressSuggestions(query) {
  if (addressAbortController) addressAbortController.abort();
  addressAbortController = new AbortController();

  const params = new URLSearchParams({
    text: query,
    filter: "countrycode:us",
    limit: "5",
    format: "json",
    apiKey: GEOAPIFY_API_KEY
  });

  try {
    const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params}`, {
      signal: addressAbortController.signal
    });
    if (!response.ok) throw new Error("Address lookup failed");
    const data = await response.json();
    renderAddressSuggestions(Array.isArray(data.results) ? data.results : []);
  } catch (error) {
    if (error.name !== "AbortError") renderAddressSuggestions([]);
  }
}

function renderAddressSuggestions(results) {
  const menu = document.getElementById("addressSuggestions");
  if (!menu) return;

  if (!results.length) {
    menu.innerHTML = "";
    menu.classList.add("hidden");
    return;
  }

  menu.innerHTML = results.map((item, index) => {
    const address = item.formatted || [item.address_line1, item.address_line2].filter(Boolean).join(", ");
    const cityLine = [item.city || item.county, item.state_code || item.state, item.postcode].filter(Boolean).join(", ");
    return `
      <button type="button" class="autocomplete-item" data-address-index="${index}">
        <strong>${escapeHtml(address)}</strong>
        ${cityLine ? `<span>${escapeHtml(cityLine)}</span>` : ""}
      </button>
    `;
  }).join("");

  menu.classList.remove("hidden");
  menu.querySelectorAll("[data-address-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = results[Number(button.dataset.addressIndex)];
      if (!selected) return;
      state.projectAddress = selected.formatted || button.querySelector("strong")?.textContent || "";
      state.city = selected.city || "";
      state.stateCode = selected.state_code || "";
      state.zipCode = selected.postcode || "";
      saveState();

      const input = document.getElementById("projectAddress");
      if (input) input.value = state.projectAddress;
      renderAddressSuggestions([]);
      updateVisual();
    });
  });
}

document.getElementById("quoteForm").addEventListener("submit", (event) => {
  event.preventDefault();
});

loadState();
render();
})();
