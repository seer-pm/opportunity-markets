import * as React from 'react';
import { Link } from 'react-router-dom';
import type { Market } from '@seer-pm/sdk';
import { MarketStatus, getMarketStatus } from '@seer-pm/sdk';
import { formatBigNumbers } from '../utils/format';
import { useOddsDelta } from '../hooks/useOddsDelta';
import { getMarketDisplayTitle } from '../config/market';

export interface MarketPreviewCardProps {
  readonly market: Market;
  readonly cascadeIndex?: number;
}

const PREVIEW_OUTCOME_CAP = 3;

function getBestOddsOutcome(market: Market): {
  label: string | null;
  displayPrice: string | null;
  percent: number | null;
  leadingIndex: number;
  outcomes: Array<{ label: string; percent: number }>;
  ranked: Array<{ label: string; percent: number }>;
} {
  const odds = market.odds ?? [];
  const rawOutcomes = market.outcomes ?? [];

  const outcomes = odds.map((value, i) => {
    const percent = Math.round(Number(value ?? 0));
    const label =
      typeof rawOutcomes[i] === 'string'
        ? (rawOutcomes[i] as string)
        : `Outcome ${i + 1}`;
    return { label, percent: Number.isFinite(percent) ? percent : 0 };
  });

  let leadingIndex = 0;
  let leadingOdds = Number(odds[0] ?? 0);
  for (let i = 1; i < odds.length; i++) {
    const value = Number(odds[i] ?? 0);
    if (value > leadingOdds) {
      leadingOdds = value;
      leadingIndex = i;
    }
  }

  const leadingPercent = Math.round(leadingOdds);
  const label = outcomes[leadingIndex]?.label ?? null;
  const displayPrice =
    Number.isFinite(leadingPercent) && leadingPercent > 0
      ? `${leadingPercent}%`
      : null;

  const ranked = [...outcomes].sort((a, b) => b.percent - a.percent);

  return {
    label,
    displayPrice,
    percent: Number.isFinite(leadingPercent) ? leadingPercent : null,
    leadingIndex,
    outcomes: outcomes.slice(0, 6),
    ranked,
  };
}

function shareTone(index: number, leadingIndex: number, count: number): string {
  if (index === leadingIndex) return 'bg-up';
  if (count <= 1) return 'bg-paper/35';
  const steps = ['bg-paper/35', 'bg-paper/25', 'bg-paper/18', 'bg-paper/12'];
  const step = index > leadingIndex ? index - 1 : index;
  return steps[Math.min(Math.max(step, 0), steps.length - 1)] ?? 'bg-paper/12';
}

export const MarketPreviewCard: React.FC<MarketPreviewCardProps> = ({
  market,
  cascadeIndex = 0,
}) => {
  const {
    label: leadingLabel,
    displayPrice,
    percent,
    leadingIndex,
    outcomes,
    ranked,
  } = getBestOddsOutcome(market);

  const marketKey = `${market.chainId}-${market.id}`;
  const { direction } = useOddsDelta(marketKey, percent);

  const isClosed = getMarketStatus(market) === MarketStatus.CLOSED;
  const marketStatusText = isClosed ? 'Closed' : 'Active';

  const oddsClass =
    direction === 'up'
      ? 'bid-tick-up font-mono text-2xl font-semibold tabular-nums text-up md:text-3xl'
      : direction === 'down'
        ? 'bid-tick-down font-mono text-2xl font-semibold tabular-nums text-down md:text-3xl'
        : 'font-mono text-2xl font-semibold tabular-nums text-paper md:text-3xl';

  const total = outcomes.reduce((sum, o) => sum + o.percent, 0) || 1;
  const topOutcomes = ranked.slice(0, PREVIEW_OUTCOME_CAP);
  const hiddenOutcomes = Math.max(ranked.length - PREVIEW_OUTCOME_CAP, 0);

  return (
    <Link
      to={`/markets/${market.chainId}/${market.id}`}
      className="lot-panel lot-cascade-item group flex flex-col gap-5 p-6 transition-[border-color,box-shadow] duration-300 hover:border-up/40 hover:shadow-lot focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up md:gap-6 md:p-8"
      style={
        {
          '--cascade-i': cascadeIndex,
          viewTransitionName: `lot-${market.chainId}-${market.id}`,
        } as React.CSSProperties
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        <span
          className={
            isClosed
              ? 'rounded-control border border-paper/15 px-2.5 py-1 text-muted'
              : 'rounded-control border border-up/35 px-2.5 py-1 text-up'
          }
        >
          {marketStatusText}
        </span>
        <span>
          Liquidity{' '}
          <span className="text-paper">
            {market.liquidityUSD !== undefined
              ? `$${formatBigNumbers(Number(market.liquidityUSD))}`
              : '—'}
          </span>
        </span>
      </div>

      <h2 className="font-display text-[clamp(1.25rem,2.8vw,1.85rem)] font-semibold leading-[1.15] tracking-tight text-paper transition-colors group-hover:text-up">
        {getMarketDisplayTitle(market.id, market.marketName)}
      </h2>

      {outcomes.length > 0 && (
        <div
          className="flex h-1.5 w-full overflow-hidden rounded-control bg-wall"
          aria-hidden
        >
          {outcomes.map((outcome, i) => {
            const width = Math.max((outcome.percent / total) * 100, 0);
            return (
              <div
                key={`${outcome.label}-${i}`}
                className={shareTone(i, leadingIndex, outcomes.length)}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>
      )}

      {topOutcomes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {topOutcomes.map((outcome) => (
            <li
              key={outcome.label}
              className="flex min-w-0 items-baseline justify-between gap-3"
            >
              <span className="min-w-0 truncate text-sm text-paper">
                {outcome.label}
              </span>
              <span
                className={
                  outcome.label === leadingLabel &&
                  displayPrice != null
                    ? 'shrink-0 font-mono text-sm font-semibold tabular-nums text-up'
                    : 'shrink-0 font-mono text-sm font-semibold tabular-nums text-muted'
                }
              >
                {outcome.percent}%
              </span>
            </li>
          ))}
          {hiddenOutcomes > 0 && (
            <li className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              +{hiddenOutcomes} more
            </li>
          )}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 border-t border-paper/10 pt-5">
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            {leadingLabel ? `Leading · ${leadingLabel}` : 'Leading odds'}
          </span>
          <div className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={oddsClass}>{displayPrice ?? '—'}</span>
            {direction !== 'flat' && (
              <span
                className={
                  direction === 'up'
                    ? 'text-xs font-semibold uppercase tracking-[0.08em] text-up'
                    : 'text-xs font-semibold uppercase tracking-[0.08em] text-down'
                }
              >
                {direction === 'up' ? 'Up' : 'Down'}
              </span>
            )}
          </div>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-up transition-colors group-hover:text-paper group-focus-visible:text-paper">
          Open opportunity →
        </span>
      </div>
    </Link>
  );
};

export default MarketPreviewCard;
