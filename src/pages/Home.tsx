import * as React from 'react';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { useMarkets } from '@seer-pm/react';
import { type Market } from '@seer-pm/sdk';
import {
  CONFIGURED_MARKET_IDS,
  DEFAULT_MARKET_CHAIN_ID,
} from '../config/market';
import { MarketPreviewCard } from '../components/MarketPreviewCard';

const HERO_LOT_CAP = 4;

const PROCESS_BEATS = [
  'Ideas become outcomes',
  'traders set the odds',
  'organizers choose',
  'winners settle',
] as const;

function rankMarkets(markets: Market[]): Market[] {
  return [...markets].sort((a, b) => {
    const liqA = Number(a.liquidityUSD ?? 0);
    const liqB = Number(b.liquidityUSD ?? 0);
    return liqB - liqA;
  });
}

function runViewTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> };
  };
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(update);
    return;
  }
  update();
}

export const Home: React.FC = () => {
  const [showAll, setShowAll] = React.useState(false);
  const bootAtRef = React.useRef(
    typeof performance !== 'undefined' ? performance.now() : 0
  );

  const { data, isLoading, isError, refetch, isFetching } = useMarkets({
    chainsList: [String(DEFAULT_MARKET_CHAIN_ID)],
    marketIds: CONFIGURED_MARKET_IDS,
  });

  const markets = React.useMemo(
    () => rankMarkets(data?.markets ?? []),
    [data?.markets]
  );
  const visibleMarkets = showAll
    ? markets
    : markets.slice(0, HERO_LOT_CAP);
  const hiddenCount = Math.max(markets.length - HERO_LOT_CAP, 0);
  const lotsReady = !isLoading && !isError && markets.length > 0;
  const cascadeModeRef = React.useRef<'synced' | 'late' | null>(null);
  if (lotsReady && cascadeModeRef.current === null) {
    cascadeModeRef.current =
      performance.now() - bootAtRef.current > 900 ? 'late' : 'synced';
  }
  const cascadeLate = cascadeModeRef.current === 'late';

  const revealAll = () => {
    runViewTransition(() => setShowAll(true));
  };

  const collapseToTop = () => {
    runViewTransition(() => setShowAll(false));
  };

  const processList = (placement: 'hero' | 'after-lot') => (
    <ul
      className={
        placement === 'hero'
          ? lotsReady
            ? 'hero-process mt-2 hidden max-w-xl text-sm leading-snug text-muted sm:flex'
            : 'hero-process mt-2 flex max-w-xl text-sm leading-snug text-muted'
          : 'hero-process max-w-xl text-sm leading-snug text-muted sm:hidden'
      }
      aria-label="How opportunity markets work"
    >
      {PROCESS_BEATS.map((beat, i) => (
        <li
          key={`${placement}-${beat}`}
          className="hero-process-beat"
          style={{ '--beat-i': i } as React.CSSProperties}
        >
          {i > 0 && (
            <span className="hero-process-sep" aria-hidden>
              ·
            </span>
          )}
          <span>{beat}</span>
        </li>
      ))}
    </ul>
  );

  const [firstMarket, ...restMarkets] = visibleMarkets;

  return (
    <div className="flex min-h-screen flex-col bg-wall">
      <MainHeader />
      <main className="mx-auto flex w-full max-w-shell flex-1 flex-col px-6 pb-16 pt-3 sm:pt-8 lg:px-10 lg:pt-10">
        <section
          className="hero-rail"
          aria-label="Community picks, markets decide"
        >
          <div className="max-w-2xl">
            <h1 className="font-display text-[clamp(1.75rem,8vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-paper sm:text-[clamp(2.5rem,7vw,4.5rem)]">
              <span className="hero-entrance-word">Community picks,</span>{' '}
              <span className="hero-entrance-word font-semibold italic text-up">
                markets decide
              </span>
            </h1>
            <p className="hero-entrance-lead mt-2 max-w-xl text-sm leading-snug text-muted sm:mt-4 sm:text-lg sm:leading-relaxed">
              Community proposals become market outcomes. Trade on which ideas
              get chosen, and earn rewards when yours wins.
            </p>
            {processList('hero')}
          </div>
        </section>

        <section
          className="mt-3 sm:mt-8"
          aria-labelledby="opportunities-heading"
          aria-busy={isLoading || isFetching}
        >
          <div className="opportunities-call mb-3 flex items-baseline justify-between gap-3 sm:mb-4">
            <h2
              id="opportunities-heading"
              className="font-display text-base font-semibold text-paper sm:text-xl"
            >
              Opportunities
            </h2>
            {!isLoading && !isError && markets.length > 0 && (
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-up">
                {markets.length} open
              </p>
            )}
          </div>
          <div
            className={
              lotsReady
                ? cascadeLate
                  ? 'lot-stack--ready lot-stack--late flex flex-col gap-4 sm:gap-5'
                  : 'lot-stack--ready flex flex-col gap-4 sm:gap-5'
                : 'flex flex-col gap-4 sm:gap-5'
            }
          >
            {isLoading && (
              <div className="lot-panel p-10 text-center">
                <p className="text-base text-muted">Loading opportunities…</p>
              </div>
            )}
            {isError && (
              <div className="lot-panel flex flex-col items-center gap-4 p-10 text-center">
                <p className="text-base text-paper">
                  Could not load opportunities. Check your connection and try
                  again.
                </p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-control bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
                >
                  Retry
                </button>
              </div>
            )}
            {!isLoading && !isError && markets.length === 0 && (
              <div className="lot-panel p-10 text-center">
                <p className="text-base text-muted">
                  No opportunities available yet.
                </p>
              </div>
            )}
            {firstMarket && (
              <MarketPreviewCard
                key={`${firstMarket.chainId}-${firstMarket.id}`}
                market={firstMarket}
                cascadeIndex={0}
              />
            )}
            {lotsReady && processList('after-lot')}
            {restMarkets.map((market: Market, index) => (
              <MarketPreviewCard
                key={`${market.chainId}-${market.id}`}
                market={market}
                cascadeIndex={index + 1}
              />
            ))}
            {!isLoading && !isError && hiddenCount > 0 && !showAll && (
              <button
                type="button"
                onClick={revealAll}
                className="lot-panel lot-cascade-item w-full px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:border-up/40 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
                style={
                  {
                    '--cascade-i': visibleMarkets.length,
                  } as React.CSSProperties
                }
              >
                Show all {markets.length} opportunities
              </button>
            )}
            {showAll && markets.length > HERO_LOT_CAP && (
              <button
                type="button"
                onClick={collapseToTop}
                className="lot-panel w-full px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:border-up/40 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
              >
                Show top {HERO_LOT_CAP} opportunities
              </button>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
