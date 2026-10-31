// Local development server. Mimics Vercel: static files from public/ plus the /api routes.
// Run: npm run dev   then open http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (so you do not need extra packages).
for (const file of ['.env', '.env.local']) {
  try {
    fs.readFileSync(path.join(__dirname, file), 'utf8').split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trim().startsWith('#')) return;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    });
  } catch (e) {
    /* file not found, fine */
  }
}

const PUBLIC = path.join(__dirname, 'public');
const PORT = process.env.PORT || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon',
};

// Reuse the security headers from vercel.json so problems show up locally.
let globalHeaders = [];
try {
  const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  const rule = (cfg.headers || []).find((h) => h.source === '/(.*)');
  if (rule) globalHeaders = rule.headers;
} catch (e) {
  /* ignore */
}

if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
  console.log('\n! ADMIN_PASSWORD and/or SESSION_SECRET are not set, so master login will not work.');
  console.log('  Run "npm run secrets", then put both lines in a file named .env\n');
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    globalHeaders.forEach((h) => res.setHeader(h.key, h.value));

    if (url.pathname.startsWith('/api/')) {
      const name = url.pathname.slice(5).replace(/[^a-z]/g, '');
      const file = path.join(__dirname, 'api', name + '.js');
      if (!fs.existsSync(file)) {
        res.statusCode = 404;
        return res.end('Not found');
      }
      try {
        return await require(file)(req, res);
      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        return res.end('Server error');
      }
    }

    let rel = decodeURIComponent(url.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const full = path.join(PUBLIC, path.normalize(rel));
    if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.statusCode = 404;
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[path.extname(full)] || 'application/octet-stream');
    fs.createReadStream(full).pipe(res);
  })
  .listen(PORT, () => console.log('Portfolio running at http://localhost:' + PORT));
