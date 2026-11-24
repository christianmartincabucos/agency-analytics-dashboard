import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TeamMarketingComponent } from './team-marketing.component';

describe('TeamMarketingComponent', () => {
  it('shows chatter metrics, calculates link conversion rate, and emits the links navigation', () => {
    const fixture = TestBed.createComponent(TeamMarketingComponent);
    fixture.componentRef.setInput('chatters', [{ name: 'Alex Morgan', revenue: 1250, messages: 320, ppv: 8 }]);
    fixture.componentRef.setInput('links', [{ name: 'Spring campaign', creator: 'Mia Rose', clicks: 200, conversions: 30, value: 750 }]);
    fixture.detectChanges();
    let destination = '';
    fixture.componentInstance.navigate.subscribe(value => destination = value);

    expect(fixture.nativeElement.textContent).toContain('320 messages · 8 PPV sold');
    expect(fixture.nativeElement.querySelector('.rate-pill').textContent).toBe('15.0%');
    (fixture.nativeElement.querySelector('.text-btn') as HTMLButtonElement).click();
    expect(destination).toBe('Promotions');
  });
});
