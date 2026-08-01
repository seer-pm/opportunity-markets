import * as React from 'react';

const STORE_PREFIX = 'om-odds:';

function readPrev(key: string): number | null {
  try {
    const raw = sessionStorage.getItem(STORE_PREFIX + key);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writePrev(key: string, value: number) {
  try {
    sessionStorage.setItem(STORE_PREFIX + key, String(value));
  } catch {
    // ignore quota / private mode
  }
}

/** Compare current odds to the last seen value in this session (UP/DOWN). */
export function useOddsDelta(
  marketKey: string,
  currentOdds: number | null
): { delta: number | null; direction: 'up' | 'down' | 'flat' } {
  const [delta, setDelta] = React.useState<number | null>(null);
  const [direction, setDirection] = React.useState<'up' | 'down' | 'flat'>(
    'flat'
  );

  React.useEffect(() => {
    if (currentOdds == null || !Number.isFinite(currentOdds)) {
      setDelta(null);
      setDirection('flat');
      return;
    }

    const prev = readPrev(marketKey);
    writePrev(marketKey, currentOdds);

    if (prev == null) {
      setDelta(null);
      setDirection('flat');
      return;
    }

    const d = currentOdds - prev;
    setDelta(d);
    if (d > 0.05) setDirection('up');
    else if (d < -0.05) setDirection('down');
    else setDirection('flat');
  }, [marketKey, currentOdds]);

  return { delta, direction };
}
