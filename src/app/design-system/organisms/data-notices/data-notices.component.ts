import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-data-notices',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (error()) { <div class="error"><mat-icon>warning</mat-icon>{{ error() }} <button (click)="retry.emit()">Retry</button></div> }
    @if (warnings().length) {
      <div class="notice"><mat-icon>info</mat-icon>Partial data: {{ warnings().length }} Infloww endpoint{{ warnings().length === 1 ? '' : 's' }} could not be loaded.
        <details><summary>Details</summary><ul>@for (warning of warnings(); track warning) { <li>{{ warning }}</li> }</ul></details>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataNoticesComponent {
  error = input('');
  warnings = input<string[]>([]);
  retry = output<void>();
}
