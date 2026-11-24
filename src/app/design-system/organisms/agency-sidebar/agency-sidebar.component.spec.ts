import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AgencySidebarComponent } from './agency-sidebar.component';

describe('AgencySidebarComponent', () => {
  const createSidebar = () => {
    const fixture = TestBed.createComponent(AgencySidebarComponent);
    fixture.componentRef.setInput('creatorCount', 8);
    fixture.componentRef.setInput('generatedAt', '2026-11-24T08:00:00.000Z');
    fixture.detectChanges();
    return fixture;
  };

  it('emits navigation for all four dashboard sections', () => {
    const fixture = createSidebar();
    const destinations: string[] = [];
    fixture.componentInstance.navigate.subscribe(destination => destinations.push(destination));
    const buttons = Array.from(fixture.nativeElement.querySelectorAll('nav button')) as HTMLButtonElement[];

    expect(buttons).toHaveLength(4);
    for (const button of buttons) button.click();
    expect(destinations).toEqual(['Overview', 'Creators', 'Chatters', 'Promotions']);
  });

  it('opens and closes the current workspace selector', () => {
    const fixture = createSidebar();
    const workspace = fixture.nativeElement.querySelector('.agency') as HTMLButtonElement;
    workspace.click();
    fixture.detectChanges();

    expect(workspace.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.workspace-panel').textContent).toContain('Afterglow Agency');
    expect(fixture.nativeElement.querySelector('.workspace-panel').textContent).toContain('Only one workspace is connected');

    workspace.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.workspace-panel')).toBeNull();
  });

  it('shows connection diagnostics and lets the user refresh from the sidebar', () => {
    const fixture = createSidebar();
    fixture.componentRef.setInput('demo', true);
    fixture.componentRef.setInput('warningCount', 2);
    fixture.detectChanges();
    const connection = fixture.nativeElement.querySelector('.connected') as HTMLButtonElement;
    connection.click();
    fixture.detectChanges();
    let refreshCount = 0;
    fixture.componentInstance.refreshRequested.subscribe(() => refreshCount++);

    const panel = fixture.nativeElement.querySelector('.connection-panel');
    expect(panel.textContent).toContain('Demo data active');
    expect(panel.textContent).toContain('2 endpoint warnings');
    (panel.querySelector('.popover-action') as HTMLButtonElement).click();
    expect(refreshCount).toBe(1);
  });

  it('opens profile details from the account control', () => {
    const fixture = createSidebar();
    (fixture.nativeElement.querySelector('.user') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.profile-panel').textContent).toContain('Christian M.');
    expect(fixture.nativeElement.querySelector('.profile-panel').textContent).toContain('Agency owner');
  });
});
