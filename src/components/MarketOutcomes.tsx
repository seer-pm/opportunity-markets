import * as React from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { WRAPPED_OUTCOME_TOKEN_DECIMALS } from '@seer-pm/sdk';
import { useTokenBalance } from '@seer-pm/react';
import type { Market } from '@seer-pm/sdk';
import MarketChart from './MarketChart/MarketChart';
import { useOddsDelta } from '../hooks/useOddsDelta';

export interface MarketOutcomesProps {
  readonly className?: string;
  readonly market: Market;
}

interface OutcomeCardProps {
  readonly market: Market;
  readonly outcomeIndex: number;
  readonly label: string;
  readonly odds: number;
  readonly rank: number;
}

function OutcomeCard({
  market,
  outcomeIndex,
  label,
  odds,
  rank,
}: OutcomeCardProps) {
  const { address: account } = useAccount();
  const tokenAddress = market.wrappedTokens[outcomeIndex] as
    | `0x${string}`
    | undefined;
  const { data: balance = 0n } = useTokenBalance(
    account,
    tokenAddress,
    market.chainId
  );

  const percent = Math.round(Number(odds));
  const { direction } = useOddsDelta(
    `${market.chainId}-${market.id}-o${outcomeIndex}`,
    percent
  );
  const balanceFormatted = account
    ? Number(formatUnits(balance, WRAPPED_OUTCOME_TOKEN_DECIMALS)).toFixed(2)
    : '0.00';
  const hasPosition = account && balance > 0n;
  const rankLabel = String(rank).padStart(2, '0');
  const barWidth = Number.isFinite(percent)
    ? Math.min(Math.max(percent, 0), 100)
    : 0;

  const oddsClass =
    direction === 'up'
      ? 'bid-tick-up font-mono text-xl font-semibold tabular-nums text-up'
      : direction === 'down'
        ? 'bid-tick-down font-mono text-xl font-semibold tabular-nums text-down'
        : 'font-mono text-xl font-semibold tabular-nums text-paper';

  return (
    <div
      className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 ${
        hasPosition ? 'bg-up/5' : ''
      }`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums text-muted">
        {rankLabel}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg font-semibold leading-tight text-paper">
          {label}
        </h3>
        {account != null && (
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Position: {balanceFormatted}
          </p>
        )}
      </div>
      <div className="text-right">
        <span className={oddsClass}>{percent}%</span>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {Number.isFinite(percent) ? `$${(percent / 100).toFixed(2)}` : '—'}
        </p>
      </div>
      <div
        className="col-span-3 h-1 overflow-hidden rounded-control bg-wall"
        aria-hidden
      >
        <div
          className={
            direction === 'up'
              ? 'h-full rounded-control bg-up'
              : direction === 'down'
                ? 'h-full rounded-control bg-down'
                : 'h-full rounded-control bg-paper/35'
          }
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  );
}

export const MarketOutcomes: React.FC<MarketOutcomesProps> = ({
  className = '',
  market,
}: MarketOutcomesProps) => {
  const wrapped = market.wrappedTokens ?? [];
  const rawOutcomes = market.outcomes ?? [];
  const odds = market.odds ?? [];

  const outcomes = React.useMemo(
    () =>
      wrapped.map((_, i) => ({
        index: i,
        label:
          typeof rawOutcomes[i] === 'string'
            ? (rawOutcomes[i] as string)
            : `Outcome ${i + 1}`,
        odds: Number(odds[i] ?? 0),
      })),
    [wrapped, rawOutcomes, odds]
  );

  const ranked = React.useMemo(
    () => [...outcomes].sort((a, b) => b.odds - a.odds),
    [outcomes]
  );

  return (
    <section
      className={`space-y-8 ${className}`}
      data-purpose="market-visualization"
    >
      <div>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-paper">
            Outcomes
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              Liquidity
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums text-paper">
              {market.liquidityUSD !== undefined
                ? `$${Number(market.liquidityUSD).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}`
                : '—'}
            </span>
          </div>
        </div>
        <div className="lot-panel divide-y divide-paper/10 overflow-hidden">
          {ranked.map(({ label, odds: outcomeOdds, index }, rankIdx) => (
            <OutcomeCard
              key={index}
              market={market}
              outcomeIndex={index}
              label={label}
              odds={outcomeOdds}
              rank={rankIdx + 1}
            />
          ))}
        </div>
      </div>

      <div className="lot-panel p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          Price History
        </h2>
        <MarketChart market={market} />
      </div>
    </section>
  );
};

export default MarketOutcomes;
