import * as React from 'react';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { WRAPPED_OUTCOME_TOKEN_DECIMALS } from '@seer-pm/sdk';
import type { Market } from '@seer-pm/sdk';
import { useOutcomeBalances } from '../hooks/useOutcomeBalances';
import { useOddsCaps } from '../hooks/useOddsCaps';
import { ODDS_CAP_HINT, formatOddsWithCap } from '../utils/format';
import MarketChart from './MarketChart/MarketChart';
import MarketDiscussion from './MarketDiscussion';
import SubmissionLightbox from './SubmissionLightbox';
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

/** Past this many outcomes the list gets a search box and is collapsed. */
const COLLAPSE_THRESHOLD = 20;
const COLLAPSED_COUNT = 15;

interface OutcomeCardProps {
  readonly label: string;
  readonly balance: bigint;
  readonly odds: number;
  /** Odds where the pool's liquidity runs out, when the price is at or near it. */
  readonly oddsCap?: number | null;
  readonly rank: number;
  readonly selected: boolean;
  readonly assets?: SubmissionAssets;
  readonly onSelect: () => void;
  readonly onViewImages: (label: string, assets: SubmissionAssets) => void;
}

function formatUsd(value: number | undefined): string {
  if (value === undefined) return '—';
  return `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function MarketStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </span>
      <span className="font-mono text-sm font-semibold tabular-nums text-paper">
        {formatUsd(value)}
      </span>
    </div>
  );
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
  label,
  balance,
  odds,
  oddsCap,
  rank,
  selected,
  assets,
  onSelect,
  onViewImages,
}: OutcomeCardProps) {
  const { address: account } = useAccount();

  const percent = Number(odds);
  const balanceFormatted = account
    ? Number(formatUnits(balance, WRAPPED_OUTCOME_TOKEN_DECIMALS)).toFixed(2)
    : '0.00';
  const hasPosition = account && balance > 0n;
  const rankLabel = String(rank).padStart(2, '0');
  const barWidth = Number.isFinite(percent)
    ? Math.min(Math.max(percent, 0), 100)
    : 0;

  const oddsClass = 'font-mono text-xl font-semibold tabular-nums text-paper';

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
        <span
          className={oddsClass}
          title={oddsCap != null && Number.isFinite(percent) ? ODDS_CAP_HINT : undefined}
        >
          {Number.isFinite(percent) ? formatOddsWithCap(percent, oddsCap) : '—'}
        </span>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {Number.isFinite(percent) ? `$${(percent / 100).toFixed(3)}` : '—'}
        </p>
      </div>
      <div
        className="col-span-3 h-1 overflow-hidden rounded-control bg-wall"
        aria-hidden
      >
        <div
          className="h-full rounded-control bg-paper/35"
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
  const { data: oddsCaps } = useOddsCaps(market);

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
    () =>
      [...outcomes]
        // Outcomes without a price (NaN) sink to the bottom.
        .sort((a, b) => (b.odds || 0) - (a.odds || 0))
        .map((outcome, rankIdx) => ({ ...outcome, rank: rankIdx + 1 })),
    [outcomes]
  );

  const { address: account } = useAccount();
  const { data: balances } = useOutcomeBalances(
    account,
    wrapped,
    market.chainId
  );

  const isLong = ranked.length > COLLAPSE_THRESHOLD;
  const [query, setQuery] = React.useState('');
  const [expanded, setExpanded] = React.useState(false);
  const needle = query.trim().toLowerCase();

  const visible = React.useMemo(() => {
    if (!isLong) return ranked;
    if (needle) {
      return ranked.filter((o) => o.label.toLowerCase().includes(needle));
    }
    if (expanded) return ranked;
    const top = ranked.slice(0, COLLAPSED_COUNT);
    const selected = ranked.find((o) => o.index === selectedOutcomeIndex);
    return selected && !top.includes(selected) ? [...top, selected] : top;
  }, [isLong, ranked, needle, expanded, selectedOutcomeIndex]);

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
          <div className="flex items-baseline gap-4">
            <MarketStat label="Volume" value={market.volumeUSD} />
            <MarketStat label="Liquidity" value={market.liquidityUSD} />
          </div>
        </div>
        {isLong ? (
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${ranked.length} outcomes`}
            aria-label="Search outcomes"
            className="mb-3 w-full rounded-panel border border-edge bg-wall px-4 py-3 text-sm text-paper caret-up placeholder:text-muted focus:border-up focus:outline-none"
          />
        ) : null}
        <div className="lot-panel divide-y divide-paper/10 overflow-hidden">
          {visible.length === 0 ? (
            <p className="px-5 py-4 text-sm text-muted">
              No outcomes match “{query.trim()}”.
            </p>
          ) : null}
          {visible.map(({ label, odds: outcomeOdds, index, assets, rank }) => (
            <OutcomeCard
              key={index}
              label={label}
              balance={balances?.[index] ?? 0n}
              odds={outcomeOdds}
              oddsCap={oddsCaps?.[index]}
              rank={rank}
              selected={selectedOutcomeIndex === index}
              assets={assets}
              onSelect={() => onSelectOutcome(index)}
              onViewImages={onViewImages}
            />
          ))}
        </div>
        {isLong && !needle ? (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
          >
            {expanded ? 'Show top outcomes' : `Show all ${ranked.length} outcomes`}
          </button>
        ) : null}
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
