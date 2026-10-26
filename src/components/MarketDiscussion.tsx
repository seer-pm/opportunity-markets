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
      aria-busy={isLoading || undefined}
      className={
        isPrimary
          ? 'seer-button seer-button-primary seer-button-sm'
          : 'seer-button seer-button-outline seer-button-sm'
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
        chainId: market.chainId,
        getAccessToken: () => {
          const token = getAccessToken();
          return isAccessTokenExpired(token) ? '' : token;
        },
      }),
    [market.id, market.chainId],
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
      <h2 className="mb-4 text-lg font-semibold text-paper">Discussion</h2>
      <Discussion
        client={client}
        user={user}
        onRequestConnect={requestConnect}
        components={{ Button: DiscussionButton }}
      />
    </div>
  );
}
