const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { existsSync } = require('node:fs');
const websiteServer = path.resolve(__dirname, '../../server.js');

test('existing website cannot serve the private application directory', { timeout: 10000, skip: !existsSync(websiteServer) }, async (t) => {
  const probe = http.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, [websiteServer], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => child.kill());
  await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', code => reject(new Error(`Website stopped: ${code}`)));
    child.stdout.on('data', data => { if (data.toString().includes('running on')) resolve(); });
  });
  assert.equal((await fetch(`http://127.0.0.1:${port}/`)).status, 200);
  for (const route of ['/visitor-check/server.js', '/visitor-check/data/visits.sqlite', '/VISITOR-CHECK/package.json', '/visitor-check./package.json', '/visitor-check%20/package.json']) {
    assert.equal((await fetch(`http://127.0.0.1:${port}${route}`)).status, 403);
  }
});
