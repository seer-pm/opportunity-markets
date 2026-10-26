import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectKitButton } from 'connectkit';
import { BrandLockup, ThemeToggle } from '@seer-pm/ui-kit/react';
import { useTheme } from '../hooks/useTheme';

export const HEADER_CONFIG = { connectWalletLabel: 'Connect wallet' };

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface MainHeaderProps {
  readonly className?: string;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  return (
    <header
      className={`sticky top-0 z-50 border-b border-edge bg-wall ${className}`}
    >
      <div className="mx-auto flex w-full max-w-shell flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:min-h-[72px] lg:flex-nowrap lg:px-10 lg:py-0">
        <Link
          to="/"
          aria-label="Seer Opportunity Markets home"
          className="mr-auto shrink-0 rounded-control"
        >
          <BrandLockup appName="Opportunity Markets" />
        </Link>
        <div className="flex w-full items-center gap-2 lg:w-auto">
          <nav
            className="mr-auto flex items-center gap-1 lg:mr-3"
            aria-label="Pages"
          >
            <Link
              to="/"
              aria-current={pathname === '/' ? 'page' : undefined}
              className={`seer-button seer-button-ghost seer-button-sm ${pathname === '/' ? 'bg-seer-accent-soft text-up' : ''}`}
            >
              Markets
            </Link>
            <Link
              to="/archive"
              aria-current={pathname === '/archive' ? 'page' : undefined}
              className={`seer-button seer-button-ghost seer-button-sm ${pathname === '/archive' ? 'bg-seer-accent-soft text-up' : ''}`}
            >
              Archive
            </Link>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
                className={`seer-button ${isConnected ? 'seer-button-outline font-mono' : 'seer-button-primary'}`}
              >
                <span>
                  {isConnected && address
                    ? truncateAddress(address)
                    : HEADER_CONFIG.connectWalletLabel}
                </span>
              </button>
            )}
          </ConnectKitButton.Custom>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
