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
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};

const resolveFile = (urlPath) => {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const resolved = path.normalize(path.join(root, cleanPath));

  if (!resolved.startsWith(root)) {
    return null;
  }

  return resolved;
};

const server = http.createServer((request, response) => {
  const requestedFile = resolveFile(request.url || "/");

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
