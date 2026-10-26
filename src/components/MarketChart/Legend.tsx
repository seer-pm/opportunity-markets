import type { Market } from '@seer-pm/sdk';
import { useState } from 'react';
import type { IOutcomeData } from './MarketChart';

interface LegendProps {
  outcomesData: IOutcomeData[];
  followed: Array<string | null>;
  onToggleOutcome: (name: string) => void;
  market: Market;
}

export default function Legend({
  outcomesData,
  followed,
  onToggleOutcome,
  market,
}: LegendProps) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const count = followed.filter(Boolean).length;
  const options = outcomesData.filter(
    (item) => !needle || item.outcome.name.toLowerCase().includes(needle),
  );
  const sorted = [...options].sort(
    (a, b) =>
      Number(followed.includes(b.outcome.name)) -
      Number(followed.includes(a.outcome.name)),
  );
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Following{' '}
          <span className="font-semibold text-paper">{count} of 4</span>
        </p>
        {outcomesData.length > 4 && (
          <input
            type="search"
            className="seer-input sm:max-w-64"
            aria-label="Search chart outcomes"
            placeholder={`Search ${outcomesData.length} chart outcomes`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        )}
      </div>
      <div
        className="grid max-h-44 grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2"
        role="group"
        aria-label="Chart series"
      >
        {sorted.slice(0, 12).map(({ outcome, data }) => {
          const slot = followed.indexOf(outcome.name);
          const selected = slot >= 0;
          const value = data[data.length - 1]?.value;
          return (
            <button
              key={outcome.name}
              type="button"
              aria-pressed={selected}
              aria-label={`Follow ${outcome.name}`}
              disabled={!selected && count === 4}
              title={
                !selected && count === 4
                  ? 'Unfollow one outcome to follow another.'
                  : undefined
              }
              onClick={() => onToggleOutcome(outcome.name)}
              className="seer-button seer-button-ghost min-w-0 justify-start px-2 text-left disabled:opacity-60"
            >
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: selected
                    ? `var(--seer-series-${slot + 1})`
                    : 'var(--seer-muted)',
                }}
              />
              <span className="min-w-0 flex-1 truncate text-[13px] text-paper">
                {outcome.name}
              </span>
              <span className="shrink-0 text-[13px] text-paper">
                {value == null
                  ? 'N/A'
                  : `${value.toFixed(market.type === 'Futarchy' ? 3 : 1)}%`}
              </span>
            </button>
          );
        })}
      </div>
      {options.length === 0 && (
        <p className="text-sm text-muted">No matching chart outcomes.</p>
      )}
      {outcomesData.length > 4 && (
        <p className="text-xs text-muted">
          Other chart outcomes stay in muted context. Unfollow one to choose
          another.
        </p>
      )}
    </div>
  );
}
