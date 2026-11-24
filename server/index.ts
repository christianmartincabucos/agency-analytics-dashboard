import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Row = Record<string, any>;
const app = express();
const port = Number(process.env.PORT || 4444);
const base = (process.env.INFLOWW_BASE_URL || 'https://openapi.infloww.com').replace(/\/$/, '');
const cache = new Map<string, { at: number; data: unknown }>();
const cacheTtl = Number(process.env.CACHE_TTL_SECONDS || 300) * 1000;
const divisor = Number(process.env.AMOUNT_DIVISOR || 100);
const maxConcurrent = Math.max(1, Number(process.env.API_CONCURRENCY || 6));
let activeRequests = 0;
const requestQueue: Array<() => void> = [];

async function acquireRequestSlot() {
  if (activeRequests >= maxConcurrent) await new Promise<void>(resolve => requestQueue.push(resolve));
  else activeRequests++;
}
function releaseRequestSlot() {
  const next = requestQueue.shift();
  if (next) next(); else activeRequests--;
}

app.use((_req, res, next) => { res.setHeader('X-Content-Type-Options', 'nosniff'); res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin'); next(); });
app.use((req, res, next) => { if (req.method !== 'GET' && req.path.startsWith('/api/')) return res.status(405).json({ error: 'Read-only service: GET requests only.' }); next(); });

const number = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const money = (v: unknown) => number(v) / divisor;
const dateKey = (d: Date) => d.toISOString().slice(0, 10);

async function get(pathname: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(`${base}${pathname}`);
  for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
  await acquireRequestSlot();
  try {
    for (let attempt = 0; ; attempt++) {
      const response = await fetch(url, { headers: { Accept: 'application/json', Authorization: process.env.INFLOWW_API_KEY!, 'x-oid': process.env.INFLOWW_OID! }, signal: AbortSignal.timeout(30_000) });
      if ((response.status === 429 || response.status >= 500) && attempt < 4) {
        const retry = Number(response.headers.get('retry-after'));
        await new Promise(resolve => setTimeout(resolve, retry > 0 ? retry * 1000 : 700 * 2 ** attempt));
        continue;
      }
      const body: any = await response.json().catch(() => ({}));
      if (!response.ok) { const error: any = new Error(`${response.status}: ${body.message || body.msg || 'Infloww request failed'}`); error.status = response.status; error.requestId = response.headers.get('x-request-id'); throw error; }
      return body;
    }
  } finally { releaseRequestSlot(); }
}

async function all(pathname: string, params: Record<string, string | number> = {}, maxPages = 200): Promise<Row[]> {
  const rows: Row[] = []; let cursor: string | number | undefined;
  for (let page = 0; page < maxPages; page++) {
    const body = await get(pathname, { ...params, limit: 100, cursor });
    const list = Array.isArray(body?.data?.list) ? body.data.list : Array.isArray(body?.data) ? body.data : [];
    rows.push(...list);
    const next = body?.cursor ?? body?.data?.cursor;
    const hasMore = body?.hasMore ?? body?.data?.hasMore;
    if (!hasMore || next == null || String(next) === String(cursor)) break;
    cursor = next;
  }
  return rows;
}

async function windowed(pathname: string, params: Record<string, string | number>, start: Date, end: Date, dateOnly = false) {
  const windows: Array<[Date, Date]> = [];
  for (let cursor = new Date(start); cursor <= end;) {
    const windowEnd = new Date(cursor); windowEnd.setUTCDate(windowEnd.getUTCDate() + 30);
    if (windowEnd > end) windowEnd.setTime(end.getTime());
    windows.push([new Date(cursor), windowEnd]);
    cursor = new Date(windowEnd); cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  const results = await Promise.all(windows.map(([from, to]) => all(pathname, { ...params, startTime: dateOnly ? dateKey(from) : String(from.getTime()), endTime: dateOnly ? dateKey(to) : String(to.getTime() + (dateOnly ? 0 : 86399999)) })));
  return results.flat();
}

const demo = {
  demo: true, generatedAt: new Date().toISOString(), range: 30,
  totals: { revenue: 84260, revenueChange: 12.8, creators: 18, fans: 24680, fanChange: 8.4, messages: 38420, ppvSales: 19270, clicks: 12840, conversions: 964 },
  daily: Array.from({length: 14}, (_, i) => ({ label: ['Nov 11','Nov 12','Nov 13','Nov 14','Nov 15','Nov 16','Nov 17','Nov 18','Nov 19','Nov 20','Nov 21','Nov 22','Nov 23','Nov 24'][i], revenue: [4180,5260,4890,6330,5790,7100,6420,5930,6810,7240,6010,7880,7560,8240][i] })),
  creatorsList: [{name:'Mia Rose',handle:'@miarose',revenue:18420,fans:5240,growth:18.2},{name:'Luna Vale',handle:'@lunavale',revenue:14280,fans:3980,growth:12.4},{name:'Sophie Lane',handle:'@sophielane',revenue:11960,fans:3420,growth:9.8},{name:'Ava Hart',handle:'@avahart',revenue:9840,fans:2910,growth:6.1},{name:'Nina Fox',handle:'@ninafox',revenue:8260,fans:2480,growth:-2.3}],
  chatters: [{name:'Alex Morgan',revenue:12840,messages:8420,ppv:146},{name:'Jamie Chen',revenue:10920,messages:7680,ppv:128},{name:'Taylor Reed',revenue:9840,messages:7140,ppv:112},{name:'Jordan Blake',revenue:7620,messages:5930,ppv:84}],
  links: [{name:'November VIP Push',creator:'Mia Rose',clicks:4280,conversions:342,value:8460},{name:'Black Friday Preview',creator:'Luna Vale',clicks:3620,conversions:289,value:7120},{name:'Welcome Offer 20%',creator:'Sophie Lane',clicks:2840,conversions:198,value:4960},{name:'New Year Warmup',creator:'Ava Hart',clicks:2100,conversions:135,value:3280}], warnings: []
};

async function dashboard(days: number) {
  const warnings: string[] = [];
  const safe = async <T>(name: string, task: () => Promise<T>, fallback: T): Promise<T> => { try { return await task(); } catch (e: any) { warnings.push(`${name}: ${e.message}${e.requestId ? ` (x-request-id ${e.requestId})` : ''}`); return fallback; } };
  const creatorsRaw = await all('/v1/creators', { platformCode: 'OnlyFans' });
  const creators = creatorsRaw.map((c, i) => ({ id: String(c.id ?? c.creatorId ?? i), name: String(c.name || c.nickName || c.userName || `Creator ${i + 1}`), handle: c.userName ? `@${String(c.userName).replace(/^@/, '')}` : '', revenue: 0, fans: 0, growth: 0 }));
  const now = new Date(); const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 1); const start = new Date(end); start.setUTCDate(start.getUTCDate() - (days - 1));
  const daily = new Map<string, number>(); let revenue = 0;
  const transactionGroups = await Promise.all(creators.map(c => safe(`transactions ${c.name}`, () => windowed('/v1/transactions', { platformCode: 'OnlyFans', creatorId: c.id }, start, end), [])));
  transactionGroups.forEach((group, index) => {
    let creatorRevenue = 0;
    for (const tx of group) {
      if (/refund|chargeback|undo|reversal/i.test(String(tx.status || ''))) continue;
      const amount = tx.net !== undefined ? money(tx.net) : money(tx.amount) - money(tx.fee);
      revenue += amount; creatorRevenue += amount;
      const stamp = number(tx.createdTime); if (stamp) { const d = new Date(stamp); const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }); daily.set(label, (daily.get(label) || 0) + amount); }
    }
    if (creators[index]) creators[index].revenue = Math.round(creatorRevenue);
  });
  const ids = creators.map(c => c.id); let fanCount = 0; let messages = 0;
  const batches: string[][] = []; for (let i = 0; i < ids.length; i += 10) batches.push(ids.slice(i, i + 10));
  const reports = await Promise.all(batches.map(async batch => {
    const query = { platformCode: 'OnlyFans', creatorIds: batch.join(',') };
    const [fans, chats] = await Promise.all([
      safe('fan count report', () => windowed('/v1/creator-report/fans/count', query, start, end, true), []),
      safe('creator chat report', () => windowed('/v1/creator-report/chat-summary', query, start, end, true), [])
    ]);
    return { fans, chats };
  }));
  for (const report of reports) {
    for (const f of report.fans) { const c = creators.find(x => x.id === String(f.platformPid ?? f.creatorId)); if (c) c.fans = number(f.activeFans); }
    for (const chat of report.chats) messages += number(chat.messagesSent);
  }
  fanCount = creators.reduce((sum, c) => sum + c.fans, 0);
  const employees = await safe('employees', () => all('/v1/employees'), []);
  let ppvSales = 0;
  const chatters = await Promise.all(employees.slice(0, 50).map(async e => {
    const id = String(e.employeeId ?? e.id); const name = String(e.employeeName || e.name || `Employee ${id}`);
    const query = { platformCode: 'OnlyFans', employeeIds: id };
    const [report, chat] = await Promise.all([
      safe(`employee report ${name}`, () => windowed('/v1/employee-report/employee-sales-summary', query, start, end, true), []),
      safe(`employee chat ${name}`, () => windowed('/v1/employee-report/employee-chat-summary', query, start, end, true), [])
    ]);
    ppvSales += report.reduce((s, r) => s + money(r.ppvSalesAmount), 0);
    return { name, revenue: Math.round(report.reduce((s, r) => s + money(r.salesAmount), 0)), messages: chat.reduce((s, r) => s + number(r.directMessagesSent), 0), ppv: chat.reduce((s, r) => s + number(r.ppvsUnlocked), 0) };
  }));
  const links = (await Promise.all(creators.slice(0, 50).flatMap(c => ['TRACKING','TRIAL','CAMPAIGN'].map(linkType => safe(`links ${linkType} ${c.name}`, () => windowed('/v1/links', { platformCode: 'OnlyFans', creatorId: c.id, linkType }, start, end), []).then(rows => rows.map(l => ({ name: String(l.message || l.name || l.campaignCode || `Link ${l.id}`), creator: c.name, clicks: number(l.clickCount ?? l.clicksCount), conversions: number(l.subCount ?? l.subscribersCount ?? l.claimsCount), value: Math.round(money(l.earningsNet ?? l.earningsGross)) }))))))).flat().slice(0, 12);
  const activeCreators = creators.filter(c => c.name && !/^creator /i.test(c.name)).length;
  return { demo: false, generatedAt: new Date().toISOString(), range: days, totals: { revenue: Math.round(revenue), revenueChange: null, creators: activeCreators, fans: fanCount, fanChange: null, messages, ppvSales: Math.round(ppvSales), clicks: links.reduce((s, x) => s + x.clicks, 0), conversions: links.reduce((s, x) => s + x.conversions, 0) }, daily: [...daily].map(([label, value]) => ({ label, revenue: Math.round(value) })).slice(-31), creatorsList: creators.sort((a, b) => b.revenue - a.revenue).slice(0, 15), chatters: chatters.sort((a, b) => b.revenue - a.revenue).slice(0, 10), links, warnings };
}

app.get('/api/dashboard', async (req, res) => {
  const days = Math.min(90, Math.max(7, Number(req.query.days) || 30)); const key = String(days); const cached = cache.get(key);
  if (cached && Date.now() - cached.at < cacheTtl) return res.json(cached.data);
  if (!process.env.INFLOWW_API_KEY || !process.env.INFLOWW_OID) return res.json({ ...demo, range: days });
  try { const data = await dashboard(days); cache.set(key, { at: Date.now(), data }); res.json(data); }
  catch (error: any) { res.status(error.status || 502).json({ error: error.message || 'Dashboard data could not be loaded', requestId: error.requestId }); }
});
app.get('/api/health', (_req, res) => res.json({ ok: true, mode: process.env.INFLOWW_API_KEY && process.env.INFLOWW_OID ? 'live' : 'demo' }));

const dirname = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.resolve(dirname, '../dist/agency-analytics/browser');
app.use(express.static(staticDir));
app.use((_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
app.listen(port, () => console.log(`Agency analytics listening on http://localhost:${port}`));
