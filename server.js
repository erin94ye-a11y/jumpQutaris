const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

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
  "/cookie-policy": "/cookie-policy.html"
};

const htmlRedirects = {
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
  "/cookie-policy.html": "/cookie-policy"
};

const redirect = (response, location) => {
  response.writeHead(301, {
    Location: location,
    "Cache-Control": "no-cache, max-age=0"
  });
  response.end();
};

const parseRequestPath = (urlPath) => {
  const parsed = new URL(urlPath || "/", "http://localhost");
  return {
    pathname: decodeURIComponent(parsed.pathname),
    search: parsed.search
  };
};

const resolveFile = (pathname) => {
  const routeFile = publicRoutes[pathname] || pathname;
  const resolved = path.normalize(path.join(root, routeFile));

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }

  return resolved;
};

const server = http.createServer((request, response) => {
  const { pathname, search } = parseRequestPath(request.url || "/");

  if (pathname.length > 1 && pathname.endsWith("/")) {
    redirect(response, `${pathname.slice(0, -1)}${search}`);
    return;
  }

  if (htmlRedirects[pathname]) {
    redirect(response, `${htmlRedirects[pathname]}${search}`);
    return;
  }

  const requestedFile = resolveFile(pathname);

  if (!requestedFile) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Forbidden");
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

server.listen(port, host, () => {
  console.log(`Jump Qutaris website running on http://${host}:${port}`);
});
