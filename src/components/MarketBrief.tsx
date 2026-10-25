import type { Market } from '@seer-pm/sdk';
import { getWinningOutcomes } from '../utils/marketReading';
import { useOddsCaps } from '../hooks/useOddsCaps';
import {
  ODDS_CAP_HINT,
  formatBigNumbers,
  formatOddsWithCap,
} from '../utils/format';

type MarketBriefProps = {
  market: Market;
  isClosed: boolean;
  explorer?: string;
};

function Identity({
  address,
  explorer,
}: {
  address?: string | null;
  explorer?: string;
}) {
  if (!address) return <span className="text-muted">Not specified</span>;
  const display = `${address.slice(0, 6)}...${address.slice(-4)}`;
  return explorer ? (
    <a
      href={`${explorer}/address/${address}`}
      target="_blank"
      rel="noreferrer"
      title={address}
      className="font-mono text-up hover:underline"
    >
      {display}
    </a>
  ) : (
    <span title={address} className="font-mono">
      {display}
    </span>
  );
}

/** The current reading precedes proposal evidence and any wallet action. */
export function MarketBrief({ market, isClosed, explorer }: MarketBriefProps) {
  const { data: caps } = useOddsCaps(market);
  const ranked = market.outcomes
    .map((name, index) => ({
      name,
      index,
      odds: Number(market.odds?.[index] ?? NaN),
    }))
    .filter((outcome) => Number.isFinite(outcome.odds))
    .sort((a, b) => b.odds - a.odds);
  const leader = ranked[0];
  const winners = isClosed ? getWinningOutcomes(market) : [];
  return (
    <div className="mt-5 space-y-5">
      {!isClosed && leader && (
        <p className="max-w-[65ch] text-lg leading-relaxed text-muted">
          Leading ·{' '}
          <strong className="font-semibold text-paper">{leader.name}</strong>{' '}
          <strong
            className="whitespace-nowrap font-semibold text-paper"
            title={caps?.[leader.index] != null ? ODDS_CAP_HINT : undefined}
          >
            {formatOddsWithCap(leader.odds, caps?.[leader.index])}
          </strong>
        </p>
      )}
      {isClosed && winners.length > 0 && (
        <p className="max-w-[65ch] text-lg leading-relaxed text-muted">
          {winners.length === 1 ? 'Winner' : 'Winners'} ·{' '}
          <strong className="font-semibold text-paper">
            {winners.join(', ')}
          </strong>
        </p>
      )}
      <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-edge pt-4 text-sm">
        <div>
          <dt className="text-xs text-muted">Market creator</dt>
          <dd className="mt-1">
            <Identity address={market.creator} explorer={explorer} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Resolution arbitrator</dt>
          <dd className="mt-1">
            <Identity
              address={market.questions[0]?.arbitrator}
              explorer={explorer}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Volume</dt>
          <dd className="mt-1 font-semibold text-paper">
            {market.volumeUSD != null
              ? `$${formatBigNumbers(market.volumeUSD)}`
              : 'N/A'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Liquidity</dt>
          <dd className="mt-1 font-semibold text-paper">
            {market.liquidityUSD != null
              ? `$${formatBigNumbers(market.liquidityUSD)}`
              : 'N/A'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
