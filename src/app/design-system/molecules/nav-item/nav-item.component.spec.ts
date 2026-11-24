import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { NavItemComponent } from './nav-item.component';

describe('NavItemComponent', () => {
  it('emits its destination and exposes the active state', () => {
    const fixture = TestBed.createComponent(NavItemComponent);
    fixture.componentRef.setInput('label', 'Chatters');
    fixture.componentRef.setInput('icon', 'forum');
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    let destination = '';
    fixture.componentInstance.selected.subscribe(value => destination = value);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.classList.contains('active')).toBe(true);
    button.click();
    expect(destination).toBe('Chatters');
  });
});
