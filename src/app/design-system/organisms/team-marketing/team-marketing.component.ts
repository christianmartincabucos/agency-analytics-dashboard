import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AvatarBadgeComponent } from '../../atoms/avatar-badge/avatar-badge.component';
import { Chatter, TrackingLink } from '../../../models/dashboard.models';

@Component({
  selector: 'app-team-marketing',
  standalone: true,
  imports: [CommonModule, MatIconModule, AvatarBadgeComponent],
  template: `
    <div class="bottom-grid">
      <section class="panel table-panel" id="chatters">
        <div class="panel-head"><div><h2>Chatter leaderboard</h2><p>Sales and activity for this period</p></div><span class="period-tag">TOP PERFORMERS</span></div>
        <div class="compact-list">
          @for (chatter of chatters(); track chatter.name; let i = $index) {
            <div class="chatter-row"><span class="rank">0{{ i + 1 }}</span><app-avatar-badge [initials]="initials(chatter.name)" variant="chatter-avatar"/><div class="chatter-name"><b>{{ chatter.name }}</b><small>{{ chatter.messages | number }} messages · {{ chatter.ppv }} PPV sold</small></div><strong>{{ money(chatter.revenue) }}</strong></div>
          } @empty { <div class="empty">Chatter reporting data is not available for this period.</div> }
        </div>
      </section>
      <section class="panel table-panel" id="promotions">
        <div class="panel-head"><div><h2>Promotions &amp; tracking</h2><p>Links converting clicks into revenue</p></div><button class="text-btn" (click)="navigate.emit('Promotions')">All links <mat-icon>arrow_forward</mat-icon></button></div>
        <div class="table-wrap"><table class="links-table">
          <thead><tr><th>CAMPAIGN</th><th>CLICKS</th><th>CONV. RATE</th><th>VALUE</th></tr></thead>
          <tbody>@for (link of links(); track link.name) {
            <tr><td><b>{{ link.name }}</b><small>{{ link.creator }}</small></td><td>{{ link.clicks | number }}</td><td><span class="rate-pill">{{ rate(link) }}</span></td><td><b>{{ money(link.value) }}</b></td></tr>
          } @empty { <tr><td colspan="4" class="empty">Tracking link data is not available.</td></tr> }</tbody>
        </table></div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamMarketingComponent {
  chatters = input<Chatter[]>([]);
  links = input<TrackingLink[]>([]);
  navigate = output<string>();
  initials(name: string) { return name.split(' ').map(part => part[0]).join(''); }
  money(value: number) { return '$' + Math.round(value).toLocaleString('en-US'); }
  rate(link: TrackingLink) { return link.clicks ? `${(link.conversions / link.clicks * 100).toFixed(1)}%` : '—'; }
}
