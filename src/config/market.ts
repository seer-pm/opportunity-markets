import { CHAIN_IDS } from '@seer-pm/sdk';

export const DEFAULT_MARKET_CHAIN_ID = CHAIN_IDS.gnosis;

export type MarketOverride = {
  title: string;
  description?: string;
};

export const MARKET_OVERRIDES: Record<string, MarketOverride> = {
  '0x7B5fF95035a4b8EA68E5A20Ff22337Ba1c48F1e4': {
    title: 'Seer Merch for Devcon Mumbai',
    description:
      'This market is used to choose which Seer merch designs will be produced for Devcon Mumbai.\n\nCommunity ideas were collected and turned into design mockups. Each design is listed as an outcome of this multicategorical market. Once the market resolves, 5 designs become the official Seer merch for Devcon Mumbai.\n\nWinning submissions get printed and earn $100 in trading credits each.',
  },
  '0x548c7C9A68c64C17DF36DE40a59933e008042B2B': {
    title: 'Seer Rebrand Contest',
    description:
      'This market is used to choose which visual identity Seer will select for its rebrand.\n\nEvery submission is listed as an outcome of this multi-scalar market. Traders buy shares in the direction they believe the team will pick. Final selection stays with the team, with market prices as the community signal.\n\nThe winning entry receives $3,000. The top 5 submissions by price also receive Seer credits.',
  },
};

export const CONFIGURED_MARKET_IDS = Object.keys(MARKET_OVERRIDES);

export function getMarketOverride(marketId: string): MarketOverride | undefined {
  const needle = marketId.toLowerCase();
  const key = Object.keys(MARKET_OVERRIDES).find((k) => k.toLowerCase() === needle);
  return key ? MARKET_OVERRIDES[key] : undefined;
}

export function getMarketDisplayTitle(
  marketId: string,
  fallbackName: string | null | undefined
): string {
  return getMarketOverride(marketId)?.title ?? fallbackName ?? 'Market';
}
