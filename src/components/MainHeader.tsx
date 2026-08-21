import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectKitButton } from 'connectkit';
import { SeerLogo } from './SeerLogo';

export const HEADER_CONFIG = {
  connectWalletLabel: 'Connect wallet',
};

function truncateAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

function SectionLink({
  hash,
  children,
}: {
  hash: string;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const to = location.pathname === '/' ? hash : `/${hash}`;

  return (
    <a
      href={to}
      className="text-sm font-medium text-paper/80 transition-colors hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
    >
      {children}
    </a>
  );
}

export interface MainHeaderProps {
  readonly className?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ className = '' }) => {
  return (
    <header
      className={`sticky top-0 z-50 border-b border-edge/60 bg-wall/90 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link
          to="/"
          aria-label="Seer Opportunity Markets home"
          className="flex min-w-0 items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
        >
          <SeerLogo variant="mark" />
          <span className="font-display text-base font-semibold tracking-tight text-paper">
            Seer
          </span>
          <span className="rounded-full bg-brand/80 px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.1em] text-up">
            Beta
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav
            className="hidden items-center gap-5 sm:flex"
            aria-label="Page sections"
          >
            <SectionLink hash="#protocol">The protocol</SectionLink>
            <SectionLink hash="#pilot">The pilot</SectionLink>
          </nav>

          <ConnectKitButton.Custom>
            {({
              isConnected,
              address,
              show,
            }: {
              isConnected: boolean;
              address?: string;
              show?: () => void;
            }) => (
              <button
                type="button"
                onClick={() => show?.()}
                className={
                  isConnected
                    ? 'inline-flex items-center rounded-full border border-up/40 bg-transparent px-4 py-2 text-xs font-semibold tracking-wide text-paper transition-colors hover:border-up hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
                    : 'inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-semibold tracking-wide text-paper transition-colors hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
                }
              >
                {isConnected && address
                  ? truncateAddress(address)
                  : HEADER_CONFIG.connectWalletLabel}
              </button>
            )}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
