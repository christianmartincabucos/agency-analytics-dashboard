import { describe, expect, it } from 'vitest';
import { getDemoDashboard } from './demo-dashboard';

describe('getDemoDashboard', () => {
  it.each([7, 30, 90])('returns %i days of matching sample data', days => {
    const dashboard = getDemoDashboard(days);

    expect(dashboard.range).toBe(days);
    expect(dashboard.daily).toHaveLength(days);
    expect(dashboard.totals.revenue).toBe(dashboard.daily.reduce((sum, day) => sum + day.revenue, 0));
  });

  it('changes period metrics when the selected range changes', () => {
    const week = getDemoDashboard(7);
    const month = getDemoDashboard(30);
    const quarter = getDemoDashboard(90);

    expect(week.totals.revenue).toBeLessThan(month.totals.revenue);
    expect(month.totals.revenue).toBeLessThan(quarter.totals.revenue);
    expect(week.totals.messages).toBeLessThan(month.totals.messages);
    expect(month.totals.clicks).toBeLessThan(quarter.totals.clicks);
  });
});
