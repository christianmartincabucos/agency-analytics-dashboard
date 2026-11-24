import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDashboardData } from './dashboard-service.js';

const app = express();
const port = Number(process.env.PORT || 4444);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.path.startsWith('/api/')) {
    return res.status(405).json({ error: 'Read-only service: GET requests only.' });
  }
  next();
});

app.get('/api/dashboard', async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30));
  try {
    res.json(await getDashboardData(days));
  } catch (error: any) {
    res.status(error.status || 502).json({
      error: error.message || 'Dashboard data could not be loaded',
      requestId: error.requestId,
      upstreamPath: error.endpoint,
    });
  }
});

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    mode: process.env.INFLOWW_API_KEY && process.env.INFLOWW_OID ? 'live' : 'demo',
  }),
);

const dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(dirname, '../dist/agency-analytics/browser');
app.use(express.static(staticDir));
app.use((_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
app.listen(port, () => console.log(`Agency analytics listening on http://localhost:${port}`));
