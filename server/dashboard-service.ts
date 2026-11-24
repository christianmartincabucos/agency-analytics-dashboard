import { getDemoDashboard } from '../shared/demo-dashboard.js';
import { splitInflowwRange } from '../shared/infloww-windows.js';

type Row = Record<string, any>;
const configuredBase = (process.env.INFLOWW_BASE_URL || 'https://openapi.infloww.com').replace(/\/+$/, '');
// API paths below include `/v1`; accept both the host root and the documented `/v1` base.
const base = configuredBase.replace(/\/v1$/i, '');
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
const number = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const money = (v: unknown) => number(v) / divisor;
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
      if (!response.ok) { const error: any = new Error(`${response.status}: ${body.errorMessage || body.message || body.msg || 'Infloww request failed'}`); error.status = response.status; error.requestId = response.headers.get('x-request-id'); error.endpoint = url.pathname; throw error; }
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
  const windows = splitInflowwRange(start, end, dateOnly);
  const results = await Promise.all(windows.map(window => all(pathname, { ...params, ...window })));
  return results.flat();
}

async function dashboard(days: number) {
  const warnings: string[] = [];
  const safe = async <T>(name: string, task: () => Promise<T>, fallback: T): Promise<T> => { try { return await task(); } catch (e: any) { warnings.push(`${name}: ${e.message}${e.requestId ? ` (x-request-id ${e.requestId})` : ''}`); return fallback; } };
  const creatorsRaw = await all('/v1/creators', { platformCode: 'OnlyFans' });
  const creators = creatorsRaw.map((c, i) => ({ id: String(c.id ?? c.creatorId ?? i), name: String(c.name || c.nickName || c.userName || `Creator ${i + 1}`), handle: c.userName ? `@${String(c.userName).replace(/^@/, '')}` : '', revenue: 0, fans: 0, growth: 0 }));
  const now = new Date(); const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 1); const start = new Date(end); start.setUTCHours(0, 0, 0, 0); start.setUTCDate(start.getUTCDate() - (days - 1));
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
  const links = (await Promise.all(creators.slice(0, 50).flatMap(c => ['TRACKING', 'TRIAL', 'CAMPAIGN'].map(linkType => safe(`links ${linkType} ${c.name}`, () => windowed('/v1/links', { platformCode: 'OnlyFans', creatorId: c.id, linkType }, start, end), []).then(rows => rows.map(l => ({ name: String(l.message || l.name || l.campaignCode || `Link ${l.id}`), creator: c.name, clicks: number(l.clickCount ?? l.clicksCount), conversions: number(l.subCount ?? l.subscribersCount ?? l.claimsCount), value: Math.round(money(l.earningsNet ?? l.earningsGross)) }))))))).flat().slice(0, 12);
  const activeCreators = creators.filter(c => c.name && !/^creator /i.test(c.name)).length;
  const dailySeries = Array.from({ length: days }, (_, offset) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + offset);
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return { label, revenue: Math.round(daily.get(label) || 0) };
  });
  return { demo: false, generatedAt: new Date().toISOString(), range: days, totals: { revenue: Math.round(revenue), revenueChange: null, creators: activeCreators, fans: fanCount, fanChange: null, messages, ppvSales: Math.round(ppvSales), clicks: links.reduce((s, x) => s + x.clicks, 0), conversions: links.reduce((s, x) => s + x.conversions, 0) }, daily: dailySeries, creatorsList: creators.sort((a, b) => b.revenue - a.revenue).slice(0, 15), chatters: chatters.sort((a, b) => b.revenue - a.revenue).slice(0, 10), links, warnings };
}


export async function getDashboardData(days: number) {
  const normalizedDays = Math.min(90, Math.max(7, Number(days) || 30));
  const key = String(normalizedDays);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < cacheTtl) return cached.data;
  if (!process.env.INFLOWW_API_KEY || !process.env.INFLOWW_OID) return getDemoDashboard(normalizedDays);
  const data = await dashboard(normalizedDays);
  cache.set(key, { at: Date.now(), data });
  return data;
}
