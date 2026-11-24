import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-range-selector',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="range-switch" role="group" aria-label="Date range">
      @for (days of ranges; track days) {
        <button [class.selected]="selected() === days" [attr.aria-pressed]="selected() === days" (click)="rangeSelected.emit(days)">{{ days }} days</button>
      }
      <button class="download" (click)="refreshRequested.emit()"><mat-icon>sync</mat-icon> Refresh</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSelectorComponent {
  readonly ranges = [7, 30, 90];
  selected = input.required<number>();
  rangeSelected = output<number>();
  refreshRequested = output<void>();
}
