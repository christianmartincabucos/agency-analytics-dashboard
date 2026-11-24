import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  template: '<span class="status-dot" [class.amber]="tone() === \'amber\'" aria-hidden="true"></span>',
  styles: [`.status-dot { display: inline-block; width: 7px; height: 7px; flex: none; border-radius: 50%; background: #51d4aa; box-shadow: 0 0 9px #51d4aa66; } .status-dot.amber { background: #e2ad51; box-shadow: none; }`],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusIndicatorComponent {
  tone = input<'green' | 'amber'>('green');
}
