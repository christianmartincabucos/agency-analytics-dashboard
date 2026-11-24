import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand-mark',
  standalone: true,
  template: '<span class="brand-mark" aria-hidden="true">a<span>.</span></span>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandMarkComponent {}
