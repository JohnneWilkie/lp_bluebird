(function () {
  const PIXEL_ID = "1285141176620318";
  const EVENT_PREFIX = "bbf";

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

  function cookie(name) {
    return document.cookie.split("; ").find((row) => row.startsWith(`${name}=`))?.split("=")[1] || "";
  }

  function eventId(name) {
    return `${EVENT_PREFIX}_${name}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function pagePayload(extra = {}) {
    return {
      pagePath: window.location.pathname,
      contentName: document.title || "BlueBird Fence",
      timestamp: new Date().toISOString(),
      fbp: cookie("_fbp"),
      fbc: cookie("_fbc"),
      ...extra
    };
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

  function trackViewContent() {
    const id = eventId("ViewContent");
    const payload = pagePayload();
    trackBrowser("ViewContent", { content_name: payload.contentName, page_path: payload.pagePath }, id);
    sendCapi("ViewContent", payload, id);
  }

  function trackCall(label = "Call Now") {
    const id = eventId("clique_chamada");
    const payload = pagePayload({ contentName: label || "Phone Click" });
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
      city: payload.city || ""
    };
  }

  window.BlueBirdMeta = {
    eventId,
    enrichPayload(payload = {}, eventName = "event") {
      return {
        ...payload,
        metaEventId: payload.metaEventId || eventId(eventName),
        fbp: cookie("_fbp"),
        fbc: cookie("_fbc")
      };
    },
    trackLead(payload = {}) {
      const id = payload.metaEventId || eventId("Lead");
      trackBrowser("Lead", leadPayload(payload), id);
    },
    trackLeadComplete(payload = {}) {
      const id = payload.metaEventId || eventId("LeadComplete");
      trackBrowser("LeadComplete", leadPayload(payload), id, true);
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
