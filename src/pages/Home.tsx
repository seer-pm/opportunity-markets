import * as React from 'react';
import { Link } from 'react-router-dom';
import { BrandStreak } from '@seer-pm/ui-kit/react';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { DEFAULT_MARKET_CHAIN_ID } from '../config/market';
import { isFinalized, useMarketList } from '../hooks/useMarketList';
import { MarketList } from '../components/MarketList';

const NAMING_MARKET_ID = '0x8b3C7f3f09f6A85353926D8ee0f12decc1C9A5e8';
const PROCESS_STEPS = [
  'Call for entries become submissions',
  'Traders set the odds of selection',
  'Price becomes a triage tool',
  'Sponsor makes final decision',
  'Traders earn P&L based on final decision',
];
const PROTOCOL_CARDS = [
  { kicker: 'Today', body: 'Seer One operates it' },
  { kicker: 'Next', body: 'Anyone launches' },
  { kicker: 'Any decision', body: 'One shared layer' },
];
function liveCountLabel(count: number): string {
  if (count === 0) return 'No markets live.';
  if (count === 1) return 'One market live.';
  if (count === 2) return 'Two markets live.';
  return `${count} markets live.`;
}

export const Home: React.FC = () => {
  const { markets, isLoading, isError, isFetching, refetch } = useMarketList();
  const liveMarkets = markets.filter((market) => !isFinalized(market));
  const archivedCount = markets.length - liveMarkets.length;
  const namingHref = `/markets/${DEFAULT_MARKET_CHAIN_ID}/${NAMING_MARKET_ID}`;
  return (
    <div className="flex min-h-screen min-w-0 flex-col bg-wall">
      <MainHeader />
      <main className="mx-auto w-full min-w-0 max-w-shell flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-16 lg:gap-y-5">
          <h1 className="home-intro lg:col-start-1 lg:row-start-1 max-w-[23ch] text-balance font-display text-[clamp(2rem,3.7vw,3rem)] font-semibold leading-[1.16] tracking-[-0.03em] text-paper">
            With AI, the cost of reviewing work is{' '}
            <span className="text-up">
              more than the time it takes to do it
            </span>
          </h1>
          <section
            id="pilot"
            className="scroll-mt-36 lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:scroll-mt-24"
            aria-labelledby="pilot-heading"
            aria-busy={isLoading || isFetching}
          >
            <h2
              id="pilot-heading"
              className="text-2xl font-semibold tracking-tight text-paper"
            >
              {!isLoading && !isError
                ? liveCountLabel(liveMarkets.length)
                : 'Markets live.'}
            </h2>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted">
              Seer is crowdsourcing the name of its AI job board. Past markets,
              like the rebrand and Devcon merch, are in the archive.
            </p>
            <MarketList
              markets={liveMarkets}
              isLoading={isLoading}
              isError={isError}
              refetch={refetch}
              emptyText="No live opportunities right now."
            />
            {!isLoading && !isError && archivedCount > 0 && (
              <Link
                to="/archive"
                className="seer-button seer-button-ghost mt-3"
              >
                View archived markets ({archivedCount})
                <span aria-hidden>→</span>
              </Link>
            )}
          </section>
          <p className="lg:col-start-1 lg:row-start-2 max-w-[65ch] text-base leading-relaxed text-muted">
            Opportunity Markets turn any selection process into a market.
            Traders put money behind the submission they think will be selected,
            the odds move, and sponsors prioritize review on only top rated
            submissions.
          </p>
          <div className="lg:col-start-1 lg:row-start-3 flex flex-wrap items-center gap-3">
            <Link to={namingHref} className="seer-button seer-button-primary">
              Name Seer&apos;s AI Job Board
            </Link>
            <a href="#protocol" className="seer-button seer-button-ghost">
              Where this goes
            </a>
          </div>
        </div>
        <section className="mt-12 sm:mt-16" aria-labelledby="process-heading">
          <h2
            id="process-heading"
            className="text-2xl font-semibold tracking-tight text-paper"
          >
            How it works
          </h2>
          <ol
            className="mt-5 grid divide-y divide-edge border-y border-edge md:grid-cols-5 md:divide-x md:divide-y-0"
            aria-label="How opportunity markets work"
          >
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step}
                className={`py-5 text-sm font-semibold leading-relaxed md:px-4 first:md:pl-0 ${index === 2 ? 'text-up' : 'text-paper'}`}
              >
                {step}
              </li>
            ))}
          </ol>
        </section>
        <section
          id="protocol"
          data-theme="dark"
          className="relative isolate mt-12 scroll-mt-36 overflow-hidden rounded-surface bg-seer-ink p-6 text-seer-on-ink sm:mt-16 sm:p-10 lg:scroll-mt-24"
          aria-labelledby="protocol-heading"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent_40%,black)]"
          >
            <BrandStreak className="absolute right-0 top-0 h-full w-2/3 text-seer-purple-on-ink opacity-30" />
          </div>
          <h2
            id="protocol-heading"
            className="max-w-[28ch] text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Closed beta today. Permissionless tomorrow.
          </h2>
          <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-seer-on-ink-muted sm:text-base">
            Seer has run opportunity markets for its rebrand and Devcon merch,
            and is now naming its AI job board. Any team crowdsourcing solutions
            and wanting to pick from only among the best should directly launch
            an opportunity market.
          </p>
          <ul className="relative mt-6 grid gap-4 border-t border-seer-ink-border pt-5 sm:grid-cols-3">
            {PROTOCOL_CARDS.map((card) => (
              <li key={card.kicker} className="flex flex-col gap-1 text-sm">
                <span className="text-seer-on-ink-muted">{card.kicker}</span>
                <strong className="font-semibold">{card.body}</strong>
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
