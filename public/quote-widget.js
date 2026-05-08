(function () {
  const RECAPTCHA_SITE_KEY = "6LfkjNwsAAAAAILZSKi0z4qi0GSeUkGG-hkcZaPJ";

  function getCaptchaToken() {
    return new Promise((resolve) => {
      if (!window.grecaptcha || typeof window.grecaptcha.ready !== "function") {
        resolve("");
        return;
      }
      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "contact_capture" })
          .then((token) => resolve(token || ""))
          .catch(() => resolve(""));
      });
    });
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase());
  }

  function formatUSPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  window.initQuoteWidget = function initQuoteWidget(options) {
    const root = document.getElementById(options.containerId || "quoteWidget");
    if (!root) return;

    const state = {
      step: 0,
      serviceArea: "",
      firstName: "",
      phone: "",
      email: "",
      projectType: options.preset?.projectType || "New Fence",
      fenceStyle: options.preset?.fenceStyle || "",
      city: "",
      recaptchaToken: "",
      status: "idle"
    };

    const steps = [
      { key: "area", title: "Where is your project located?" },
      { key: "contact", title: "Who should we prepare this quote for?" },
      { key: "project", title: "What do you need help with?" },
      { key: "city", title: "What city is this project in?" },
      { key: "review", title: "Review and submit" }
    ];

    function payload(stage) {
      return {
        stage,
        source: "BlueBird Fence Main LP",
        leadType: stage === "contact_capture" ? "Partial Fence Quote Contact" : "Fence Quote Request",
        serviceArea: state.serviceArea,
        zipCodeInitial: "",
        firstName: normalizeName(state.firstName),
        phone: formatUSPhone(state.phone),
        email: state.email.trim(),
        projectType: state.projectType,
        fenceStyle: state.fenceStyle,
        mainGoal: "",
        city: state.city,
        zipCodeProject: "",
        fullAddress: "",
        timeline: "",
        pagePath: window.location.pathname,
        landingPage: "Main Quote Landing Page",
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        utmTerm: "",
        utmContent: "",
        gclid: "",
        timestamp: new Date().toISOString(),
        website: "",
        recaptchaToken: stage === "contact_capture" ? state.recaptchaToken : ""
      };
    }

    async function sendLead(stage) {
      if (stage === "contact_capture") {
        state.recaptchaToken = await getCaptchaToken();
      }
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(stage))
      });
      const data = await response.json().catch(() => ({}));
      return Boolean(response.ok && data.ok);
    }

    function render() {
      const s = steps[state.step];
      const progress = ((state.step + 1) / steps.length) * 100;
      let content = "";
      if (s.key === "area") {
        content = `
          <div class="option-grid">
            ${["Greater Boston Metro Area", "Southern New Hampshire"].map((item) => `
              <button class="option" data-select="serviceArea" data-value="${item}" aria-pressed="${state.serviceArea === item}"><span>${item}</span></button>
            `).join("")}
          </div>
        `;
      } else if (s.key === "contact") {
        content = `
          <div class="field-grid">
            <label>First Name<input id="qFirstName" value="${escapeHtml(state.firstName)}" required></label>
            <label>Phone Number<input id="qPhone" value="${escapeHtml(formatUSPhone(state.phone))}" inputmode="tel" required></label>
            <label>Email Address<input id="qEmail" value="${escapeHtml(state.email)}" inputmode="email" required></label>
          </div>
        `;
      } else if (s.key === "project") {
        content = `
          <div class="field-grid">
            <label>Project Type
              <select id="qProjectType">
                ${["New Fence", "Fence Repair", "Commercial Fence", "Temporary/Rental"].map((item) => `<option ${state.projectType === item ? "selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
            <label>Fence Style
              <select id="qFenceStyle">
                ${["Vinyl Fence", "Wood Fence", "Chain Link Fence", "Aluminum Fence", "Commercial Fence"].map((item) => `<option ${state.fenceStyle === item ? "selected" : ""}>${item}</option>`).join("")}
              </select>
            </label>
          </div>
        `;
      } else if (s.key === "city") {
        content = `<div class="field-grid"><label>City<input id="qCity" value="${escapeHtml(state.city)}" required></label></div>`;
      } else {
        content = `
          <div class="summary-box">
            <div class="summary-row"><span>Service Area</span><span>${escapeHtml(state.serviceArea)}</span></div>
            <div class="summary-row"><span>Name</span><span>${escapeHtml(normalizeName(state.firstName))}</span></div>
            <div class="summary-row"><span>Phone</span><span>${escapeHtml(formatUSPhone(state.phone))}</span></div>
            <div class="summary-row"><span>Email</span><span>${escapeHtml(state.email)}</span></div>
            <div class="summary-row"><span>Project</span><span>${escapeHtml(state.projectType)}</span></div>
            <div class="summary-row"><span>Style</span><span>${escapeHtml(state.fenceStyle)}</span></div>
            <div class="summary-row"><span>City</span><span>${escapeHtml(state.city)}</span></div>
          </div>
          ${state.status === "error" ? '<p class="error">Unable to send right now. Please call us.</p>' : ""}
          ${state.status === "sent" ? '<p class="microcopy">Thanks. Your quote request was sent successfully.</p>' : ""}
        `;
      }

      root.innerHTML = `
        <div class="quote-card">
          <div class="progress"><div><i style="width:${progress}%"></i></div></div>
          <div class="form-step">
            <h2>${s.title}</h2>
            ${content}
            <div class="form-actions">
              ${state.step > 0 ? '<button type="button" class="btn back-btn" data-back>Back</button>' : ""}
              <button type="button" class="btn btn-primary2" data-next>${s.key === "review" ? "Send My Quote Request" : "Continue"}</button>
            </div>
          </div>
        </div>
      `;
      bind();
    }

    function bind() {
      root.querySelectorAll("[data-select]").forEach((node) => {
        node.addEventListener("click", () => {
          state[node.dataset.select] = node.dataset.value;
          render();
        });
      });
      root.querySelector("[data-back]")?.addEventListener("click", () => {
        state.step = Math.max(0, state.step - 1);
        render();
      });
      root.querySelector("[data-next]")?.addEventListener("click", async () => {
        const firstName = root.querySelector("#qFirstName");
        const phone = root.querySelector("#qPhone");
        const email = root.querySelector("#qEmail");
        const project = root.querySelector("#qProjectType");
        const style = root.querySelector("#qFenceStyle");
        const city = root.querySelector("#qCity");
        if (firstName) state.firstName = firstName.value.trim();
        if (phone) state.phone = phone.value.trim();
        if (email) state.email = email.value.trim();
        if (project) state.projectType = project.value;
        if (style) state.fenceStyle = style.value;
        if (city) state.city = city.value.trim();

        if (steps[state.step].key === "area" && !state.serviceArea) return;
        if (steps[state.step].key === "contact") {
          if (!state.firstName || !state.phone || !state.email) return;
          await sendLead("contact_capture");
        }
        if (steps[state.step].key === "city" && !state.city) return;
        if (steps[state.step].key === "review") {
          state.status = "sending";
          render();
          const ok = await sendLead("quote_complete");
          state.status = ok ? "sent" : "error";
          render();
          return;
        }
        state.step = Math.min(steps.length - 1, state.step + 1);
        render();
      });
      root.querySelector("#qPhone")?.addEventListener("input", (e) => {
        e.target.value = formatUSPhone(e.target.value);
      });
    }

    render();
  };
})();
