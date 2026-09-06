/**
 * Fraca Servcom — contact API core.
 * Used by the Vercel function at /api/contact. Keep this free of HTML/page code.
 */

const fs = require("fs/promises");
const path = require("path");
const querystring = require("querystring");

const SUBJECTS = {
  "product-inquiry": "Product Inquiry",
  "quote-request": "Quote Request",
  "customer-feedback": "Customer Feedback",
  complaint: "Complaint",
  "general-inquiry": "General Inquiry",
  partnership: "Partnership",
};

const MAX_BODY_BYTES = 32 * 1024;
const DEFAULT_ORIGINS = [
  "https://fracaservcom.co.ke",
  "https://www.fracaservcom.co.ke",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
];

const rateBuckets = new Map();

function env(name, fallback) {
  var value = process.env[name];
  return value == null || value === "" ? fallback : value;
}

function allowedOrigins() {
  var extra = env("ALLOWED_ORIGINS", "")
    .split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
  var list = DEFAULT_ORIGINS.concat(extra);
  return list.filter(function (origin, i) {
    return list.indexOf(origin) === i;
  });
}

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (allowedOrigins().indexOf(origin) !== -1) return true;
  try {
    var host = new URL(origin).hostname;
    return host.endsWith(".vercel.app");
  } catch (_err) {
    return false;
  }
}

function corsHeaders(origin) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type, Accept";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cleanText(value, max) {
  var text = String(value == null ? "" : value)
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
  if (text.length > max) text = text.slice(0, max);
  return text;
}

function parseBody(raw, contentType) {
  if (raw && typeof raw === "object" && !Buffer.isBuffer(raw)) {
    return raw;
  }
  var text = Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw || "").trim();
  if (!text) return {};
  var type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type === "application/x-www-form-urlencoded") {
    return querystring.parse(text);
  }
  return JSON.parse(text);
}

function validate(input) {
  var fields = {};
  var name = cleanText(input.name, 120);
  var email = cleanText(input.email, 160).toLowerCase();
  var subject = cleanText(input.subject, 64);
  var phone = cleanText(input.phone, 40);
  var message = cleanText(input.message, 4000);

  if (name.length < 2) fields.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Please enter a valid email address.";
  if (!SUBJECTS[subject]) fields.subject = "Please choose a subject.";
  if (phone && !/^[+\d][\d\s().-]{6,38}$/.test(phone)) {
    fields.phone = "Please enter a valid phone number.";
  }
  if (message.length < 10) fields.message = "Please enter a message of at least 10 characters.";

  var errors = Object.keys(fields);
  return {
    ok: errors.length === 0,
    fields: fields,
    error: errors.length ? fields[errors[0]] : null,
    value: { name: name, email: email, subject: subject, phone: phone, message: message },
  };
}

function clientIp(reqLike) {
  var forwarded = String((reqLike && reqLike.headers && reqLike.headers["x-forwarded-for"]) || "");
  var ip = forwarded.split(",")[0].trim();
  if (ip) return ip;
  return (
    (reqLike && reqLike.headers && reqLike.headers["x-real-ip"]) ||
    (reqLike && reqLike.socket && reqLike.socket.remoteAddress) ||
    "unknown"
  );
}

function rateLimit(ip) {
  var limit = Number(env("CONTACT_RATE_LIMIT", "8"));
  var windowMs = Number(env("CONTACT_RATE_WINDOW_MS", "900000"));
  var now = Date.now();
  var stamps = (rateBuckets.get(ip) || []).filter(function (t) {
    return now - t < windowMs;
  });
  if (stamps.length >= limit) return false;
  stamps.push(now);
  rateBuckets.set(ip, stamps);
  if (rateBuckets.size > 2000) {
    rateBuckets.forEach(function (times, key) {
      var next = times.filter(function (t) {
        return now - t < windowMs;
      });
      if (next.length) rateBuckets.set(key, next);
      else rateBuckets.delete(key);
    });
  }
  return true;
}

async function saveInquiry(record) {
  if (env("CONTACT_STORE", "") !== "file") return false;
  var filePath = env(
    "CONTACT_STORE_PATH",
    path.join(__dirname, "..", "data", "inquiries.jsonl")
  );
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, JSON.stringify(record) + "\n", "utf8");
  return true;
}

async function sendWebhook(record) {
  var url = env("INQUIRY_WEBHOOK_URL", "");
  if (!url) return false;
  var res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(record),
  });
  if (!res.ok) throw new Error("Webhook failed (" + res.status + ")");
  return true;
}

