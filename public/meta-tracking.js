(function () {
  const PIXEL_ID = "1285141176620318";
  const EVENT_PREFIX = "bbf";
  const VISITOR_ID_KEY = "bluebird_meta_external_id";
  const LEAD_DATA_KEY = "bluebird_meta_lead_data";
  const ATTRIBUTION_KEY = "bluebird_attribution";
  const config = window.BLUEBIRD_TRACKING_CONFIG || {};

  window._fbq = window._fbq || [];
  if (!window.fbq) {
    const fbq = window.fbq = function () {
      fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const first = document.getElementsByTagName("script")[0];
    first.parentNode.insertBefore(script, first);
  }

  fbq("init", PIXEL_ID);
  fbq("track", "PageView");

  if (config.microsoftUetTagId && !window.UET) {
    (function (w, d, t, r, u) {
      let f;
      let n;
      let i;
      w[u] = w[u] || [];
      f = function () {
        const options = { ti: config.microsoftUetTagId, enableAutoSpaTracking: true };
        options.q = w[u];
        w[u] = new UET(options);
        w[u].push("pageLoad");
      };
      n = d.createElement(t);
      n.src = r;
      n.async = true;
      n.onload = n.onreadystatechange = function () {
        const state = this.readyState;
        if (state && state !== "loaded" && state !== "complete") return;
        f();
        n.onload = n.onreadystatechange = null;
      };
      i = d.getElementsByTagName(t)[0];
      i.parentNode.insertBefore(n, i);
    })(window, document, "script", "https://bat.bing.com/bat.js", "uetq");
  }

  function cookie(name) {
    const value = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1] || "";
    return value ? decodeURIComponent(value) : "";
  }

  function setCookie(name, value, maxAge = 7776000) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }

  function storedAttribution() {
    try {
      return JSON.parse(sessionStorage.getItem(ATTRIBUTION_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function captureAttribution() {
    const params = new URLSearchParams(window.location.search);
    const current = storedAttribution();
    const next = {
      utmSource: params.get("utm_source") || current.utmSource || "",
      utmMedium: params.get("utm_medium") || current.utmMedium || "",
      utmCampaign: params.get("utm_campaign") || current.utmCampaign || "",
      utmTerm: params.get("utm_term") || current.utmTerm || "",
      utmContent: params.get("utm_content") || current.utmContent || "",
      gclid: params.get("gclid") || current.gclid || "",
      msclkid: params.get("msclkid") || current.msclkid || "",
      fbclid: params.get("fbclid") || current.fbclid || ""
    };
    try {
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
    } catch {}
    return next;
  }

  function mergeFilled(...sources) {
    const output = {};
    sources.forEach((source) => {
      Object.entries(source || {}).forEach(([key, value]) => {
        const text = typeof value === "string" ? value.trim() : value;
        if (text === undefined || text === null || text === "") {
          if (!(key in output)) output[key] = "";
          return;
        }
        output[key] = value;
      });
    });
    return output;
  }

  function pushDataLayer(eventName, payload = {}) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      page_path: payload.pagePath || window.location.pathname,
      service_area: payload.serviceArea || "",
      project_type: payload.projectType || "",
      fence_style: payload.fenceStyle || "",
      city: payload.city || "",
      state: inferState(payload),
      utm_source: payload.utmSource || "",
      utm_medium: payload.utmMedium || "",
      utm_campaign: payload.utmCampaign || "",
      utm_term: payload.utmTerm || "",
      utm_content: payload.utmContent || "",
      gclid: payload.gclid || "",
      msclkid: payload.msclkid || "",
      fbclid: payload.fbclid || "",
      event_id: payload.metaEventId || ""
    });
    window.dispatchEvent(new CustomEvent("bluebird_tracking", {
      detail: { event: eventName, ...payload }
    }));
  }

  function sendUetEvent(eventName, payload = {}) {
    if (!window.uetq) return;
    window.uetq.push("event", eventName, {
      event_category: "conversion",
      event_label: payload.leadType || payload.contentName || eventName,
      page_path: payload.pagePath || window.location.pathname,
      msclkid: payload.msclkid || ""
    });
  }

  function ensureExternalId() {
    try {
      const existing = localStorage.getItem(VISITOR_ID_KEY) || cookie(VISITOR_ID_KEY);
      if (existing) return existing;
      const id = `bb_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`}`;
      localStorage.setItem(VISITOR_ID_KEY, id);
      setCookie(VISITOR_ID_KEY, id, 31536000);
      return id;
    } catch {
      return cookie(VISITOR_ID_KEY);
    }
  }

  function ensureFbc() {
    const existing = cookie("_fbc");
    if (existing) return existing;
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (!fbclid) return "";
    const value = `fb.1.${Date.now()}.${fbclid}`;
    setCookie("_fbc", value);
    return value;
  }

  function ensureFbp() {
    const existing = cookie("_fbp");
    if (existing) return existing;
    const value = `fb.1.${Date.now()}.${Math.floor(Math.random() * 2147483647)}`;
    setCookie("_fbp", value);
    return value;
  }

  function storedLeadData() {
    try {
      return JSON.parse(localStorage.getItem(LEAD_DATA_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function inferState(payload = {}) {
    if (payload.state) return payload.state;
    if (payload.serviceArea === "Southern New Hampshire") return "nh";
    if (payload.serviceArea === "Greater Boston Metro Area") return "ma";
    return "";
  }

  function rememberLeadData(payload = {}) {
    const current = storedLeadData();
    const next = {
      ...current,
      firstName: payload.firstName || current.firstName || "",
      phone: payload.phone || current.phone || "",
      email: payload.email || current.email || "",
      city: payload.city || current.city || "",
      state: inferState(payload) || current.state || "",
      country: payload.country || current.country || "us",
      zipCodeProject: payload.zipCodeProject || current.zipCodeProject || "",
      zipCodeInitial: payload.zipCodeInitial || current.zipCodeInitial || "",
      serviceArea: payload.serviceArea || current.serviceArea || ""
    };
    try {
      localStorage.setItem(LEAD_DATA_KEY, JSON.stringify(next));
    } catch {}
    return next;
  }

  function matchPayload(payload = {}) {
    const stored = storedLeadData();
    const merged = mergeFilled(captureAttribution(), stored, payload);
    return {
      ...merged,
      state: inferState(merged),
      country: merged.country || "us",
      externalId: merged.externalId || ensureExternalId(),
      fbp: ensureFbp(),
      fbc: ensureFbc()
    };
  }

  function eventId(name) {
    return `${EVENT_PREFIX}_${name}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function pagePayload(extra = {}) {
    return matchPayload({
      pagePath: window.location.pathname,
      contentName: document.title || "BlueBird Fence",
      timestamp: new Date().toISOString(),
      ...extra
    });
  }

  function sendCapi(eventName, payload, id) {
    try {
      navigator.sendBeacon?.("/api/meta-event", new Blob([JSON.stringify({
        eventName,
        eventId: id,
        ...payload
      })], { type: "application/json" })) || fetch("/api/meta-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, eventId: id, ...payload }),
        keepalive: true
      }).catch(() => {});
    } catch {
      fetch("/api/meta-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, eventId: id, ...payload }),
        keepalive: true
      }).catch(() => {});
    }
  }

  function trackBrowser(eventName, params = {}, id, custom = false) {
    const method = custom ? "trackCustom" : "track";
    fbq(method, eventName, params, { eventID: id });
  }

  function advancedMatchData(payload = {}) {
    const phone = String(payload.phone || "").replace(/\D/g, "");
    return Object.fromEntries(Object.entries({
      em: payload.email || "",
      ph: phone,
      fn: payload.firstName || "",
      ct: payload.city || "",
      st: inferState(payload),
      zp: payload.zipCodeProject || payload.zipCodeInitial || "",
      country: payload.country || "us",
      external_id: payload.externalId || ensureExternalId()
    }).filter(([, value]) => String(value || "").trim()));
  }

  function applyAdvancedMatching(payload = {}) {
    const data = advancedMatchData(payload);
    if (Object.keys(data).length) fbq("init", PIXEL_ID, data);
  }

  function trackViewContent() {
    const id = eventId("ViewContent");
    const payload = pagePayload();
    applyAdvancedMatching(payload);
    trackBrowser("ViewContent", { content_name: payload.contentName, page_path: payload.pagePath }, id);
    sendCapi("ViewContent", payload, id);
  }

  function trackCall(label = "Call Now") {
    const id = eventId("clique_chamada");
    const payload = pagePayload({ contentName: label || "Phone Click", metaEventId: id });
    pushDataLayer("clique_chamada", payload);
    pushDataLayer("phone_call_click", payload);
    sendUetEvent("phone_call_click", payload);
    trackBrowser("clique_chamada", {
      content_name: payload.contentName,
      page_path: payload.pagePath
    }, id, true);
    sendCapi("clique_chamada", payload, id);
  }

  function leadPayload(payload = {}) {
    return {
      content_name: payload.leadType || "Fence Quote Lead",
      page_path: payload.pagePath || window.location.pathname,
      service_area: payload.serviceArea || "",
      project_type: payload.projectType || "",
      fence_style: payload.fenceStyle || "",
      city: payload.city || "",
      state: inferState(payload),
      country: payload.country || "us"
    };
  }

  window.BlueBirdMeta = {
    eventId,
    enrichPayload(payload = {}, eventName = "event") {
      const enriched = matchPayload({
        ...payload,
        metaEventId: payload.metaEventId || eventId(eventName)
      });
      if (eventName === "Lead" || eventName === "LeadComplete") rememberLeadData(enriched);
      return enriched;
    },
    trackLead(payload = {}) {
      const stored = rememberLeadData(payload);
      const enriched = matchPayload({ ...stored, ...payload });
      applyAdvancedMatching(enriched);
      const id = payload.metaEventId || eventId("Lead");
      enriched.metaEventId = id;
      pushDataLayer("contact_capture_submit", enriched);
      pushDataLayer("generate_lead", enriched);
      sendUetEvent("lead", enriched);
      trackBrowser("Lead", leadPayload(enriched), id);
    },
    trackLeadComplete(payload = {}) {
      const stored = rememberLeadData(payload);
      const enriched = matchPayload({ ...stored, ...payload });
      applyAdvancedMatching(enriched);
      const id = payload.metaEventId || eventId("LeadComplete");
      enriched.metaEventId = id;
      pushDataLayer("quote_submit", enriched);
      pushDataLayer("lead_complete", enriched);
      sendUetEvent("lead_complete", enriched);
      trackBrowser("LeadComplete", leadPayload(enriched), id, true);
    },
    trackCall
  };

  document.addEventListener("DOMContentLoaded", () => {
    trackViewContent();
    document.body.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="tel:"]');
      if (!link) return;
      trackCall(link.textContent.trim() || link.getAttribute("aria-label") || "Phone Click");
    });
  });
})();
