import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DashboardHeaderComponent } from './dashboard-header.component';

describe('DashboardHeaderComponent', () => {
  it('shows demo or live status and emits refresh requests', () => {
    const fixture = TestBed.createComponent(DashboardHeaderComponent);
    fixture.componentRef.setInput('demo', true);
    fixture.componentRef.setInput('generatedAt', '2026-11-24T00:00:00.000Z');
    fixture.detectChanges();
    let refreshCount = 0;
    fixture.componentInstance.refreshRequested.subscribe(() => refreshCount++);

    expect(fixture.nativeElement.textContent).toContain('DEMO DATA');
    (fixture.nativeElement.querySelector('.icon-btn') as HTMLButtonElement).click();
    expect(refreshCount).toBe(1);

    fixture.componentRef.setInput('demo', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('LIVE DATA');
  });
});
