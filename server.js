import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import express from "express";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, ".env"));

const PORT = Number(process.env.PORT || 8091);
const WEBHOOK_URL = String(process.env.N8N_BLUEBIRD_QUOTE_WEBHOOK_URL || "").trim();
const RECAPTCHA_SECRET = String(process.env.BLUEBIRD_RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET_KEY || "").trim();
const META_PIXEL_ID = String(process.env.META_PIXEL_ID || "1285141176620318").trim();
const META_CAPI_ACCESS_TOKEN = String(process.env.META_CAPI_ACCESS_TOKEN || "").trim();
const META_TEST_EVENT_CODE = String(process.env.META_TEST_EVENT_CODE || "").trim();
const GTM_CONTAINER_ID = String(process.env.GTM_CONTAINER_ID || "GTM-PJZHCFKS").trim();
const MAX_BODY_BYTES = "32kb";
const PUBLIC_ROOT = path.join(__dirname, "public");
const rateBuckets = new Map();

const quoteSchema = z.object({
  stage: z.enum(["contact_capture", "quote_complete"]).optional(),
  source: z.string().optional(),
  leadType: z.string().optional(),
  serviceArea: z.string().trim().min(1),
  zipCodeInitial: z.string().optional(),
  firstName: z.string().trim().min(1),
  lastName: z.string().optional(),
  phone: z.string().trim().min(7),
  email: z.string().trim().email().optional().or(z.literal("")),
  projectType: z.string().optional(),
  fenceStyle: z.string().optional(),
  mainGoal: z.string().optional(),
  city: z.string().optional(),
  zipCodeProject: z.string().optional(),
  fullAddress: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  timeline: z.string().optional(),
  pagePath: z.string().optional(),
  landingPage: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmTerm: z.string().optional(),
  utmContent: z.string().optional(),
  gclid: z.string().optional(),
  timestamp: z.string().optional(),
  recaptchaToken: z.string().optional(),
  metaEventId: z.string().optional(),
  externalId: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  website: z.string().optional()
}).superRefine((data, ctx) => {
  const stage = data.stage || "quote_complete";
  if (!String(data.email || "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["email"],
      message: "Email is required."
    });
  }
  if (stage === "quote_complete" && !String(data.projectType || "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["projectType"],
      message: "Project type is required."
    });
  }
  if (stage === "quote_complete" && !String(data.fenceStyle || "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["fenceStyle"],
      message: "Fence style is required."
    });
  }
  if (stage === "quote_complete" && !String(data.city || "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["city"],
      message: "City is required."
    });
  }
  if (String(data.website || "").trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["website"],
      message: "Spam protection rejected this request."
    });
  }
});

const app = express();

function googleTagManagerHead() {
  if (!GTM_CONTAINER_ID) return "";
  return `    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');</script>
    <!-- End Google Tag Manager -->
`;
}

function googleTagManagerBody() {
  if (!GTM_CONTAINER_ID) return "";
  return `  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
`;
}

function injectGoogleTagManager(html) {
  let output = String(html || "");
  if (!GTM_CONTAINER_ID) return output;
  const hasHeadSnippet = output.includes(GTM_CONTAINER_ID) && output.includes("googletagmanager.com/gtm.js");
  if (!hasHeadSnippet) {
    output = output.replace(/<\/head>/i, `${googleTagManagerHead()}</head>`);
  }
  if (!output.includes(`googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`)) {
    output = output.replace(/<body([^>]*)>/i, `<body$1>\n${googleTagManagerBody()}`);
  }
  return output;
}

function publicHtmlPath(requestPath) {
  let pathname = "/";
  try {
    pathname = decodeURIComponent(String(requestPath || "/").split("?")[0]);
  } catch {
    return "";
  }
  const requested = pathname === "/" ? "/index.html" : pathname;
  const candidates = path.extname(requested) ? [requested] : [`${requested}.html`, path.join(requested, "index.html")];

  for (const candidate of candidates) {
    const fullPath = path.resolve(PUBLIC_ROOT, `.${candidate.startsWith("/") ? candidate : `/${candidate}`}`);
    if (!fullPath.startsWith(`${PUBLIC_ROOT}${path.sep}`) || path.extname(fullPath) !== ".html") continue;
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) return fullPath;
  }
  return "";
}

function sendHtmlWithGlobalTags(res, filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  res.type("html");
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.send(injectGoogleTagManager(html));
}

app.use(express.json({
  limit: MAX_BODY_BYTES,
  type: ["application/json", "application/*+json"]
}));
app.use((req, res, next) => {
  if (!["GET", "HEAD"].includes(req.method) || req.path.startsWith("/api/")) return next();
  const filePath = publicHtmlPath(req.path);
  if (!filePath) return next();
  if (req.method === "HEAD") {
    res.type("html");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.end();
  }
  return sendHtmlWithGlobalTags(res, filePath);
});
app.use(express.static(PUBLIC_ROOT, {
  extensions: ["html"],
  maxAge: "1h"
}));

