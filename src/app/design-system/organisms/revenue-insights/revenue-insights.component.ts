import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AgencyTotals, DailyRevenue } from '../../../models/dashboard.models';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-insights',
  standalone: true,
  imports: [CommonModule, MatIconModule, BaseChartDirective],
  template: `
    <div class="overview-grid">
      <section class="panel chart-panel">
        <div class="panel-head"><div><h2>Revenue overview</h2><p>Daily net earnings · {{ range() }} day period</p></div><span class="more" aria-hidden="true">•••</span></div>
        <div class="chart"><canvas baseChart [type]="'line'" [data]="chartData()" [options]="chartOptions"></canvas></div>
        <div class="chart-legend"><i></i> Net revenue <span>·</span> <small>USD</small></div>
      </section>
      <section class="panel breakdown">
        <div class="panel-head"><div><h2>Growth snapshot</h2><p>Agency health at a glance</p></div><span class="period-tag">THIS PERIOD</span></div>
        <div class="growth-row"><div class="growth-icon violet"><mat-icon>group_add</mat-icon></div><div><b>{{ totals().fans | number }}</b><small>Fans in network</small></div><span class="trend">{{ totals().fanChange === null ? '—' : '+' + totals().fanChange + '%' }}</span></div>
        <div class="growth-row"><div class="growth-icon coral"><mat-icon>ads_click</mat-icon></div><div><b>{{ totals().clicks | number }}</b><small>Link clicks</small></div><span class="trend">{{ totals().conversions | number }} joins</span></div>
        <div class="growth-row"><div class="growth-icon mint"><mat-icon>account_balance_wallet</mat-icon></div><div><b>{{ money(totals().revenue) }}</b><small>Agency revenue</small></div><span class="trend">{{ totals().revenueChange === null ? '—' : '+' + totals().revenueChange + '%' }}</span></div>
        <div class="snapshot-foot"><div class="avatar-stack"><span>MR</span><span>LV</span><span>SL</span><span>+15</span></div><span>{{ totals().creators }} creators contributing</span></div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueInsightsComponent {
  daily = input.required<DailyRevenue[]>();
  range = input.required<number>();
  totals = input.required<AgencyTotals>();
  chartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.daily().map(day => day.label),
    datasets: [{ data: this.daily().map(day => day.revenue), label: 'Revenue', borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,.12)', fill: true, tension: .38, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2.5 }],
  }));
  chartOptions: ChartConfiguration<'line'>['options'] = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#171925', padding: 12, displayColors: false, callbacks: { label: c => '$' + Number(c.raw).toLocaleString() } } }, scales: { x: { grid: { display: false }, ticks: { color: '#777b90', maxTicksLimit: 7 } }, y: { grid: { color: 'rgba(255,255,255,.06)' }, ticks: { color: '#777b90', callback: value => '$' + (Number(value) / 1000).toFixed(0) + 'k' } } } };
  money(value: number) { return '$' + Math.round(value).toLocaleString('en-US'); }
}
