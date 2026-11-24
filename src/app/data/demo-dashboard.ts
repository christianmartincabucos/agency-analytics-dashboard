import { DashboardData } from '../models/dashboard.models';

/** Representative content shown until the BFF has live credentials configured. */
export const DEMO_DASHBOARD: DashboardData = {
  demo: true,
  generatedAt: new Date().toISOString(),
  range: 30,
  totals: {
    revenue: 84260,
    revenueChange: 12.8,
    creators: 18,
    fans: 24680,
    fanChange: 8.4,
    messages: 38420,
    ppvSales: 19270,
    clicks: 12840,
    conversions: 964,
  },
  daily: [
    { label: 'Nov 11', revenue: 4180 }, { label: 'Nov 12', revenue: 5260 },
    { label: 'Nov 13', revenue: 4890 }, { label: 'Nov 14', revenue: 6330 },
    { label: 'Nov 15', revenue: 5790 }, { label: 'Nov 16', revenue: 7100 },
    { label: 'Nov 17', revenue: 6420 }, { label: 'Nov 18', revenue: 5930 },
    { label: 'Nov 19', revenue: 6810 }, { label: 'Nov 20', revenue: 7240 },
    { label: 'Nov 21', revenue: 6010 }, { label: 'Nov 22', revenue: 7880 },
    { label: 'Nov 23', revenue: 7560 }, { label: 'Nov 24', revenue: 8240 },
  ],
  creatorsList: [
    { name: 'Mia Rose', handle: '@miarose', revenue: 18420, fans: 5240, growth: 18.2 },
    { name: 'Luna Vale', handle: '@lunavale', revenue: 14280, fans: 3980, growth: 12.4 },
    { name: 'Sophie Lane', handle: '@sophielane', revenue: 11960, fans: 3420, growth: 9.8 },
    { name: 'Ava Hart', handle: '@avahart', revenue: 9840, fans: 2910, growth: 6.1 },
    { name: 'Nina Fox', handle: '@ninafox', revenue: 8260, fans: 2480, growth: -2.3 },
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
