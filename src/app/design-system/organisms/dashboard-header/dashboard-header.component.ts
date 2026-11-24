import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StatusIndicatorComponent } from '../../atoms/status-indicator/status-indicator.component';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, StatusIndicatorComponent],
  template: `
    <header class="topbar">
      <div class="crumb">Workspace <mat-icon>chevron_right</mat-icon> <b>Analytics</b></div>
      <div class="top-actions">
        <div class="live-pill" [class.demo]="demo()"><app-status-indicator [tone]="demo() ? 'amber' : 'green'"/>{{ demo() ? 'DEMO DATA' : 'LIVE DATA' }}</div>
        <button class="icon-btn" (click)="refreshRequested.emit()" aria-label="Refresh"><mat-icon>refresh</mat-icon></button>
        <div class="date">{{ generatedAt() | date:'MMM d, y' }}</div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeaderComponent {
  demo = input(false);
  generatedAt = input.required<string>();
  refreshRequested = output<void>();
}
