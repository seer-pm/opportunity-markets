import * as React from 'react';
import { Link } from 'react-router-dom';
import { MarketStatus, getMarketStatus, type Market } from '@seer-pm/sdk';
import { useOddsCaps } from '../hooks/useOddsCaps';
import {
  ODDS_CAP_HINT,
  formatBigNumbers,
  formatOddsWithCap,
} from '../utils/format';
import { getMarketDisplayTitle } from '../config/market';
import DesignCarousel from './DesignCarousel';
import { getWinningOutcomes } from '../utils/marketReading';

export interface MarketPreviewCardProps {
  readonly market: Market;
  readonly cascadeIndex?: number;
}

export const MarketPreviewCard: React.FC<MarketPreviewCardProps> = ({
  market,
}) => {
  const { data: oddsCaps } = useOddsCaps(market);
  const isClosed = getMarketStatus(market) === MarketStatus.CLOSED;
  const title = getMarketDisplayTitle(market.id, market.marketName);
  const winners = isClosed ? getWinningOutcomes(market) : [];
  const href = `/markets/${market.chainId}/${market.id}`;
  const ranked = (market.outcomes ?? [])
    .map((label, index) => ({
      index,
      label,
      odds: Number(market.odds?.[index] ?? NaN),
    }))
    .filter((item) => Number.isFinite(item.odds))
    .sort((a, b) => b.odds - a.odds);
  return (
    <article className="lot-panel min-w-0 overflow-hidden">
      <Link
        to={href}
        aria-label={`Open opportunity: ${title}`}
        className="group block p-5 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-xl font-semibold leading-snug tracking-tight text-paper transition-colors group-hover:text-up">
            {title}
          </h2>
          <span
            className={`shrink-0 rounded-control border px-2 py-1 text-xs font-semibold ${isClosed ? 'border-edge text-muted' : 'border-seer-positive/40 text-seer-positive'}`}
          >
            {isClosed ? 'Closed' : 'Active'}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">
          Liquidity{' '}
          <span className="font-semibold text-paper">
            {market.liquidityUSD != null
              ? `$${formatBigNumbers(Number(market.liquidityUSD))}`
              : 'N/A'}
          </span>
        </p>
        {winners.length > 0 && (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {winners.length === 1 ? 'Winner' : 'Winners'} ·{' '}
            <strong className="font-semibold text-paper">
              {winners.join(', ')}
            </strong>
          </p>
        )}
        {isClosed && ranked.length > 0 && (
          <p className="mt-4 text-xs text-muted">Historical prices</p>
        )}
        {ranked.length > 0 && (
          <ul className="mt-5 divide-y divide-edge">
            {ranked.slice(0, 3).map(({ index, label, odds }) => (
              <li
                key={index}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3"
              >
                <span className="min-w-0 truncate text-sm text-paper">
                  {label}
                </span>
                <strong
                  className="text-sm font-semibold text-paper"
                  title={oddsCaps?.[index] != null ? ODDS_CAP_HINT : undefined}
                >
                  {formatOddsWithCap(odds, oddsCaps?.[index])}
                </strong>
                <span
                  aria-hidden
                  className="col-span-2 h-1 overflow-hidden rounded-full bg-seer-surface-raised"
                >
                  <span
                    className="block h-full rounded-full bg-muted"
                    style={{ width: `${Math.max(0, Math.min(100, odds))}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
        {market.outcomes.length > 3 && !isClosed && (
          <p className="mt-3 text-xs text-muted">
            +{market.outcomes.length - Math.min(3, ranked.length)} more
          </p>
        )}
      </Link>
      <DesignCarousel
        market={market}
        variant="home"
        embedded
        className="border-t border-edge px-5 py-4 sm:px-6"
      />
      <div className="flex items-center justify-end border-t border-edge px-5 py-3 sm:px-6">
        <Link
          to={href}
          className="seer-button seer-button-ghost seer-button-sm text-up"
        >
          <span>{isClosed ? 'View market' : 'Open opportunity'}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
};
export default MarketPreviewCard;
