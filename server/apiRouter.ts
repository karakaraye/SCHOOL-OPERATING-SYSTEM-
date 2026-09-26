import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  initDatabase,
  getFullDatabaseState,
  dbCreateParent,
  dbLinkStudentsToParent,
  dbSyncState,
  pool,
} from './db.ts';

// Ensure tables exist on server startup
initDatabase().catch(err => {
  console.error('[API Router] DB auto-initialization error:', err);
});

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Protect against overly large payloads (50MB)
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Connect/Vite compatible middleware for all `/api/db` requests.
 */
export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void
) {
  const url = req.url || '';

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Only handle /api/db routes
  if (!url.startsWith('/api/db')) {
    if (next) return next();
    res.writeHead(404).end();
    return;
  }

  try {
    // 1. Health check
    if (url === '/api/db/health' || url.startsWith('/api/db/health?')) {
      const dbRes = await pool.query('SELECT current_database(), current_user, version()');
      return sendJson(res, 200, {
        ok: true,
        live: true,
        provider: 'Supabase PostgreSQL',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 6543,
        database: dbRes.rows[0]?.current_database || 'postgres',
        user: dbRes.rows[0]?.current_user || 'postgres',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Fetch full live database state
    if ((url === '/api/db/state' || url.startsWith('/api/db/state?')) && req.method === 'GET') {
      const state = await getFullDatabaseState();
      return sendJson(res, 200, {
        ok: true,
        data: state,
        source: 'Supabase PostgreSQL',
      });
    }

    // 3. Sync state delta
    if (url === '/api/db/sync' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      await dbSyncState(body);
      return sendJson(res, 200, { ok: true, message: 'Database state synced successfully' });
    }

    // 4. Create Parent & link wards
    if (url === '/api/db/parent' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      await dbCreateParent(body);
      return sendJson(res, 201, { ok: true, message: 'Parent onboarded in PostgreSQL' });
    }

    // 5. Link students to parent
    if (url === '/api/db/parent/link' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const { studentIds, parentId } = body;
      await dbLinkStudentsToParent(studentIds, parentId);
      return sendJson(res, 200, { ok: true, message: 'Students linked in PostgreSQL' });
    }

    // Unmatched API route
    return sendJson(res, 404, { ok: false, error: 'Endpoint not found' });
  } catch (error: any) {
    console.error('[API Error]:', error);
    return sendJson(res, 500, {
      ok: false,
      error: error.message || 'Internal Server Error',
    });
  }
}
