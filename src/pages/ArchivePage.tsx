import * as React from 'react';
import { Link } from 'react-router-dom';
import MainHeader from '../components/MainHeader';
import Footer from '../components/Footer';
import { MarketList } from '../components/MarketList';
import { isFinalized, useMarketList } from '../hooks/useMarketList';

export const ArchivePage: React.FC = () => {
  const { markets, isLoading, isError, isFetching, refetch } = useMarketList();
  const archivedMarkets = markets.filter(isFinalized);

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-wall">
      <MainHeader />
      <main className="mx-auto flex w-full min-w-0 max-w-shell flex-1 flex-col px-4 pb-12 pt-8 sm:px-6 sm:pb-16 lg:px-10">
        <nav className="mb-8" aria-label="Archive navigation">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
          >
            <span aria-hidden>←</span>
            Back to opportunities
          </Link>
        </nav>

        <section
          aria-labelledby="archive-heading"
          aria-busy={isLoading || isFetching}
        >
          <h1
            id="archive-heading"
            className="font-display text-[clamp(1.875rem,3vw,2.25rem)] font-semibold leading-[1.15] tracking-[-0.025em] text-paper"
          >
            Past markets
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/85 sm:text-lg">
            Finalized opportunity markets. Holders of winning shares can still
            redeem them from each market&apos;s page.
          </p>

          <MarketList
            markets={archivedMarkets}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
            emptyText="No finalized markets yet."
          />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ArchivePage;
