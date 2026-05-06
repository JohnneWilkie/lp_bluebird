import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
const MAX_BODY_BYTES = "32kb";
const rateBuckets = new Map();

const quoteSchema = z.object({
  stage: z.enum(["contact_capture", "quote_complete"]).optional(),
  source: z.string().optional(),
  leadType: z.string().optional(),
  serviceArea: z.string().trim().min(1),
  zipCodeInitial: z.string().optional(),
  firstName: z.string().trim().min(1),
  phone: z.string().trim().min(7),
  email: z.string().trim().email().optional().or(z.literal("")),
  projectType: z.string().optional(),
  fenceStyle: z.string().optional(),
  mainGoal: z.string().optional(),
  city: z.string().optional(),
  zipCodeProject: z.string().optional(),
  fullAddress: z.string().optional(),
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

app.use(express.json({
  limit: MAX_BODY_BYTES,
  type: ["application/json", "application/*+json"]
}));
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: "1h"
}));

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
    phone: normalizePhone(input.phone),
    email: clean(input.email),
    projectType: clean(input.projectType),
    fenceStyle: clean(input.fenceStyle),
    mainGoal: clean(input.mainGoal),
    city: clean(input.city),
    zipCodeProject: clean(input.zipCodeProject),
    fullAddress: clean(input.fullAddress),
    timeline: clean(input.timeline),
    pagePath: clean(input.pagePath) || "/",
    landingPage: clean(input.landingPage) || "Main Quote Landing Page",
    utmSource: clean(input.utmSource),
    utmMedium: clean(input.utmMedium),
    utmCampaign: clean(input.utmCampaign),
    utmTerm: clean(input.utmTerm),
    utmContent: clean(input.utmContent),
    gclid: clean(input.gclid),
    timestamp: isoTimestamp(input.timestamp)
  };
}

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
      return res.status(400).json({ ok: false, message: "Unable to send quote request right now." });
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
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`BlueBird LP running at http://localhost:${PORT}`);
});
