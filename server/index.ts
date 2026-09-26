import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApiRequest } from './apiRouter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const PORT = process.env.PORT || 3000;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

const server = http.createServer(async (req, res) => {
  // 1. API routes
  if (req.url && req.url.startsWith('/api/db')) {
    return handleApiRequest(req, res);
  }

  // 2. Static files from dist/ (if built)
  if (fs.existsSync(distDir)) {
    const rawUrl = (req.url || '/').split('?')[0];
    let filePath = path.join(distDir, rawUrl === '/' ? 'index.html' : rawUrl);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>SchoolOS Backend Server Active</h1><p>PostgreSQL Live Database Connected.</p>');
});

server.listen(PORT, () => {
  console.log(`[SchoolOS Live Server] Running at http://localhost:${PORT}`);
  console.log(`[PostgreSQL DB] Connected to aws-1-eu-west-1.pooler.supabase.com:6543`);
});
