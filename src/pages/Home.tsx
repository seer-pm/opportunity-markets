import * as React from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { useMarkets } from '@seer-pm/react';
import { type Market } from '@seer-pm/sdk';
import {
  CONFIGURED_MARKET_IDS,
  DEFAULT_MARKET_CHAIN_ID,
} from '../config/market';
import { MarketPreviewCard } from '../components/MarketPreviewCard';

const REBRAND_MARKET_ID = '0xe7850b0d928aa40ab8732BD323Fa4F6Ef3c24B8a';

const PROCESS_STEPS = [
  { label: 'Ideas become outcomes', emphasis: false, glow: false },
  { label: 'Traders set the odds', emphasis: false, glow: false },
  { label: 'Price shows conviction', emphasis: true, glow: false },
  { label: 'Sponsor keeps final say', emphasis: false, glow: true },
] as const;

const PROTOCOL_CARDS = [
  { kicker: 'Today', body: 'Seer operates it' },
  { kicker: 'Next', body: 'Anyone launches' },
  { kicker: 'Any decision', body: 'One shared layer' },
] as const;

function rankMarkets(markets: Market[]): Market[] {
  return [...markets].sort((a, b) => {
    const liqA = Number(a.liquidityUSD ?? 0);
    const liqB = Number(b.liquidityUSD ?? 0);
    return liqB - liqA;
  });
}

function liveCountLabel(count: number): string {
  if (count === 1) return 'One market live.';
  if (count === 2) return 'Two markets live.';
  return `${count} markets live.`;
}

export const Home: React.FC = () => {
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
  const lotsReady = !isLoading && !isError && markets.length > 0;
  const cascadeModeRef = React.useRef<'synced' | 'late' | null>(null);
  if (lotsReady && cascadeModeRef.current === null) {
    cascadeModeRef.current =
      performance.now() - bootAtRef.current > 900 ? 'late' : 'synced';
  }
  const cascadeLate = cascadeModeRef.current === 'late';

  const rebrandHref = `/markets/${DEFAULT_MARKET_CHAIN_ID}/${REBRAND_MARKET_ID}`;

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-wall">
      <MainHeader />
      <main className="mx-auto flex w-full min-w-0 max-w-shell flex-1 flex-col px-6 pb-16 lg:px-10">
        {/* Hero */}
        <section className="home-hero" aria-label="Opportunity Markets">
          <div className="home-hero-inner mx-auto flex max-w-4xl flex-col items-center text-center">
            <h1 className="hero-entrance-lead font-display text-[clamp(3rem,7vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-paper">
              An opinion costs nothing.{' '}
              <span className="text-up">Being right costs something.</span>
            </h1>
            <p className="hero-entrance-lead mt-5 max-w-2xl text-[clamp(1.25rem,2.2vw,1.5rem)] leading-[1.45] text-paper/90 sm:mt-7">
              Opportunity Markets turn any decision into a market. Traders put
              real money on the outcome they believe, the odds move, and sponsors
              read where the conviction actually is - keeping the final say.
            </p>

            <ol
              className="hero-step-rail mt-8 w-full sm:mt-10"
              aria-label="How opportunity markets work"
            >
              {PROCESS_STEPS.map((step, i) => (
                <React.Fragment key={step.label}>
                  {i > 0 && (
                    <li className="hero-step-arrow" aria-hidden>
                      →
                    </li>
                  )}
                  <li
                    className={
                      step.glow
                        ? 'hero-step-chip hero-step-chip--glow'
                        : step.emphasis
                          ? 'hero-step-chip hero-step-chip--emphasis'
                          : 'hero-step-chip'
                    }
                    style={{ '--beat-i': i } as React.CSSProperties}
                  >
                    {step.label}
                  </li>
                </React.Fragment>
              ))}
            </ol>

            <div className="hero-entrance-lead mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10">
              <Link
                to={rebrandHref}
                className="inline-flex items-center rounded-full bg-brand px-6 py-3 text-base font-semibold text-paper transition-colors hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
              >
                Seer Rebrand Market
              </Link>
              <a
                href="#protocol"
                className="inline-flex items-center rounded-full border border-paper/25 bg-transparent px-6 py-3 text-base font-semibold text-paper transition-colors hover:border-up/50 hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
              >
                Where this goes
              </a>
            </div>
          </div>
        </section>

        {/* The protocol */}
        <section
          id="protocol"
          className="scroll-mt-24 border-t border-edge pt-14 sm:pt-20"
          aria-labelledby="protocol-heading"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-up">
            The protocol
          </p>
          <h2
            id="protocol-heading"
            className="mt-3 font-display text-[clamp(1.875rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-paper"
          >
            Beta today. Permissionless next.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
            Seer runs these first markets to prove the mechanism. The direction
            of travel is a permissionless layer, where any team, DAO, or sponsor
            launches an opportunity market directly.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {PROTOCOL_CARDS.map((card) => (
              <li
                key={card.kicker}
                className="lot-panel flex flex-col gap-2 px-5 py-5"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-up">
                  {card.kicker}
                </span>
                <span className="font-display text-lg font-semibold tracking-tight text-paper">
                  {card.body}
                </span>
              </li>
            ))}
          </ul>

          <a
            href="#pilot"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-up transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
          >
            See the first edition
            <span aria-hidden>→</span>
          </a>
        </section>

        {/* The pilot */}
        <section
          id="pilot"
          className="scroll-mt-24 mt-14 border-t border-edge pt-14 sm:mt-20 sm:pt-20"
          aria-labelledby="pilot-heading"
          aria-busy={isLoading || isFetching}
        >
          <div className="opportunities-call">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-up">
              The pilot
            </p>
            <h2
              id="pilot-heading"
              className="mt-3 font-display text-[clamp(1.875rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-paper"
            >
              {!isLoading && !isError && markets.length > 0
                ? liveCountLabel(markets.length)
                : 'Two markets live.'}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
              Edition one is Seer&apos;s own rebrand, with a Devcon merch market
              alongside it.
            </p>
          </div>

          <div
            className={
              lotsReady
                ? cascadeLate
                  ? 'lot-stack--ready lot-stack--late mt-8 flex min-w-0 flex-col gap-4 sm:mt-10 sm:gap-5'
                  : 'lot-stack--ready mt-8 flex min-w-0 flex-col gap-4 sm:mt-10 sm:gap-5'
                : 'mt-8 flex min-w-0 flex-col gap-4 sm:mt-10 sm:gap-5'
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
                  className="rounded-full bg-brand px-5 py-2.5 text-xs font-semibold tracking-wide text-paper hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
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
            {markets.map((market: Market, index) => (
              <MarketPreviewCard
                key={`${market.chainId}-${market.id}`}
                market={market}
                cascadeIndex={index}
              />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
