import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface Creator { name: string; handle: string; revenue: number; fans: number; growth: number | null; }
interface Chatter { name: string; revenue: number; messages: number; ppv: number; }
interface Link { name: string; creator: string; clicks: number; conversions: number; value: number; }
interface DashboardData { demo: boolean; generatedAt: string; range: number; totals: { revenue: number; revenueChange: number | null; creators: number; fans: number; fanChange: number | null; messages: number; ppvSales: number; clicks: number; conversions: number; }; daily: { label: string; revenue: number }[]; creatorsList: Creator[]; chatters: Chatter[]; links: Link[]; warnings: string[]; }

const demoData: DashboardData = {
  demo: true, generatedAt: new Date().toISOString(), range: 30,
  totals: { revenue: 84260, revenueChange: 12.8, creators: 18, fans: 24680, fanChange: 8.4, messages: 38420, ppvSales: 19270, clicks: 12840, conversions: 964 },
  daily: Array.from({length: 14}, (_, i) => ({ label: ['Nov 11','Nov 12','Nov 13','Nov 14','Nov 15','Nov 16','Nov 17','Nov 18','Nov 19','Nov 20','Nov 21','Nov 22','Nov 23','Nov 24'][i], revenue: [4180,5260,4890,6330,5790,7100,6420,5930,6810,7240,6010,7880,7560,8240][i] })),
  creatorsList: [{name:'Mia Rose',handle:'@miarose',revenue:18420,fans:5240,growth:18.2},{name:'Luna Vale',handle:'@lunavale',revenue:14280,fans:3980,growth:12.4},{name:'Sophie Lane',handle:'@sophielane',revenue:11960,fans:3420,growth:9.8},{name:'Ava Hart',handle:'@avahart',revenue:9840,fans:2910,growth:6.1},{name:'Nina Fox',handle:'@ninafox',revenue:8260,fans:2480,growth:-2.3}],
  chatters: [{name:'Alex Morgan',revenue:12840,messages:8420,ppv:146},{name:'Jamie Chen',revenue:10920,messages:7680,ppv:128},{name:'Taylor Reed',revenue:9840,messages:7140,ppv:112},{name:'Jordan Blake',revenue:7620,messages:5930,ppv:84}],
  links: [{name:'November VIP Push',creator:'Mia Rose',clicks:4280,conversions:342,value:8460},{name:'Black Friday Preview',creator:'Luna Vale',clicks:3620,conversions:289,value:7120},{name:'Welcome Offer 20%',creator:'Sophie Lane',clicks:2840,conversions:198,value:4960},{name:'New Year Warmup',creator:'Ava Hart',clicks:2100,conversions:135,value:3280}], warnings: []
};

@Component({ selector: 'app-root', standalone: true, imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, BaseChartDirective], templateUrl: './app.html', styleUrl: './app.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class App {
  private http = inject(HttpClient);
  data = signal<DashboardData>(demoData);
  loading = signal(false);
  error = signal('');
  range = signal(30);
  selected = signal('Overview');
  search = signal('');
  sortBy = signal<'revenue' | 'fans'>('revenue');
  creators = computed(() => this.data().creatorsList.filter(c => c.name.toLowerCase().includes(this.search().toLowerCase()) || c.handle.includes(this.search().toLowerCase())).sort((a,b) => b[this.sortBy()] - a[this.sortBy()]));
  chartData = computed<ChartConfiguration<'line'>['data']>(() => ({ labels: this.data().daily.map(d => d.label), datasets: [{ data: this.data().daily.map(d => d.revenue), label: 'Revenue', borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,.12)', fill: true, tension: .38, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5 }] }));
  chartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#171925', padding: 12, displayColors: false, callbacks: { label: c => '$' + Number(c.raw).toLocaleString() } } }, scales: { x: { grid: { display: false }, ticks: { color: '#777b90', maxTicksLimit: 7 } }, y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#777b90', callback: value => '$' + (Number(value) / 1000).toFixed(0) + 'k' } } } };
  constructor() { this.refresh(); }
  refresh() { this.loading.set(true); this.error.set(''); this.http.get<DashboardData>(`/api/dashboard?days=${this.range()}`).subscribe({ next: d => { this.data.set(d); this.loading.set(false); }, error: () => { this.loading.set(false); this.error.set('Could not reach the dashboard service. Start the Node server and check its configuration.'); } }); }
  setRange(days: number) { this.range.set(days); this.refresh(); }
  nav(name: string) { this.selected.set(name); if (name !== 'Overview') document.getElementById(name.toLowerCase().replaceAll(' ', '-'))?.scrollIntoView({ behavior: 'smooth' }); }
  money(n: number) { return '$' + Math.round(n).toLocaleString('en-US'); }
  rate(link: Link) { return link.clicks ? (link.conversions / link.clicks * 100).toFixed(1) + '%' : '—'; }
}
