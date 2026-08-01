import type { SupportedChain } from '@seer-pm/sdk';
import type { Market } from '@seer-pm/sdk';
import { fetchChartData } from '@seer-pm/sdk';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
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

export const usePoolHourDataSets = (market: Market) => {
  return useQuery({
    enabled: !!market,
    queryKey: getUsePoolHourDataSetsKey(market.chainId, market.id),
    retry: false,
    queryFn: () => fetchChartData(market),
    refetchOnMount: 'always',
  });
};

/** Default "All" period: ~10 years, 30-minute buckets. */
const DEFAULT_DAY_COUNT = 365 * 10;
const DEFAULT_INTERVAL_SECONDS = 60 * 30;

export const useChartData = (market: Market) => {
  const { data: poolHourDataSets } = usePoolHourDataSets(market);
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
