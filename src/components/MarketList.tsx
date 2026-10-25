import * as React from 'react';
import type { Market } from '@seer-pm/sdk';
import { MarketPreviewCard } from './MarketPreviewCard';

export interface MarketListProps {
  readonly markets: Market[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly refetch: () => unknown;
  readonly emptyText: string;
}

export const MarketList: React.FC<MarketListProps> = ({
  markets,
  isLoading,
  isError,
  refetch,
  emptyText,
}) => {
  return (
    <div className="mt-6 flex min-w-0 flex-col gap-5">
      {isLoading && (
        <div className="lot-panel p-10 text-center">
          <p className="text-base text-muted">Loading opportunities…</p>
        </div>
      )}
      {isError && (
        <div className="lot-panel flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-base text-paper">
            Could not load opportunities. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="seer-button seer-button-primary"
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading && !isError && markets.length === 0 && (
        <div className="lot-panel p-10 text-center">
          <p className="text-base text-muted">{emptyText}</p>
        </div>
      )}
      {markets.map((market, index) => (
        <MarketPreviewCard
          key={`${market.chainId}-${market.id}`}
          market={market}
          cascadeIndex={index}
        />
      ))}
    </div>
  );
};

export default MarketList;
