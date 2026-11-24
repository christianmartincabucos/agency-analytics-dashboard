import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { getDemoDashboard } from '../../../../../shared/demo-dashboard';
import { KpiOverviewComponent } from './kpi-overview.component';

describe('KpiOverviewComponent', () => {
  it('renders agency metrics and avoids demo-only changes in live mode', () => {
    const fixture = TestBed.createComponent(KpiOverviewComponent);
    fixture.componentRef.setInput('totals', getDemoDashboard(30).totals);
    fixture.componentRef.setInput('demo', false);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.kpi');
    expect(cards).toHaveLength(5);
    expect(cards[0].textContent).toContain('$84,260');
    expect(cards[1].textContent).toContain('Creator roster');
    expect(cards[1].textContent).not.toContain('+2');
    expect(fixture.nativeElement.querySelector('.spark')).toBeNull();
  });
});
