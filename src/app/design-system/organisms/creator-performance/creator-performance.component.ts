import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AvatarBadgeComponent } from '../../atoms/avatar-badge/avatar-badge.component';
import { Creator } from '../../../models/dashboard.models';

@Component({
  selector: 'app-creator-performance',
  standalone: true,
  imports: [CommonModule, MatIconModule, AvatarBadgeComponent],
  template: `
    <section class="panel table-panel" id="creators">
      <div class="panel-head">
        <div><h2>Creator performance</h2><p>Your top performers by revenue this period</p></div>
        <div class="table-tools">
          <label class="search"><mat-icon>search</mat-icon><input placeholder="Find creator..." [value]="search()" (input)="search.set($any($event.target).value)"></label>
          <button class="outline" (click)="sortBy.set(sortBy() === 'revenue' ? 'fans' : 'revenue')"><mat-icon>swap_vert</mat-icon>Sort: {{ sortBy() === 'revenue' ? 'Revenue' : 'Fans' }}</button>
          <button class="text-btn" (click)="navigate.emit('Creators')">View all <mat-icon>arrow_forward</mat-icon></button>
        </div>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>CREATOR</th><th>NET REVENUE</th><th>ACTIVE FANS</th><th>PERIOD GROWTH</th><th>PERFORMANCE</th></tr></thead>
        <tbody>
          @for (creator of visibleCreators(); track creator.handle; let i = $index) {
            <tr>
              <td><div class="creator-cell"><app-avatar-badge [initials]="initials(creator.name)" [variant]="'creator-avatar tone-' + (i % 4)"/><div><b>{{ creator.name }}</b><small>{{ creator.handle }}</small></div></div></td>
              <td><b>{{ money(creator.revenue) }}</b></td><td>{{ creator.fans | number }}</td>
              <td><span [class.positive]="creator.growth !== null && creator.growth >= 0" [class.negative]="creator.growth !== null && creator.growth < 0">{{ growthLabel(creator.growth) }}</span></td>
              <td>@if (demo()) { <div class="mini-bars" aria-label="Illustrative performance trend"><i [style.height.%]="38+i*7"></i><i [style.height.%]="55+i*5"></i><i [style.height.%]="42+i*8"></i><i [style.height.%]="72-i*3"></i><i [style.height.%]="62+i*5"></i><i [style.height.%]="82-i*4"></i><i [style.height.%]="90-i*2"></i></div> } @else { <span class="muted">—</span> }</td>
            </tr>
          } @empty { <tr><td colspan="5" class="empty">No creators match your search.</td></tr> }
        </tbody>
      </table></div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorPerformanceComponent {
  creators = input<Creator[]>([]);
  demo = input(false);
  navigate = output<string>();
  search = signal('');
  sortBy = signal<'revenue' | 'fans'>('revenue');
  visibleCreators = computed(() => this.creators()
    .filter(creator => creator.name.toLowerCase().includes(this.search().toLowerCase()) || creator.handle.toLowerCase().includes(this.search().toLowerCase()))
    .sort((a, b) => b[this.sortBy()] - a[this.sortBy()]));
  money(value: number) { return '$' + Math.round(value).toLocaleString('en-US'); }
  initials(name: string) { return name.split(' ').map(part => part[0]).join(''); }
  growthLabel(value: number | null) { return value === null ? '—' : `${value > 0 ? '+' : ''}${value}%`; }
}
