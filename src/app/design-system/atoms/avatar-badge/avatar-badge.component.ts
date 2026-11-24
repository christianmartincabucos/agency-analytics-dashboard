import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar-badge',
  standalone: true,
  template: '<span [class]="variant()" aria-hidden="true">{{ initials() }}</span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarBadgeComponent {
  initials = input.required<string>();
  variant = input('agency-avatar');
}
