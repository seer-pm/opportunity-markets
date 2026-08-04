import { Children, useMemo, type ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useModal } from 'connectkit';
import {
  Discussion,
  createDiscussionsClient,
  userFromAddress,
  type DiscussionButtonProps,
} from '@seer-pm/discussions';
import type { Market } from '@seer-pm/sdk';
import { getAccessToken, useIsSignedIn } from '../hooks/useAccessToken';
import { useSignIn } from '../hooks/useSignIn';
import { getSeerAppUrl, isAccessTokenExpired } from '../lib/seerAuth';

function buttonLabel(children: ReactNode): string {
  const text = Children.toArray(children)
    .filter((child) => typeof child === 'string' || typeof child === 'number')
    .join('')
    .trim();
  return text || ' ';
}

function DiscussionButton({
  children,
  variant = 'primary',
  isLoading,
  type = 'button',
  disabled,
  onClick,
}: DiscussionButtonProps) {
  const isPrimary = variant !== 'secondary';
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={
        isPrimary
          ? 'inline-flex items-center justify-center rounded-control bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-up disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
          : 'inline-flex items-center justify-center rounded-control border border-paper/15 bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:border-up/40 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up'
      }
    >
      {isLoading ? '…' : buttonLabel(children)}
    </button>
  );
}

export default function MarketDiscussion({ market }: { market: Market }) {
  const { address, chainId, isConnected } = useAccount();
  const isSignedIn = useIsSignedIn();
  const signIn = useSignIn();
  const { setOpen } = useModal();

  const client = useMemo(
    () =>
      createDiscussionsClient({
        baseUrl: getSeerAppUrl(),
        marketId: market.id,
        getAccessToken: () => {
          const token = getAccessToken();
          return isAccessTokenExpired(token) ? '' : token;
        },
      }),
    [market.id]
  );

  const user = isSignedIn && address ? userFromAddress(address) : null;

  const requestConnect = async () => {
    if (!isConnected || !address || !chainId) {
      setOpen(true);
      return;
    }
    await signIn.mutateAsync({ address, chainId });
  };

  return (
    <div className="lot-panel p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Discussion
      </h2>
      <Discussion
        context={market.id.toLowerCase()}
        client={client}
        user={user}
        onRequestConnect={requestConnect}
        components={{ Button: DiscussionButton }}
      />
    </div>
  );
}