function emailBodies(record) {
  var subjectLabel = SUBJECTS[record.subject] || record.subject;
  var text = [
    "New website inquiry — Fraca Servcom Ltd",
    "",
    "Name: " + record.name,
    "Email: " + record.email,
    "Phone: " + (record.phone || "—"),
    "Subject: " + subjectLabel,
    "",
    record.message,
    "",
    "Received: " + record.createdAt,
  ].join("\n");

  var html =
    '<div style="font-family:Georgia,serif;line-height:1.5;color:#1c1917">' +
    "<p>New website inquiry for <strong>Fraca Servcom Ltd</strong></p>" +
    '<table style="border-collapse:collapse">' +
    row("Name", record.name) +
    row("Email", record.email) +
    row("Phone", record.phone || "—") +
    row("Subject", subjectLabel) +
    "</table>" +
    '<p style="white-space:pre-wrap;margin-top:1rem">' +
    escapeHtml(record.message) +
    "</p>" +
    '<p style="color:#78716c;font-size:12px">Received ' +
    escapeHtml(record.createdAt) +
    "</p></div>";

  return { subjectLabel: subjectLabel, text: text, html: html };
}

function row(label, value) {
  return (
    "<tr><td style=\"padding:4px 12px 4px 0;color:#78716c\">" +
    escapeHtml(label) +
    '</td><td style="padding:4px 0">' +
    escapeHtml(value) +
    "</td></tr>"
  );
}

async function sendEmail(record) {
  var apiKey = env("RESEND_API_KEY", "");
  if (!apiKey) return false;

  var bodies = emailBodies(record);
  var res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env("CONTACT_FROM_EMAIL", "Fraca Servcom Ltd <noreply@fracaservcom.co.ke>"),
      to: [env("CONTACT_TO_EMAIL", "fracaservcomltd@yahoo.com")],
      reply_to: record.email,
      subject: "Website inquiry: " + bodies.subjectLabel,
      text: bodies.text,
      html: bodies.html,
    }),
  });

  if (!res.ok) {
    var detail = await res.text();
    throw new Error("Email failed (" + res.status + "): " + detail.slice(0, 300));
  }
  return true;
}

function jsonResult(status, origin, payload) {
  return {
    status: status,
    headers: corsHeaders(origin),
    body: payload,
  };
}

async function handleContactRequest(reqLike) {
  var headers = reqLike.headers || {};
  var origin = headers.origin || headers.Origin || "";
  var method = String(reqLike.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    return { status: 204, headers: corsHeaders(origin), body: null };
  }

  if (method !== "POST") {
    var allow = corsHeaders(origin);
    allow.Allow = "POST, OPTIONS";
    return { status: 405, headers: allow, body: { ok: false, error: "Method not allowed." } };
  }

  var ip = clientIp(reqLike);
  if (!rateLimit(ip)) {
    return jsonResult(429, origin, { ok: false, error: "Too many messages. Please try again later." });
  }

  var parsed;
  try {
    parsed = parseBody(reqLike.body, headers["content-type"] || headers["Content-Type"]);
  } catch (_err) {
    return jsonResult(400, origin, { ok: false, error: "Could not read the form data." });
  }

  if (cleanText(parsed.website, 80)) {
    return jsonResult(200, origin, { ok: true });
  }

  var checked = validate(parsed);
  if (!checked.ok) {
    return jsonResult(400, origin, {
      ok: false,
      error: checked.error,
      fields: checked.fields,
    });
  }

  var record = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    createdAt: new Date().toISOString(),
    name: checked.value.name,
    email: checked.value.email,
    subject: checked.value.subject,
    phone: checked.value.phone,
    message: checked.value.message,
    ip: ip,
  };

  var stored = false;
  var emailed = false;
  var hooked = false;
  var failures = [];

  try {
    stored = await saveInquiry(record);
  } catch (err) {
    failures.push("store: " + err.message);
  }
  try {
    emailed = await sendEmail(record);
  } catch (err) {
    failures.push("email: " + err.message);
  }
  try {
    hooked = await sendWebhook(record);
  } catch (err) {
    failures.push("webhook: " + err.message);
  }

  if (!stored && !emailed && !hooked) {
    console.error("[contact]", failures.join(" | ") || "No delivery method configured");
    return jsonResult(503, origin, {
      ok: false,
      error: "Messaging is not available right now. Please WhatsApp or email us directly.",
    });
  }

  if (failures.length) {
    console.warn("[contact] partial delivery", record.id, failures.join(" | "));
  }

  return jsonResult(201, origin, { ok: true, id: record.id });
}

async function readNodeBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  var chunks = [];
  var size = 0;
  return new Promise(function (resolve, reject) {
    req.on("data", function (chunk) {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large"), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

module.exports = {
  SUBJECTS: SUBJECTS,
  handleContactRequest: handleContactRequest,
  readNodeBody: readNodeBody,
  corsHeaders: corsHeaders,
};
