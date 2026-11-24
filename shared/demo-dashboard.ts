import type { DashboardData } from './dashboard.models.js';

const referenceMonth = 84260;
const revenuePattern = [4180, 5260, 4890, 6330, 5790, 7100, 6420, 5930, 6810, 7240, 6010, 7880, 7560, 8240];
const rawSeries = Array.from({ length: 90 }, (_, index) => {
  const trend = 0.88 + (index / 89) * 0.24;
  return revenuePattern[index % revenuePattern.length] * trend;
});
const rawMonthTotal = rawSeries.slice(-30).reduce((sum, value) => sum + value, 0);
const scaleToMonth = referenceMonth / rawMonthTotal;
const ninetyDaySeries = rawSeries.map(value => Math.round(value * scaleToMonth));
ninetyDaySeries[ninetyDaySeries.length - 1] += referenceMonth - ninetyDaySeries.slice(-30).reduce((sum, value) => sum + value, 0);

const makeDailyRevenue = (days: number) => Array.from({ length: days }, (_, offset) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - days + offset + 1);
  return {
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    revenue: ninetyDaySeries[90 - days + offset],
  };
});

const baseDashboard: DashboardData = {
  demo: true,
  generatedAt: new Date().toISOString(),
  range: 30,
  totals: {
    revenue: referenceMonth,
    revenueChange: 12.8,
    creators: 18,
    fans: 24680,
    fanChange: 8.4,
    messages: 38420,
    ppvSales: 19270,
    clicks: 12840,
    conversions: 964,
  },
  daily: makeDailyRevenue(30),
  creatorsList: [
    { name: 'Mia Rose', handle: '@miarose', revenue: 18420, fans: 3500, growth: 18.2 },
    { name: 'Luna Vale', handle: '@lunavale', revenue: 14280, fans: 5240, growth: 12.4 },
    { name: 'Sophie Lane', handle: '@sophielane', revenue: 11960, fans: 3980, growth: 9.8 },
    { name: 'Ava Hart', handle: '@avahart', revenue: 9840, fans: 2480, growth: 6.1 },
    { name: 'Nina Fox', handle: '@ninafox', revenue: 8260, fans: 2910, growth: -2.3 },
  ],
  chatters: [
    { name: 'Alex Morgan', revenue: 12840, messages: 8420, ppv: 146 },
    { name: 'Jamie Chen', revenue: 10920, messages: 7680, ppv: 128 },
    { name: 'Taylor Reed', revenue: 9840, messages: 7140, ppv: 112 },
    { name: 'Jordan Blake', revenue: 7620, messages: 5930, ppv: 84 },
  ],
  links: [
    { name: 'November VIP Push', creator: 'Mia Rose', clicks: 4280, conversions: 342, value: 8460 },
    { name: 'Black Friday Preview', creator: 'Luna Vale', clicks: 3620, conversions: 289, value: 7120 },
    { name: 'Welcome Offer 20%', creator: 'Sophie Lane', clicks: 2840, conversions: 198, value: 4960 },
    { name: 'New Year Warmup', creator: 'Ava Hart', clicks: 2100, conversions: 135, value: 3280 },
  ],
  warnings: [],
};

/** Returns consistent, range-aware sample data for local previews and automated tests. */
export function getDemoDashboard(days: number): DashboardData {
  const range = Math.min(90, Math.max(7, Math.round(days)));
  const daily = makeDailyRevenue(range);
  const revenue = daily.reduce((sum, day) => sum + day.revenue, 0);
  const scale = revenue / referenceMonth;
  const scaled = (value: number) => Math.round(value * scale);

  return {
    ...baseDashboard,
    generatedAt: new Date().toISOString(),
    range,
    totals: {
      ...baseDashboard.totals,
      revenue,
      revenueChange: Math.round(baseDashboard.totals.revenueChange! * scale * 10) / 10,
      fanChange: Math.round(baseDashboard.totals.fanChange! * scale * 10) / 10,
      messages: scaled(baseDashboard.totals.messages),
      ppvSales: scaled(baseDashboard.totals.ppvSales),
      clicks: scaled(baseDashboard.totals.clicks),
      conversions: scaled(baseDashboard.totals.conversions),
    },
    daily,
    creatorsList: baseDashboard.creatorsList.map(creator => ({ ...creator, revenue: scaled(creator.revenue) })),
    chatters: baseDashboard.chatters.map(chatter => ({ ...chatter, revenue: scaled(chatter.revenue), messages: scaled(chatter.messages), ppv: scaled(chatter.ppv) })),
    links: baseDashboard.links.map(link => ({ ...link, clicks: scaled(link.clicks), conversions: scaled(link.conversions), value: scaled(link.value) })),
  };
}

export const DEMO_DASHBOARD = getDemoDashboard(30);
