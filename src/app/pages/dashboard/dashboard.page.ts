import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardData } from '../../models/dashboard.models';
import { DEMO_DASHBOARD } from '../../data/demo-dashboard';
import { AnalyticsShellComponent } from '../../design-system/templates/analytics-shell/analytics-shell.component';
import { DataNoticesComponent } from '../../design-system/organisms/data-notices/data-notices.component';
import { KpiOverviewComponent } from '../../design-system/organisms/kpi-overview/kpi-overview.component';
import { RevenueInsightsComponent } from '../../design-system/organisms/revenue-insights/revenue-insights.component';
import { CreatorPerformanceComponent } from '../../design-system/organisms/creator-performance/creator-performance.component';
import { TeamMarketingComponent } from '../../design-system/organisms/team-marketing/team-marketing.component';
import { RangeSelectorComponent } from '../../design-system/molecules/range-selector/range-selector.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, AnalyticsShellComponent, DataNoticesComponent, KpiOverviewComponent, RevenueInsightsComponent, CreatorPerformanceComponent, TeamMarketingComponent, RangeSelectorComponent],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly http = inject(HttpClient);
  readonly data = signal<DashboardData>(DEMO_DASHBOARD);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly range = signal(30);
  readonly selectedNav = signal('Overview');
  readonly todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  readonly creatorCount = computed(() => this.data().totals.creators);

  constructor() { this.refresh(); }

  refresh() {
    this.loading.set(true);
    this.error.set('');
    this.http.get<DashboardData>(`/api/dashboard?days=${this.range()}`).subscribe({
      next: response => { this.data.set(response); this.loading.set(false); },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not reach the dashboard service. Start the Node server and check its configuration.');
      },
    });
  }

  setRange(days: number) { this.range.set(days); this.refresh(); }

  navigate(name: string) {
    this.selectedNav.set(name);
    if (name !== 'Overview') document.getElementById(name.toLowerCase().replaceAll(' ', '-'))?.scrollIntoView({ behavior: 'smooth' });
  }
}
