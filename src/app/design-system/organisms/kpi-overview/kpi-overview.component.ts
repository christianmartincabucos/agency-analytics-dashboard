import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MetricCardComponent, MetricCardModel } from '../../molecules/metric-card/metric-card.component';
import { AgencyTotals } from '../../../models/dashboard.models';

const money = (value: number) => '$' + Math.round(value).toLocaleString('en-US');

@Component({
  selector: 'app-kpi-overview',
  standalone: true,
  imports: [MetricCardComponent],
  template: `<section class="kpis" aria-label="Agency key performance indicators">
    @for (metric of metrics(); track metric.title) { <app-metric-card [metric]="metric"/> }
  </section>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiOverviewComponent {
  totals = input.required<AgencyTotals>();
  demo = input(false);
  metrics = computed<MetricCardModel[]>(() => {
    const value = this.totals();
    return [
      { title: 'NET REVENUE', value: money(value.revenue), icon: 'payments', primary: true, delta: value.revenueChange === null ? undefined : `${value.revenueChange}%`, deltaIcon: 'trending_up', detail: value.revenueChange === null ? 'No comparison' : 'vs previous period', sparkline: this.demo() },
      { title: 'ACTIVE CREATORS', value: String(value.creators), icon: 'face_3', delta: this.demo() ? '+2' : undefined, deltaIcon: 'north_east', detail: this.demo() ? 'this month' : 'Creator roster' },
      { title: 'FAN BASE', value: value.fans.toLocaleString('en-US'), icon: 'group', delta: value.fanChange === null ? undefined : `${value.fanChange}%`, deltaIcon: 'trending_up', detail: value.fanChange === null ? 'Period growth unavailable' : 'growth this period' },
      { title: 'MESSAGES SENT', value: value.messages.toLocaleString('en-US'), icon: 'chat_bubble_outline', detail: 'Across all chatter shifts' },
      { title: 'PPV SALES', value: money(value.ppvSales), icon: 'lock_open', detail: 'From direct messages' },
    ];
  });
}
