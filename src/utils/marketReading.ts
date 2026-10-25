import type { Market } from '@seer-pm/sdk';

/** Finalized winning shares come from reported payouts, independently of historical odds. */
export function getWinningOutcomes(market: Market): string[] {
  if (!market.payoutReported) return [];
  return market.outcomes.filter(
    (_, index) => (market.payoutNumerators[index] ?? 0n) > 0n,
  );
}