app.get("/api/gallery/:folder", (req, res) => {
  const folder = String(req.params.folder || "").replace(/\s+/g, " ").trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(folder)) {
    return res.status(400).json({ images: [] });
  }

  const galleryRoot = path.join(__dirname, "public", "assets", "material-galleries");
  const target = path.resolve(galleryRoot, folder);
  if (!target.startsWith(galleryRoot) || !fs.existsSync(target)) {
    return res.json({ images: [] });
  }

  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif"]);
  const images = fs.readdirSync(target, { withFileTypes: true })
    .filter((entry) => entry.isFile() && allowed.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => `/assets/material-galleries/${folder}/${entry.name}`)
    .sort((a, b) => a.localeCompare(b));

  return res.json({ images });
});

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

function rateLimit(req, res, next) {
  const ip = clientIp(req);
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 8;
  const bucket = rateBuckets.get(ip) || [];
  const recent = bucket.filter((ts) => now - ts < windowMs);
  recent.push(now);
  rateBuckets.set(ip, recent);
  if (recent.length > maxRequests) {
    return res.status(429).json({ ok: false, message: "Unable to send quote request right now." });
  }
  next();
}

function clean(value) {
  if (value == null) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizePhone(value) {
  const raw = clean(value);
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw;
}

function sha256(value, normalize = (input) => clean(input).toLowerCase()) {
  const normalized = normalize(value);
  if (!normalized) return undefined;
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function normalizeCityForHash(value) {
  return clean(value).toLowerCase().replace(/\s+/g, "");
}

function normalizeStateForHash(value) {
  return clean(value).toLowerCase().replace(/[^a-z]/g, "").slice(0, 2);
}

function normalizeZipForHash(value) {
  return clean(value).toLowerCase().replace(/\s+/g, "");
}

function normalizeCountryForHash(value) {
  return clean(value || "us").toLowerCase().replace(/[^a-z]/g, "").slice(0, 2);
}

function normalizePhoneDigits(value) {
  const digits = clean(value).replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits;
}

function metaEventTime(value) {
  const parsed = Date.parse(clean(value));
  return Math.floor((Number.isFinite(parsed) ? parsed : Date.now()) / 1000);
}

function metaEventSourceUrl(req, pagePath) {
  const proto = clean(req.headers["x-forwarded-proto"]) || req.protocol || "https";
  const host = clean(req.headers["x-forwarded-host"]) || clean(req.headers.host);
  const pathValue = clean(pagePath) || "/";
  if (!host) return pathValue;
  return `${proto}://${host}${pathValue.startsWith("/") ? pathValue : `/${pathValue}`}`;
}

function metaUserData(req, payload = {}) {
  const phoneDigits = normalizePhoneDigits(payload.phone);
  const zip = clean(payload.zipCodeProject) || clean(payload.zipCodeInitial);
  const userData = {
    client_ip_address: clientIp(req),
    client_user_agent: clean(req.headers["user-agent"]),
    fbp: clean(payload.fbp),
    fbc: clean(payload.fbc),
    external_id: sha256(payload.externalId),
    em: sha256(payload.email),
    ph: phoneDigits ? sha256(phoneDigits) : undefined,
    fn: sha256(payload.firstName),
    ln: sha256(payload.lastName),
    ct: sha256(payload.city, normalizeCityForHash),
    st: sha256(payload.state, normalizeStateForHash),
    zp: sha256(zip, normalizeZipForHash),
    country: sha256(payload.country || "us", normalizeCountryForHash)
  };
  return Object.fromEntries(Object.entries(userData).filter(([, value]) => value));
}

async function sendMetaCapiEvent(req, eventName, payload = {}, eventId = "") {
  if (!META_CAPI_ACCESS_TOKEN || !META_PIXEL_ID) return;
  const event = {
    event_name: eventName,
    event_time: metaEventTime(payload.timestamp),
    event_id: clean(eventId) || clean(payload.metaEventId) || crypto.randomUUID(),
    action_source: "website",
    event_source_url: metaEventSourceUrl(req, payload.pagePath),
    user_data: metaUserData(req, payload),
    custom_data: {
      content_name: clean(payload.contentName) || clean(payload.leadType) || eventName,
      page_path: clean(payload.pagePath),
      service_area: clean(payload.serviceArea),
      project_type: clean(payload.projectType),
      fence_style: clean(payload.fenceStyle),
      city: clean(payload.city),
      state: clean(payload.state),
      country: clean(payload.country) || "us",
      landing_page: clean(payload.landingPage)
    }
  };
  Object.keys(event.custom_data).forEach((key) => {
    if (!event.custom_data[key]) delete event.custom_data[key];
  });

  const body = { data: [event] };
  if (META_TEST_EVENT_CODE) body.test_event_code = META_TEST_EVENT_CODE;

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(META_CAPI_ACCESS_TOKEN)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[meta-capi] event error", response.status, text);
    }
  } catch (error) {
    console.error("[meta-capi] failed to send event", error);
  }
}

