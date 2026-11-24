export interface Creator {
  name: string;
  handle: string;
  revenue: number;
  fans: number;
  growth: number | null;
}

export interface Chatter {
  name: string;
  revenue: number;
  messages: number;
  ppv: number;
}

export interface TrackingLink {
  name: string;
  creator: string;
  clicks: number;
  conversions: number;
  value: number;
}

export interface AgencyTotals {
  revenue: number;
  revenueChange: number | null;
  creators: number;
  fans: number;
  fanChange: number | null;
  messages: number;
  ppvSales: number;
  clicks: number;
  conversions: number;
}

export interface DailyRevenue {
  label: string;
  revenue: number;
}

export interface DashboardData {
  demo: boolean;
  generatedAt: string;
  range: number;
  totals: AgencyTotals;
  daily: DailyRevenue[];
  creatorsList: Creator[];
  chatters: Chatter[];
  links: TrackingLink[];
  warnings: string[];
}
