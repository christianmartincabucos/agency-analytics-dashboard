import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getDemoDashboard } from '../../data/demo-dashboard';
import { DashboardPageComponent } from './dashboard.page';

describe('DashboardPageComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [DashboardPageComponent],
    providers: [provideHttpClient(), provideHttpClientTesting()],
  }));

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('fetches the selected 7, 30, and 90 day ranges with GET and updates the page data', () => {
    const page = TestBed.runInInjectionContext(() => new DashboardPageComponent());
    const requests = TestBed.inject(HttpTestingController);

    const initial = requests.expectOne('/api/dashboard?days=30');
    expect(initial.request.method).toBe('GET');
    initial.flush(getDemoDashboard(30));

    for (const days of [7, 30, 90]) {
      page.setRange(days);
      const request = requests.expectOne(`/api/dashboard?days=${days}`);
      expect(request.request.method).toBe('GET');
      request.flush(getDemoDashboard(days));
      expect(page.range()).toBe(days);
      expect(page.data().range).toBe(days);
      expect(page.data().daily).toHaveLength(days);
    }

    page.refresh();
    const refresh = requests.expectOne('/api/dashboard?days=90');
    expect(refresh.request.method).toBe('GET');
    refresh.flush(getDemoDashboard(90));
    expect(page.loading()).toBe(false);
  });

  it('updates selected navigation state when a section is chosen', () => {
    const page = TestBed.runInInjectionContext(() => new DashboardPageComponent());
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/dashboard?days=30').flush(getDemoDashboard(30));

    page.navigate('Creators');
    expect(page.selectedNav()).toBe('Creators');
  });

  it('clears loading and reports an API error when the dashboard request fails', () => {
    const page = TestBed.runInInjectionContext(() => new DashboardPageComponent());
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/dashboard?days=30').flush({ message: 'upstream unavailable' }, { status: 502, statusText: 'Bad Gateway' });

    expect(page.loading()).toBe(false);
    expect(page.error()).toContain('Could not reach the dashboard service');
  });
});
