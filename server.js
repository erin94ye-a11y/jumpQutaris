const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createQutaraApi } = require("./qutara/api");

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const host = "0.0.0.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const publicRoutes = {
  "/": "/index.html",
  "/company": "/trading.html",
  "/technology": "/technology.html",
  "/research": "/research.html",
  "/leadership": "/people.html",
  "/contact": "/contact.html",
  "/privacy-policy": "/privacy-policy.html",
  "/terms-of-use": "/terms-of-use.html",
  "/cookie-policy": "/cookie-policy.html",
  "/fraud-alert": "/fraud-alert.html",
  "/legal-compliance": "/legal-compliance.html"
};

for (const route of ["dashboard", "qutara", "virtual-trading", "market-data", "leaderboard", "reports"]) {
  publicRoutes[`/${route}`] = "/platform.html";
}

const htmlRedirects = {
  "/ai-bots": "/qutara",
  "/ai-bots.html": "/qutara",
  "/platform.html": "/qutara",
  "/index.html": "/",
  "/trading": "/company",
  "/trading.html": "/company",
  "/technology.html": "/technology",
  "/research.html": "/research",
  "/people": "/leadership",
  "/people.html": "/leadership",
  "/careers": "/leadership",
  "/careers.html": "/leadership",
  "/contact.html": "/contact",
  "/privacy-policy.html": "/privacy-policy",
  "/terms-of-use.html": "/terms-of-use",
  "/cookie-policy.html": "/cookie-policy",
  "/fraud-alert.html": "/fraud-alert",
  "/legal-compliance.html": "/legal-compliance"
};

const redirect = (response, location) => {
  response.writeHead(301, {
    Location: location,
    "Cache-Control": "no-cache, max-age=0"
  });
  response.end();
};

const parseRequestPath = (urlPath) => {
  if (!urlPath.startsWith("/") || urlPath.startsWith("//") || urlPath.includes("\\")) throw new Error("Invalid URL path");
  const parsed = new URL(urlPath || "/", "http://localhost");
  const pathname = decodeURIComponent(parsed.pathname);
  if (/[\u0000-\u001f\u007f\\]/.test(pathname) || pathname.startsWith("//")) throw new Error("Invalid URL path");
  return {
    pathname,
    search: parsed.search
  };
};

const resolveFile = (pathname) => {
  const routeFile = publicRoutes[pathname] || pathname;
  const resolved = path.normalize(path.join(root, routeFile));

  // The independent visitor application contains private records and server code.
  const relativeParts = path.relative(root, resolved).split(/[\\/]/);
  if (relativeParts.some(part => part.replace(/[. ]+$/, "").toLowerCase() === "visitor-check")) {
    return null;
  }

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }

  // Only browser assets are public. Server modules, credentials and both databases
  // must never be reachable through this static file handler.
  const publicFiles = new Set([...Object.values(publicRoutes), "/styles.css", "/main.js", "/content.js", "/platform.css", "/platform.js", "/robots.txt", "/sitemap.xml"]);
  const relative = "/" + path.relative(root, resolved).split(path.sep).join("/");
  if (!publicFiles.has(relative) && !(/^\/assets\/[a-zA-Z0-9_./-]+$/.test(relative) && [".png", ".webp", ".jpg", ".jpeg", ".svg", ".ico"].includes(path.extname(relative).toLowerCase()))) {
    return null;
  }

  return resolved;
};

function createServer(options = {}) {
const qutara = createQutaraApi(options);
const server = http.createServer(async (request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://unpkg.com; connect-src 'self'"
  );
  if (process.env.NODE_ENV === "production" || request.headers["x-forwarded-proto"] === "https") {
    response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  let pathname, search;
  try { ({ pathname, search } = parseRequestPath(request.url || "/")); }
  catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Invalid request URL");
    return;
  }

  if (await qutara.handle(request, response, new URL(request.url || "/", "http://localhost"))) return;

  if (pathname.length > 1 && pathname.endsWith("/")) {
    redirect(response, `${pathname.slice(0, -1).split("/").map(encodeURIComponent).join("/")}${search}`);
    return;
  }

  if (htmlRedirects[pathname]) {
    redirect(response, `${htmlRedirects[pathname]}${search}`);
    return;
  }

  const requestedFile = resolveFile(pathname);

  if (!requestedFile) {
    const privatePath = /\.[^/]+$/.test(pathname) || /^\/(?:visitor-check|qutara\/|test\/|docs\/|\.)/i.test(pathname);
    response.writeHead(privatePath ? 403 : 404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(privatePath ? "Forbidden" : "Page not found");
    return;
  }

  fs.readFile(requestedFile, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(fs.readFileSync(path.join(root, "index.html")));
      return;
    }

    const extension = path.extname(requestedFile).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": "no-cache, max-age=0"
    });
    response.end(data);
  });
});

server.qutara = qutara;
return server;
}

if (require.main === module) {
const server = createServer();
server.listen(port, host, () => {
  console.log(`Jump Qutaris website running on http://${host}:${port}`);
});
let shuttingDown = false;
const shutdown = async () => {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close();
  await server.qutara.close();
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
}

module.exports = { createServer };
