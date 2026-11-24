import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RangeSelectorComponent } from './range-selector.component';

describe('RangeSelectorComponent', () => {
  it('emits the chosen 7, 30, or 90 day range and marks the active option', () => {
    const fixture = TestBed.createComponent(RangeSelectorComponent);
    fixture.componentRef.setInput('selected', 30);
    fixture.detectChanges();
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('.range-switch button')) as HTMLButtonElement[];
    const selected: number[] = [];
    fixture.componentInstance.rangeSelected.subscribe(days => selected.push(days));

    expect(buttons.map(button => button.textContent?.replace('sync', '').trim())).toEqual(['7 days', '30 days', '90 days', 'Refresh']);
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    buttons[0].click();
    buttons[2].click();

    expect(selected).toEqual([7, 90]);
  });

  it('emits a refresh request from its refresh control', () => {
    const fixture = TestBed.createComponent(RangeSelectorComponent);
    fixture.componentRef.setInput('selected', 7);
    fixture.detectChanges();
    let refreshCount = 0;
    fixture.componentInstance.refreshRequested.subscribe(() => refreshCount++);

    (fixture.nativeElement.querySelector('.download') as HTMLButtonElement).click();
    expect(refreshCount).toBe(1);
  });
});
