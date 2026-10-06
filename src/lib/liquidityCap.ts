import { swaprGraphQLClient, type SupportedChain } from '@seer-pm/sdk';
import type { Address } from 'viem';
import { fetchCollateralPools, getBestPoolByToken, type SwaprPool } from './chainedMarket';

/**
 * Concentrated-liquidity pools can run out of liquidity just above the current
 * price. Once a few collateral tokens can push an outcome to that edge, its
 * displayed odds are only a floor: nobody can buy above it, so the market's
 * real belief may be much higher. Such outcomes are shown as "20%+".
 */

/** Collateral (sDAI) it may cost at most to reach the edge for odds to count as capped. */
const MAX_COST_TO_EDGE = 10;
/** Edges this close to 100% say nothing useful. */
const MAX_EDGE_PRICE = 0.99;
const SUBGRAPH_PAGE = 1000;
const WAD = 1e18;

type Tick = { tickIdx: string; liquidityNet: string; pool: { id: string } };

const TICKS_QUERY = `
  query GetPoolTicks($pools: [String!]!, $first: Int!, $skip: Int!) {
    ticks(
      where: { pool_in: $pools, liquidityNet_not: "0" }
      first: $first
      skip: $skip
      orderBy: tickIdx
      orderDirection: asc
    ) {
      tickIdx
      liquidityNet
      pool { id }
    }
  }
`;

async function fetchTicksByPool(
  chainId: SupportedChain,
  poolIds: string[]
): Promise<Record<string, Tick[]>> {
  const client = swaprGraphQLClient(chainId, 'algebra');
  if (!client) return {};
  const byPool: Record<string, Tick[]> = {};
  for (let skip = 0; ; skip += SUBGRAPH_PAGE) {
    const { ticks } = await client.request<{ ticks: Tick[] }>(TICKS_QUERY, {
      pools: poolIds,
      first: SUBGRAPH_PAGE,
      skip,
    });
    for (const tick of ticks) (byPool[tick.pool.id] ??= []).push(tick);
    if (ticks.length < SUBGRAPH_PAGE) break;
  }
  return byPool;
}

const sqrtAt = (tick: number) => 1.0001 ** (tick / 2);

/**
 * Walks liquidity in the direction that raises the outcome price, adding up
 * the collateral needed to cross each range. Returns the outcome price where
 * liquidity runs out, or null when that edge is too expensive to reach.
 */
function getEdgePrice(pool: SwaprPool, ticks: Tick[], outcomeIsToken0: boolean): number | null {
  if (pool.tick == null) return null;
  const current = Number(pool.tick);
  let liquidity = Number(pool.liquidity) / WAD;
  let cost = 0;
  let position = current;

  // Outcome is token0: its price (in token1) rises with the tick, and buying
  // pays token1. Outcome is token1: its price rises as the tick falls, and
  // buying pays token0.
  const path = outcomeIsToken0
    ? ticks.filter((t) => Number(t.tickIdx) > current)
    : ticks.filter((t) => Number(t.tickIdx) <= current).reverse();

  for (const tick of path) {
    const next = Number(tick.tickIdx);
    cost += outcomeIsToken0
      ? liquidity * (sqrtAt(next) - sqrtAt(position))
      : liquidity * (1 / sqrtAt(next) - 1 / sqrtAt(position));
    if (cost > MAX_COST_TO_EDGE) return null;
    const net = Number(tick.liquidityNet) / WAD;
    liquidity += outcomeIsToken0 ? net : -net;
    position = next;
    // Float rounding can leave dust instead of an exact zero.
    if (liquidity <= 1e-9) {
      const price = outcomeIsToken0 ? 1.0001 ** next : 1.0001 ** -next;
      return price < MAX_EDGE_PRICE ? price : null;
    }
  }
  return null;
}

/**
 * Per outcome token: the odds (percent, one decimal) where liquidity runs out
 * when that edge is cheap to reach, else null.
 */
export async function fetchOddsCaps(
  chainId: SupportedChain,
  tokens: Address[],
  collateral: Address
): Promise<(number | null)[]> {
  // Only Swapr (Gnosis) pools are read for now.
  if (!swaprGraphQLClient(chainId, 'algebra')) return tokens.map(() => null);
  const pools = await fetchCollateralPools(chainId, tokens, collateral);
  const best = getBestPoolByToken(collateral, pools);
  const poolIds = [...new Set(Object.values(best).map((p) => p.id))];
  if (poolIds.length === 0) return tokens.map(() => null);

  const ticksByPool = await fetchTicksByPool(chainId, poolIds);
  return tokens.map((token) => {
    const key = token.toLowerCase();
    const pool = best[key];
    if (!pool || BigInt(pool.liquidity) === 0n) return null;
    const price = getEdgePrice(
      pool,
      ticksByPool[pool.id] ?? [],
      pool.token0.id.toLowerCase() === key
    );
    return price == null ? null : Number((price * 100).toFixed(1));
  });
}
