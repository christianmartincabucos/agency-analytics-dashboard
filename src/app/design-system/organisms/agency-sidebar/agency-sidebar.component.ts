import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AvatarBadgeComponent } from '../../atoms/avatar-badge/avatar-badge.component';
import { BrandMarkComponent } from '../../atoms/brand-mark/brand-mark.component';
import { StatusIndicatorComponent } from '../../atoms/status-indicator/status-indicator.component';
import { NavItemComponent } from '../../molecules/nav-item/nav-item.component';

@Component({
  selector: 'app-agency-sidebar',
  standalone: true,
  imports: [MatIconModule, AvatarBadgeComponent, BrandMarkComponent, StatusIndicatorComponent, NavItemComponent],
  template: `
    <aside class="sidebar">
      <div class="brand"><app-brand-mark/><div><strong>AFTERGLOW</strong><small>AGENCY INTELLIGENCE</small></div></div>
      <div class="agency"><app-avatar-badge initials="AG"/><div><b>Afterglow Agency</b><small>Workspace</small></div><mat-icon>expand_more</mat-icon></div>
      <div class="nav-label">WORKSPACE</div>
      <nav>
        <app-nav-item label="Overview" icon="grid_view" [active]="selected() === 'Overview'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Creators" icon="face_3" [count]="creatorCount()" [active]="selected() === 'Creators'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Chatters" icon="forum" [active]="selected() === 'Chatters'" (selected)="navigate.emit($event)"/>
        <app-nav-item label="Promotions" icon="campaign" [active]="selected() === 'Promotions'" (selected)="navigate.emit($event)"/>
      </nav>
      <div class="side-bottom">
        <div class="connected"><app-status-indicator/><span>Infloww connected</span><mat-icon>chevron_right</mat-icon></div>
        <div class="user"><app-avatar-badge initials="CM" variant="user-avatar"/><div><b>Christian M.</b><small>Agency owner</small></div><mat-icon>more_horiz</mat-icon></div>
      </div>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgencySidebarComponent {
  creatorCount = input(0);
  selected = input('Overview');
  navigate = output<string>();
}