function isoTimestamp(value) {
  const parsed = Date.parse(clean(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

async function verifyRecaptcha(token, ip) {
  if (!RECAPTCHA_SECRET) {
    console.error("[quote-api] Missing BLUEBIRD_RECAPTCHA_SECRET_KEY");
    return false;
  }
  if (!clean(token)) return false;

  const body = new URLSearchParams({
    secret: RECAPTCHA_SECRET,
    response: clean(token),
    remoteip: ip
  });

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await response.json().catch(() => ({}));
    return Boolean(data.success);
  } catch (error) {
    console.error("[quote-api] reCAPTCHA verification failed", error);
    return false;
  }
}

function normalizePayload(input) {
  const stage = clean(input.stage) || "quote_complete";
  return {
    stage,
    source: clean(input.source) || "BlueBird Fence Main LP",
    leadType: clean(input.leadType) || (stage === "contact_capture" ? "Partial Fence Quote Contact" : "Fence Quote Request"),
    serviceArea: clean(input.serviceArea),
    zipCodeInitial: clean(input.zipCodeInitial),
    firstName: clean(input.firstName),
    lastName: clean(input.lastName),
    phone: normalizePhone(input.phone),
    email: clean(input.email),
    projectType: clean(input.projectType),
    fenceStyle: clean(input.fenceStyle),
    mainGoal: clean(input.mainGoal),
    city: clean(input.city),
    zipCodeProject: clean(input.zipCodeProject),
    fullAddress: clean(input.fullAddress),
    state: clean(input.state),
    country: clean(input.country) || "us",
    timeline: clean(input.timeline),
    pagePath: clean(input.pagePath) || "/",
    landingPage: clean(input.landingPage) || "Main Quote Landing Page",
    utmSource: clean(input.utmSource),
    utmMedium: clean(input.utmMedium),
    utmCampaign: clean(input.utmCampaign),
    utmTerm: clean(input.utmTerm),
    utmContent: clean(input.utmContent),
    gclid: clean(input.gclid),
    timestamp: isoTimestamp(input.timestamp),
    metaEventId: clean(input.metaEventId),
    externalId: clean(input.externalId),
    fbp: clean(input.fbp),
    fbc: clean(input.fbc)
  };
}

app.post("/api/meta-event", async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(415).json({ ok: false });
  }
  const eventName = clean(req.body?.eventName);
  const allowedEvents = new Set(["PageView", "ViewContent", "clique_chamada"]);
  if (!allowedEvents.has(eventName)) {
    return res.status(400).json({ ok: false });
  }
  const payload = {
    contentName: clean(req.body?.contentName),
    pagePath: clean(req.body?.pagePath) || "/",
    timestamp: clean(req.body?.timestamp) || new Date().toISOString(),
    firstName: clean(req.body?.firstName),
    lastName: clean(req.body?.lastName),
    phone: normalizePhone(req.body?.phone),
    email: clean(req.body?.email),
    city: clean(req.body?.city),
    state: clean(req.body?.state),
    country: clean(req.body?.country) || "us",
    zipCodeProject: clean(req.body?.zipCodeProject),
    zipCodeInitial: clean(req.body?.zipCodeInitial),
    externalId: clean(req.body?.externalId),
    fbp: clean(req.body?.fbp),
    fbc: clean(req.body?.fbc)
  };
  await sendMetaCapiEvent(req, eventName, payload, clean(req.body?.eventId));
  return res.json({ ok: true });
});

app.post("/api/quote", rateLimit, async (req, res) => {
  if (!req.is("application/json")) {
    return res.status(415).json({ ok: false, message: "Unable to send quote request right now." });
  }
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ ok: false, message: "Unable to send quote request right now." });
  }

  const parsed = quoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, message: "Unable to send quote request right now." });
  }

  if (!WEBHOOK_URL) {
    console.error("[quote-api] Missing N8N_BLUEBIRD_QUOTE_WEBHOOK_URL");
    return res.status(500).json({ ok: false, message: "Unable to send quote request right now." });
  }

  const stage = parsed.data.stage || "quote_complete";
  if (stage === "contact_capture") {
    const captchaOk = await verifyRecaptcha(parsed.data.recaptchaToken, clientIp(req));
    if (!captchaOk) {
      console.warn("[quote-api] contact_capture accepted without valid reCAPTCHA token");
    }
  }

  const payload = normalizePayload(parsed.data);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error("[quote-api] n8n webhook error", response.status, response.statusText);
      return res.status(502).json({ ok: false, message: "Unable to send quote request right now." });
    }

    const metaEventName = stage === "contact_capture" ? "Lead" : "LeadComplete";
    await sendMetaCapiEvent(req, metaEventName, payload, payload.metaEventId);

    return res.json({ ok: true, message: "Quote request sent successfully." });
  } catch (error) {
    console.error("[quote-api] Failed to send quote", error);
    return res.status(502).json({ ok: false, message: "Unable to send quote request right now." });
  }
});

app.all("/api/quote", (_req, res) => {
  res.status(405).json({ ok: false, message: "Unable to send quote request right now." });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "API route not found." });
});

app.get("*", (_req, res) => {
  sendHtmlWithGlobalTags(res, path.join(PUBLIC_ROOT, "index.html"));
});

app.listen(PORT, () => {
  console.log(`BlueBird LP running at http://localhost:${PORT}`);
});
