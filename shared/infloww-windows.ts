const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_WINDOW_DAYS = 31;

export interface InflowwTimeWindow {
  startTime: string;
  endTime: string;
}

const dateOnly = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

/** Split an inclusive range into adjacent, non-overlapping Infloww API windows. */
export function splitInflowwRange(start: Date, end: Date, useDateOnly = false): InflowwTimeWindow[] {
  let startMs = start.getTime();
  let endMs = end.getTime();

  if (useDateOnly) {
    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    startMs = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    endMs = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
  }
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) return [];

  const windows: InflowwTimeWindow[] = [];
  let cursor = startMs;
  while (cursor <= endMs) {
    const maxDuration = MAX_WINDOW_DAYS * DAY_MS;
    const lastIncluded = useDateOnly
      ? Math.min(endMs, cursor + (MAX_WINDOW_DAYS - 1) * DAY_MS)
      : Math.min(endMs, cursor + maxDuration - 1);

    windows.push({
      startTime: useDateOnly ? dateOnly(cursor) : String(cursor),
      endTime: useDateOnly ? dateOnly(lastIncluded) : String(lastIncluded),
    });
    cursor = lastIncluded + (useDateOnly ? DAY_MS : 1);
  }
  return windows;
}
