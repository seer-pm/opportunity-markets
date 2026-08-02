import * as React from 'react';
import { Link } from 'react-router-dom';
import { ConnectKitButton } from 'connectkit';
import { SeerLogo } from './SeerLogo';

export const HEADER_CONFIG = {
  productLabel: 'Opportunity Markets',
  connectWalletLabel: 'Connect Wallet',
};

function truncateAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

export interface MainHeaderProps {
  readonly className?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ className = '' }) => {
  return (
    <header
      className={`sticky top-0 z-50 border-b border-edge bg-wall/90 backdrop-blur-md ${className}`}
    >
      <div className="mx-auto flex w-full max-w-shell items-center justify-between gap-4 px-6 py-4 lg:px-10">
        <Link
          to="/"
          aria-label="Seer Opportunity Markets home"
          className="flex min-w-0 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up"
        >
          <SeerLogo />
          <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-paper sm:hidden">
            Seer
          </span>
          <span className="hidden h-5 w-px bg-edge-strong sm:block" aria-hidden />
          <span className="truncate font-display text-sm font-semibold tracking-tight text-paper sm:text-base">
            {HEADER_CONFIG.productLabel}
          </span>
        </Link>
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
                  ? 'inline-flex items-center rounded-control border border-up/40 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:border-up hover:text-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
                  : 'inline-flex items-center rounded-control bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
              }
            >
              {isConnected && address
                ? truncateAddress(address)
                : HEADER_CONFIG.connectWalletLabel}
            </button>
          )}
        </ConnectKitButton.Custom>
      </div>
    </header>
  );
};

export default MainHeader;
