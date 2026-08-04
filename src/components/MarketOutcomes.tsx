import * as React from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { WRAPPED_OUTCOME_TOKEN_DECIMALS } from '@seer-pm/sdk';
import { useTokenBalance } from '@seer-pm/react';
import type { Market } from '@seer-pm/sdk';
import MarketChart from './MarketChart/MarketChart';
import MarketDiscussion from './MarketDiscussion';
import SubmissionLightbox from './SubmissionLightbox';
import { useOddsDelta } from '../hooks/useOddsDelta';
import {
  getOutcomeSubmissionAssets,
  type SubmissionAssets,
} from '../config/submissions';

export interface MarketOutcomesProps {
  readonly className?: string;
  readonly market: Market;
  readonly selectedOutcomeIndex: number;
  readonly onSelectOutcome: (index: number) => void;
}

interface OutcomeCardProps {
  readonly market: Market;
  readonly outcomeIndex: number;
  readonly label: string;
  readonly odds: number;
  readonly rank: number;
  readonly selected: boolean;
  readonly assets?: SubmissionAssets;
  readonly onSelect: () => void;
  readonly onViewImages: (label: string, assets: SubmissionAssets) => void;
}

function ImageIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <rect
        x="1.25"
        y="1.75"
        width="9.5"
        height="8.5"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="4" cy="4.5" r="1" fill="currentColor" />
      <path
        d="M1.75 8.25l2.4-2.1a.75.75 0 0 1 .95 0L7 7.75l1.15-.95a.75.75 0 0 1 .95.05L10.25 8.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OutcomeCard({
  market,
  outcomeIndex,
  label,
  odds,
  rank,
  selected,
  assets,
  onSelect,
  onViewImages,
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

  const hasImages = (assets?.images.length ?? 0) > 0;
  const hasPdf = Boolean(assets?.pdfUrl);
  const hasPortfolio = Boolean(assets?.portfolioUrl);
  const hasBothAssets = hasImages && hasPdf;
  const showMeta = hasImages || hasPdf || hasPortfolio || account != null;
  const proposalLinkClass =
    'inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-paper underline decoration-paper/35 underline-offset-[3px] transition-colors hover:text-up hover:decoration-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up';

  const rowTone = selected
    ? 'bg-up/10 ring-1 ring-inset ring-up/35'
    : hasPosition
      ? 'bg-up/5'
      : '';

  return (
    <div
      data-selected={selected ? 'true' : undefined}
      onClick={onSelect}
      className={`grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors hover:bg-up/5 ${rowTone}`}
    >
      <span className="font-mono text-sm font-semibold tabular-nums text-muted">
        {rankLabel}
      </span>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="font-display text-lg font-semibold leading-tight text-paper">
            {label}
          </h3>
          {selected ? (
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-up">
              Trading
            </span>
          ) : null}
        </div>
        {showMeta ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {hasPortfolio && assets?.portfolioUrl ? (
              <a
                href={assets.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className={proposalLinkClass}
                onClick={(event) => event.stopPropagation()}
              >
                View portfolio ↗
              </a>
            ) : null}
            {hasPdf && assets?.pdfUrl ? (
              <a
                href={assets.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className={proposalLinkClass}
                onClick={(event) => event.stopPropagation()}
              >
                View proposal ↗
              </a>
            ) : null}
            {hasImages && assets ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onViewImages(label, assets);
                }}
                className={proposalLinkClass}
              >
                {hasBothAssets || hasPortfolio ? 'View images' : 'View proposal'}
                <ImageIcon />
              </button>
            ) : null}
            {account != null ? (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                Position: {balanceFormatted}
              </p>
            ) : null}
          </div>
        ) : null}
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
  selectedOutcomeIndex,
  onSelectOutcome,
}: MarketOutcomesProps) => {
  const wrapped = market.wrappedTokens ?? [];
  const rawOutcomes = market.outcomes ?? [];
  const odds = market.odds ?? [];

  const [lightbox, setLightbox] = React.useState<{
    title: string;
    images: SubmissionAssets['images'];
  } | null>(null);

  const outcomes = React.useMemo(
    () =>
      wrapped.map((_, i) => {
        const label =
          typeof rawOutcomes[i] === 'string'
            ? (rawOutcomes[i] as string)
            : `Outcome ${i + 1}`;
        return {
          index: i,
          label,
          odds: Number(odds[i] ?? 0),
          assets: getOutcomeSubmissionAssets(market.id, label),
        };
      }),
    [wrapped, rawOutcomes, odds, market.id]
  );

  const ranked = React.useMemo(
    () => [...outcomes].sort((a, b) => b.odds - a.odds),
    [outcomes]
  );

  function onViewImages(label: string, assets: SubmissionAssets) {
    setLightbox({ title: label, images: assets.images });
  }

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
          {ranked.map(({ label, odds: outcomeOdds, index, assets }, rankIdx) => (
            <OutcomeCard
              key={index}
              market={market}
              outcomeIndex={index}
              label={label}
              odds={outcomeOdds}
              rank={rankIdx + 1}
              selected={selectedOutcomeIndex === index}
              assets={assets}
              onSelect={() => onSelectOutcome(index)}
              onViewImages={onViewImages}
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

      <MarketDiscussion market={market} />

      <SubmissionLightbox
        open={lightbox != null}
        title={lightbox?.title ?? ''}
        images={lightbox?.images ?? []}
        onClose={() => setLightbox(null)}
      />
    </section>
  );
};

export default MarketOutcomes;
