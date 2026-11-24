import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AgencySidebarComponent } from '../../organisms/agency-sidebar/agency-sidebar.component';
import { DashboardHeaderComponent } from '../../organisms/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-analytics-shell',
  standalone: true,
  imports: [AgencySidebarComponent, DashboardHeaderComponent],
  template: `
    <div class="shell">
      <app-agency-sidebar [creatorCount]="creatorCount()" [selected]="selectedNav()" [demo]="demo()" [generatedAt]="generatedAt()" [warningCount]="warningCount()" [loading]="loading()" (navigate)="navigate.emit($event)" (refreshRequested)="refreshRequested.emit()"/>
      <main class="main">
        <app-dashboard-header [demo]="demo()" [generatedAt]="generatedAt()" (refreshRequested)="refreshRequested.emit()"/>
        <section class="content"><ng-content/></section>
      </main>
    </div>
  `,
  styles: [':host { display: block; min-height: 100vh; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsShellComponent {
  creatorCount = input(0);
  selectedNav = input('Overview');
  demo = input(false);
  generatedAt = input.required<string>();
  warningCount = input(0);
  loading = input(false);
  navigate = output<string>();
  refreshRequested = output<void>();
}
