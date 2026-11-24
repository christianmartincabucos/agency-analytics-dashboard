import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { getDemoDashboard } from '../../../../../shared/demo-dashboard';
import { CreatorPerformanceComponent } from './creator-performance.component';

describe('CreatorPerformanceComponent', () => {
  it('sorts creators by revenue and fans, and updates the sort label', () => {
    const fixture = TestBed.createComponent(CreatorPerformanceComponent);
    fixture.componentRef.setInput('creators', getDemoDashboard(30).creatorsList);
    fixture.detectChanges();

    const names = () => Array.from(fixture.nativeElement.querySelectorAll('.creator-cell b') as NodeListOf<HTMLElement>).map(node => node.textContent?.trim());
    const sortButton = fixture.nativeElement.querySelector('.outline') as HTMLButtonElement;
    let destination = '';
    fixture.componentInstance.navigate.subscribe(value => destination = value);

    expect(sortButton.textContent).toContain('Revenue');
    expect(names().slice(0, 3)).toEqual(['Mia Rose', 'Luna Vale', 'Sophie Lane']);

    sortButton.click();
    fixture.detectChanges();

    expect(sortButton.textContent).toContain('Fans');
    expect(names().slice(0, 3)).toEqual(['Luna Vale', 'Sophie Lane', 'Mia Rose']);

    sortButton.click();
    fixture.detectChanges();
    expect(sortButton.textContent).toContain('Revenue');
    expect(names()[0]).toBe('Mia Rose');

    (fixture.nativeElement.querySelector('.text-btn') as HTMLButtonElement).click();
    expect(destination).toBe('Creators');
  });

  it('filters creators by search text and displays an empty state for no match', () => {
    const fixture = TestBed.createComponent(CreatorPerformanceComponent);
    fixture.componentRef.setInput('creators', getDemoDashboard(30).creatorsList);
    fixture.detectChanges();
    const search = fixture.nativeElement.querySelector('.search input') as HTMLInputElement;

    search.value = 'luna';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.creator-cell b')).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('.creator-cell b').textContent).toContain('Luna Vale');

    search.value = 'not a creator';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty').textContent).toContain('No creators match');
  });
});
