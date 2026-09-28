import type { SupportedChain } from '@seer-pm/sdk';
import type { Market } from '@seer-pm/sdk';
import { fetchChartData } from '@seer-pm/sdk';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getChainedLevels } from '../../config/market';
import { fetchChainedPoolHourDatas } from '../../lib/chainedMarket';
import { useChainedMarket } from '../useChainedMarket';
import { filterChartData } from './utils';

export type ChartData = {
  chartData: {
    name: string;
    type: string;
    data: number[][];
  }[];
  timestamps: number[];
};

const getUseChartDataKey = (
  chainId: SupportedChain,
  marketId: Address,
  dayCount: number,
  intervalSeconds: number
) => ['useChartData', chainId, marketId, dayCount, intervalSeconds];

export const getUsePoolHourDataSetsKey = (chainId: SupportedChain, marketId: Address) => [
  'usePoolHourDataSets',
  chainId,
  marketId,
];

export const usePoolHourDataSets = (market: Market, enabled = true) => {
  return useQuery({
    enabled: !!market && enabled,
    queryKey: getUsePoolHourDataSetsKey(market.chainId, market.id),
    retry: false,
    queryFn: () => fetchChartData(market),
    refetchOnMount: 'always',
  });
};

/** Default "All" period: ~10 years, 30-minute buckets. */
const DEFAULT_DAY_COUNT = 365 * 10;
const DEFAULT_INTERVAL_SECONDS = 60 * 30;

export const useChartData = (market: Market, enabled = true) => {
  const { data: poolHourDataSets } = usePoolHourDataSets(market, enabled);
  return useQuery({
    enabled: poolHourDataSets !== undefined,
    queryKey: [
      ...getUseChartDataKey(
        market.chainId,
        market.id,
        DEFAULT_DAY_COUNT,
        DEFAULT_INTERVAL_SECONDS
      ),
      JSON.stringify(
        Array.isArray(poolHourDataSets)
          ? poolHourDataSets.map((x) => x.length)
          : poolHourDataSets
      ),
    ],
    retry: false,
    queryFn: async (): Promise<ChartData> =>
      filterChartData(
        market,
        poolHourDataSets!,
        DEFAULT_DAY_COUNT,
        DEFAULT_INTERVAL_SECONDS,
        undefined
      ),
  });
};

/** Series drawn for a chained market; the rest of its outcomes stay off the chart. */
const CHAINED_CHART_SERIES = 10;

/**
 * Chart for a flattened chained market: the `market-chart` API prices each level
 * against its own collateral, so read the top outcomes' sDAI pools from the subgraph.
 */
export const useChainedChartData = (market: Market, enabled = true) => {
  const { data: chained } = useChainedMarket(market.id, market.chainId);
  const poolByToken = chained?.poolByToken;

  const chartMarket = (() => {
    const ranked = market.wrappedTokens
      .map((token, i) => ({ token, odds: Number(market.odds?.[i] ?? Number.NaN) }))
      .filter(({ token, odds }) => poolByToken?.[token.toLowerCase()] && Number.isFinite(odds))
      .sort((a, b) => b.odds - a.odds)
      .slice(0, CHAINED_CHART_SERIES);
    const indexes = ranked.map(({ token }) => market.wrappedTokens.indexOf(token));
    return {
      ...market,
      wrappedTokens: indexes.map((i) => market.wrappedTokens[i]),
      outcomes: indexes.map((i) => market.outcomes[i]),
    };
  })();

  return useQuery({
    enabled: enabled && poolByToken !== undefined,
    queryKey: [
      'useChainedChartData',
      market.chainId,
      market.id,
      chartMarket.wrappedTokens,
    ],
    retry: false,
    queryFn: async (): Promise<ChartData> => {
      if (chartMarket.wrappedTokens.length === 0) {
        return { chartData: [], timestamps: [] };
      }
      const poolHourDataSets = await fetchChainedPoolHourDatas(
        market.chainId,
        chartMarket.wrappedTokens,
        poolByToken!
      );
      return filterChartData(
        chartMarket,
        poolHourDataSets,
        DEFAULT_DAY_COUNT,
        DEFAULT_INTERVAL_SECONDS,
        undefined
      );
    },
  });
};

export const useMarketChartData = (market: Market) => {
  const isChained = Boolean(getChainedLevels(market.id));
  const plain = useChartData(market, !isChained);
  const chained = useChainedChartData(market, isChained);
  return isChained ? chained : plain;
};
