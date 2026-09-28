import * as React from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { useMarkets } from '@seer-pm/react';
import { type Market } from '@seer-pm/sdk';
import {
  CONFIGURED_MARKET_IDS,
  DEFAULT_MARKET_CHAIN_ID,
  getChainedLevels,
} from '../config/market';
import { useChainedMarkets } from '../hooks/useChainedMarket';
import { MarketPreviewCard } from '../components/MarketPreviewCard';

// Chained opportunities are loaded as one flattened market each, not as raw Seer markets.
const CHAINED_MARKET_IDS = CONFIGURED_MARKET_IDS.filter((id) => getChainedLevels(id));
const PLAIN_MARKET_IDS = CONFIGURED_MARKET_IDS.filter((id) => !getChainedLevels(id));

const REBRAND_MARKET_ID = '0xe7850b0d928aa40ab8732BD323Fa4F6Ef3c24B8a';

const PROCESS_STEPS = [
  {
    label: 'Call for entries become submissions',
    emphasis: false,
    glow: false,
  },
  { label: 'Traders set the odds of selection', emphasis: false, glow: false },
  { label: 'Price becomes a triage tool', emphasis: true, glow: false },
  { label: 'Sponsor makes final decision', emphasis: false, glow: false },
  {
    label: 'Traders earn P&L based on final decision',
    emphasis: false,
    glow: true,
  },
] as const;

const PROTOCOL_CARDS = [
  { kicker: 'Today', body: 'Seer One operates it' },
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

  const {
    data,
    isLoading: isPlainLoading,
    isError,
    refetch,
    isFetching: isPlainFetching,
  } = useMarkets({
    chainsList: [String(DEFAULT_MARKET_CHAIN_ID)],
    marketIds: PLAIN_MARKET_IDS,
  });
  const chainedQueries = useChainedMarkets(
    CHAINED_MARKET_IDS,
    DEFAULT_MARKET_CHAIN_ID
  );
  const isLoading =
    isPlainLoading || chainedQueries.some((q) => q.isLoading);
  const isFetching =
    isPlainFetching || chainedQueries.some((q) => q.isFetching);
  const chainedMarkets = chainedQueries
    .map((q) => q.data?.market)
    .filter((m): m is Market => m !== undefined);

  const markets = rankMarkets([...(data?.markets ?? []), ...chainedMarkets]);
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
          <div className="home-hero-inner mx-auto flex w-full max-w-[68rem] flex-col items-center text-center">
            <h1 className="hero-entrance-lead max-w-4xl font-display text-[clamp(2.5rem,5.5vw,3.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-paper">
              With AI, the cost of reviewing work is{' '}
              <span className="text-up">
                more than the time it takes to do it
              </span>
            </h1>
            <p className="hero-entrance-lead mt-5 max-w-2xl text-[clamp(1.25rem,2.2vw,1.5rem)] leading-[1.45] text-paper/90 sm:mt-7">
              Opportunity Markets turn any selection process into a market. Traders
              put money behind the submission they think will be selected, the
              odds move, and sponsors prioritize review on only top rated
              submissions.
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
                href="#pilot"
                className="inline-flex items-center rounded-full border border-paper/25 bg-transparent px-6 py-3 text-base font-semibold text-paper transition-colors hover:border-up/50 hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
              >
                Where this goes
              </a>
            </div>
          </div>
        </section>

        {/* The pilot */}
        <section
          id="pilot"
          className="scroll-mt-24 border-t border-edge pt-14 sm:pt-20"
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
                : liveCountLabel(CONFIGURED_MARKET_IDS.length)}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
              Edition one is Seer&apos;s own rebrand, with a Devcon merch market
              and the naming of Seer&apos;s AI job board alongside it.
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
        {/* The protocol */}
        <section
          id="protocol"
          className="scroll-mt-24 mt-14 border-t border-edge pt-14 sm:mt-20 sm:pt-20"
          aria-labelledby="protocol-heading"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-up">
            The protocol
          </p>
          <h2
            id="protocol-heading"
            className="mt-3 font-display text-[clamp(1.875rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-paper"
          >
            Closed beta today. Permissionless tomorrow.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
            Seer is running the first opportunity market for its Devcon merch. Any
            team crowdsourcing solutions and wanting to pick from only among the
            best should directly launch an opportunity market.
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
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;
