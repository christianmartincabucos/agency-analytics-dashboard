import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav-item',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <button [class.active]="active()" (click)="selected.emit(label())">
      <mat-icon>{{ icon() }}</mat-icon>{{ label() }}
      @if (count() !== null) { <span class="nav-count">{{ count() }}</span> }
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavItemComponent {
  label = input.required<string>();
  icon = input.required<string>();
  active = input(false);
  count = input<number | null>(null);
  selected = output<string>();
}
