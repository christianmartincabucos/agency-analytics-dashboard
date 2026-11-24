import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AvatarBadgeComponent } from '../../atoms/avatar-badge/avatar-badge.component';
import { BrandMarkComponent } from '../../atoms/brand-mark/brand-mark.component';
import { StatusIndicatorComponent } from '../../atoms/status-indicator/status-indicator.component';
import { NavItemComponent } from '../../molecules/nav-item/nav-item.component';

@Component({
  selector: 'app-agency-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule, AvatarBadgeComponent, BrandMarkComponent, StatusIndicatorComponent, NavItemComponent],
  template: `
    <aside class="sidebar">
      <div class="brand"><app-brand-mark/><div><strong>AFTERGLOW</strong><small>AGENCY INTELLIGENCE</small></div></div>
      <div class="agency-area">
        <button class="agency" [attr.aria-expanded]="workspaceOpen()" aria-controls="workspace-panel" (click)="togglePanel('workspace')">
          <app-avatar-badge initials="AG"/><div><b>Afterglow Agency</b><small>Workspace</small></div><mat-icon>{{ workspaceOpen() ? 'expand_less' : 'expand_more' }}</mat-icon>
        </button>
        @if (workspaceOpen()) {
          <section class="side-popover workspace-panel" id="workspace-panel" aria-label="Workspace selector">
            <div class="popover-heading">CURRENT WORKSPACE</div>
            <div class="workspace-option"><app-avatar-badge initials="AG"/><span><b>Afterglow Agency</b><small>Agency workspace</small></span><mat-icon>check_circle</mat-icon></div>
            <p>Only one workspace is connected to this dashboard.</p>
          </section>
        }
      </div>
      <div class="nav-label">WORKSPACE</div>
      <nav>
        <app-nav-item label="Overview" icon="grid_view" [active]="selected() === 'Overview'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Creators" icon="face_3" [count]="creatorCount()" [active]="selected() === 'Creators'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Chatters" icon="forum" [active]="selected() === 'Chatters'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Promotions" icon="campaign" [active]="selected() === 'Promotions'" (selected)="navigate.emit($event)"/>
      </nav>
      <div class="side-bottom">
        @if (connectionOpen()) {
          <section class="side-popover connection-panel" id="connection-panel" aria-label="Connection details">
            <div class="popover-title"><b>Infloww connection</b><button class="popover-close" aria-label="Close connection details" (click)="closePanels()"><mat-icon>close</mat-icon></button></div>
            <div class="connection-state"><app-status-indicator [tone]="demo() ? 'amber' : 'green'"/><b>{{ demo() ? 'Demo data active' : 'Live connection' }}</b></div>
            <p>{{ demo() ? 'Sample metrics are shown. Add the read-only Infloww credentials to the server environment to load live data.' : 'The dashboard is using the read-only Infloww API.' }}</p>
            <small>Last sync · {{ generatedAt() | date:'shortTime' }}</small>
            @if (warningCount()) { <small class="warning-count">{{ warningCount() }} endpoint warnings</small> }
            <button class="popover-action" [disabled]="loading()" (click)="refreshRequested.emit()"><mat-icon>{{ loading() ? 'hourglass_top' : 'refresh' }}</mat-icon>{{ loading() ? 'Refreshing…' : 'Refresh data' }}</button>
          </section>
        }
        <button class="connected" [attr.aria-expanded]="connectionOpen()" aria-controls="connection-panel" (click)="togglePanel('connection')">
          <app-status-indicator [tone]="demo() ? 'amber' : 'green'"/><span>{{ demo() ? 'Demo data active' : 'Infloww connected' }}</span><mat-icon>{{ connectionOpen() ? 'expand_more' : 'chevron_right' }}</mat-icon>
        </button>
        @if (profileOpen()) {
          <section class="side-popover profile-panel" id="profile-panel" aria-label="Profile details">
            <div class="popover-heading">SIGNED IN AS</div>
            <div class="profile-summary"><app-avatar-badge initials="CM" variant="user-avatar"/><span><b>Christian M.</b><small>Agency owner</small></span></div>
            <p>Workspace access · Afterglow Agency</p>
          </section>
        }
        <button class="user" [attr.aria-expanded]="profileOpen()" aria-controls="profile-panel" (click)="togglePanel('profile')">
          <app-avatar-badge initials="CM" variant="user-avatar"/><span><b>Christian M.</b><small>Agency owner</small></span><mat-icon>{{ profileOpen() ? 'expand_more' : 'more_horiz' }}</mat-icon>
        </button>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencySidebarComponent {
  creatorCount = input(0);
  selected = input('Overview');
  demo = input(false);
  generatedAt = input.required<string>();
  warningCount = input(0);
  loading = input(false);
  navigate = output<string>();
  refreshRequested = output<void>();
  workspaceOpen = signal(false);
  connectionOpen = signal(false);
  profileOpen = signal(false);

  togglePanel(panel: 'workspace' | 'connection' | 'profile') {
    const currentlyOpen = panel === 'workspace' ? this.workspaceOpen() : panel === 'connection' ? this.connectionOpen() : this.profileOpen();
    this.workspaceOpen.set(panel === 'workspace' && !currentlyOpen);
    this.connectionOpen.set(panel === 'connection' && !currentlyOpen);
    this.profileOpen.set(panel === 'profile' && !currentlyOpen);
  }

  closePanels() {
    this.workspaceOpen.set(false);
    this.connectionOpen.set(false);
    this.profileOpen.set(false);
  }
}
