/**
 * POST /api/contact
 * Vercel Node serverless function. Same-origin on fracaservcom.co.ke.
 *
 * Local (static pages + this API): node api/contact.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleContactRequest, readNodeBody, corsHeaders } = require("../lib/contact");

async function handler(req, res) {
  var origin = req.headers.origin || "";
  try {
    var body = await readNodeBody(req);
    var result = await handleContactRequest({
      method: req.method,
      headers: req.headers,
      body: body,
      socket: req.socket,
    });
    Object.keys(result.headers).forEach(function (key) {
      res.setHeader(key, result.headers[key]);
    });
    res.statusCode = result.status;
    if (result.body == null) {
      res.end();
      return;
    }
    res.end(JSON.stringify(result.body));
  } catch (err) {
    var status = err.statusCode || 500;
    var headers = corsHeaders(origin);
    Object.keys(headers).forEach(function (key) {
      res.setHeader(key, headers[key]);
    });
    res.statusCode = status;
    res.end(
      JSON.stringify({
        ok: false,
        error:
          status === 413
            ? "Message is too large."
            : "Something went wrong. Please try WhatsApp or email us directly.",
      })
    );
  }
}

module.exports = handler;

var MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function loadDotEnv() {
  var envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach(function (line) {
      var trimmed = line.trim();
      if (!trimmed || trimmed.charAt(0) === "#") return;
      var eq = trimmed.indexOf("=");
      if (eq < 1) return;
      var key = trimmed.slice(0, eq).trim();
      var value = trimmed.slice(eq + 1).trim();
      if ((value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
          (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")) {
        value = value.slice(1, -1);
      }
      if (process.env[key] == null) process.env[key] = value;
    });
}

function startLocalServer() {
  loadDotEnv();
  if (!process.env.RESEND_API_KEY && !process.env.CONTACT_STORE && !process.env.INQUIRY_WEBHOOK_URL) {
    process.env.CONTACT_STORE = "file";
    console.log("No RESEND_API_KEY set — storing inquiries to data/inquiries.jsonl");
  }

  var root = path.join(__dirname, "..");
  var port = Number(process.env.PORT || 3000);

  http
    .createServer(function (req, res) {
      var urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath === "/api/contact" || urlPath === "/api/contact/") {
        handler(req, res);
        return;
      }

      var relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
      var filePath = path.normalize(path.join(root, relative));
      if (filePath.indexOf(root) !== 0) {
        res.statusCode = 403;
        res.end("Forbidden");
        return;
      }

      fs.stat(filePath, function (err, stat) {
        if (err || !stat.isFile()) {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        var ext = path.extname(filePath).toLowerCase();
        res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
        fs.createReadStream(filePath).pipe(res);
      });
    })
    .listen(port, "127.0.0.1", function () {
      console.log("Fraca Servcom local site + contact API: http://127.0.0.1:" + port);
    });
}

if (require.main === module) {
  startLocalServer();
}
