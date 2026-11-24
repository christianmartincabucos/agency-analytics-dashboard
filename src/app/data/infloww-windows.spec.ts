import { describe, expect, it } from 'vitest';
import { splitInflowwRange } from '../../../shared/infloww-windows.js';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('splitInflowwRange', () => {
  it('keeps millisecond windows within 31 days with no gaps or overlaps', () => {
    const start = Date.UTC(2026, 7, 27);
    const end = Date.UTC(2026, 10, 23, 23, 59, 59, 999);
    const windows = splitInflowwRange(new Date(start), new Date(end));

    expect(windows).toHaveLength(3);
    expect(Number(windows[0].startTime)).toBe(start);
    expect(Number(windows.at(-1)!.endTime)).toBe(end);
    for (let index = 0; index < windows.length; index++) {
      const from = Number(windows[index].startTime);
      const to = Number(windows[index].endTime);
      expect(to - from + 1).toBeLessThanOrEqual(31 * DAY_MS);
      if (index > 0) expect(from).toBe(Number(windows[index - 1].endTime) + 1);
    }
  });

  it('splits date-only reports into adjacent inclusive 31-day windows', () => {
    const start = new Date(Date.UTC(2026, 7, 27));
    const end = new Date(Date.UTC(2026, 10, 23, 23, 59, 59, 999));
    const windows = splitInflowwRange(start, end, true);

    expect(windows).toHaveLength(3);
    expect(windows[0].startTime).toBe('2026-08-27');
    expect(windows.at(-1)!.endTime).toBe('2026-11-23');
    for (let index = 1; index < windows.length; index++) {
      const priorEnd = new Date(`${windows[index - 1].endTime}T00:00:00Z`);
      priorEnd.setUTCDate(priorEnd.getUTCDate() + 1);
      expect(windows[index].startTime).toBe(priorEnd.toISOString().slice(0, 10));
    }
  });
});
