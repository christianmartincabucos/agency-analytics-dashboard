import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DataNoticesComponent } from './data-notices.component';

describe('DataNoticesComponent', () => {
  it('shows endpoint warnings and emits retry requests', () => {
    const fixture = TestBed.createComponent(DataNoticesComponent);
    fixture.componentRef.setInput('warnings', ['Transactions: unavailable']);
    fixture.componentRef.setInput('error', 'Service unavailable');
    fixture.detectChanges();
    let retries = 0;
    fixture.componentInstance.retry.subscribe(() => retries++);

    expect(fixture.nativeElement.textContent).toContain('Partial data: 1 Infloww endpoint');
    expect(fixture.nativeElement.textContent).toContain('Service unavailable');
    (fixture.nativeElement.querySelector('.error button') as HTMLButtonElement).click();
    expect(retries).toBe(1);
  });
});
