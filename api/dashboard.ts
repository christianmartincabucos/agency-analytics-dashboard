import type { IncomingMessage, ServerResponse } from 'node:http';
import 'dotenv/config';
import { getDashboardData } from '../server/dashboard-service.js';

type ApiRequest = IncomingMessage & { query?: Record<string, string | string[] | undefined> };

export default async function handler(req: ApiRequest, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end(JSON.stringify({ error: 'Read-only service: GET requests only.' }));
    return;
  }

  const rawDays = Array.isArray(req.query?.days) ? req.query?.days[0] : req.query?.days;
  const days = Math.min(90, Math.max(7, Number(rawDays) || 30));
  try {
    res.statusCode = 200;
    res.end(JSON.stringify(await getDashboardData(days)));
  } catch (error: any) {
    res.statusCode = error.status || 502;
    res.end(JSON.stringify({
      error: error.message || 'Dashboard data could not be loaded',
      requestId: error.requestId,
      upstreamPath: error.endpoint,
    }));
  }
}
