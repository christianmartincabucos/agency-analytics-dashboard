import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

export interface MetricCardModel {
  title: string;
  value: string;
  icon: string;
  primary?: boolean;
  delta?: string;
  deltaIcon?: string;
  deltaTone?: 'positive' | 'negative';
  detail?: string;
  sparkline?: boolean;
}

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <article class="kpi" [class.primary]="metric().primary">
      <div class="kpi-head"><span>{{ metric().title }}</span><mat-icon>{{ metric().icon }}</mat-icon></div>
      <div class="kpi-value">{{ metric().value }}</div>
      <div class="kpi-foot">
        <div class="kpi-footline">
          @if (metric().delta) {
            <span [class.positive]="metric().deltaTone !== 'negative'" [class.negative]="metric().deltaTone === 'negative'">
              @if (metric().deltaIcon) { <mat-icon>{{ metric().deltaIcon }}</mat-icon> }
              {{ metric().delta }}
            </span>
          }
          @if (metric().detail) { <span class="muted">{{ metric().detail }}</span> }
        </div>
        @if (metric().sparkline) {
          <svg class="spark" viewBox="0 0 84 24" role="img" aria-label="Revenue trend">
            <rect x="0" y="15" width="8" height="9" rx="1"/><rect x="11" y="12" width="8" height="12" rx="1"/>
            <rect x="22" y="14" width="8" height="10" rx="1"/><rect x="33" y="7" width="8" height="17" rx="1"/>
            <rect x="44" y="9" width="8" height="15" rx="1"/><rect x="55" y="4" width="8" height="20" rx="1"/>
            <rect x="66" y="7" width="8" height="17" rx="1"/><rect x="77" y="2" width="7" height="22" rx="1"/>
          </svg>
        }
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricCardComponent {
  metric = input.required<MetricCardModel>();
}
