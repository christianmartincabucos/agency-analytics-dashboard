import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end(JSON.stringify({ error: 'Read-only service: GET requests only.' }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({
    ok: true,
    mode: process.env.INFLOWW_API_KEY && process.env.INFLOWW_OID ? 'live' : 'demo',
  }));
}
