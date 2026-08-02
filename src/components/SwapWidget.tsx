import * as React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { formatUnits, isAddressEqual, zeroAddress } from 'viem';
import type { Market, Token } from '@seer-pm/sdk';
import {
  TradeType,
  isSeerCredits,
  getMaximumAmountIn,
  WRAPPED_OUTCOME_TOKEN_DECIMALS,
  getActivePrimaryCollateral,
} from '@seer-pm/sdk';
import {
  useMarket,
  useMarketHasLiquidity,
  useMissingTradeApproval,
  useQuoteTrade,
  useTokenBalance,
  useTokenInfo,
  useTrade,
  useApproveTokens,
} from '@seer-pm/react';
import { ConnectKitButton } from 'connectkit';
import { toastify, toastifyTx } from '../lib/toastify';
import { TokensDropdown } from './TokensDropdown';

const amountInputClass =
  'w-full rounded-panel border border-edge bg-wall px-4 py-3 pr-20 text-xl font-semibold text-paper placeholder:text-muted/50 focus:border-up focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-up disabled:opacity-60';

const labelClass =
  'text-xs font-semibold uppercase tracking-[0.08em] text-muted';

const presetBtnClass =
  'rounded-control border border-edge bg-wall px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:border-paper/25 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up disabled:cursor-not-allowed disabled:opacity-40';

const primaryBtnClass =
  'mt-6 w-full rounded-control bg-brand px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-up focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up disabled:cursor-not-allowed disabled:opacity-60';

const warnBtnClass =
  'mt-6 w-full rounded-control bg-down px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.08em] text-paper transition-colors hover:bg-down/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up disabled:cursor-not-allowed disabled:opacity-60';

const BUY_PRESETS = [1, 5, 10, 100] as const;
const SELL_PRESETS = [
  { label: '25%', pct: 25 },
  { label: '50%', pct: 50 },
  { label: '75%', pct: 75 },
  { label: 'Max', pct: 100 },
] as const;

export interface SwapWidgetProps {
  readonly market: Market;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function buildOutcomeTokens(market: Market): Token[] {
  const tokens: Token[] = [];
  const wrapped = market.wrappedTokens ?? [];
  const rawOutcomes = market.outcomes ?? [];

  for (let i = 0; i < wrapped.length; i += 1) {
    const address = wrapped[i];
    if (!address) continue;

    const raw = rawOutcomes[i];
    const symbol =
      typeof raw === 'string' ? raw : `Outcome ${i + 1}`;

    tokens.push({
      address: address as `0x${string}`,
      chainId: market.chainId,
      symbol,
      decimals: WRAPPED_OUTCOME_TOKEN_DECIMALS,
    });
  }

  return tokens;
}

function getSelectedCollateral(
  market: Market,
  outcomeToken: Token,
  parentCollateral?: Token
): Token {
  const parentId = market.parentMarket.id;
  const hasParent =
    typeof parentId === 'string' &&
    !isAddressEqual(parentId, zeroAddress) &&
    parentCollateral;

  if (hasParent && parentCollateral) {
    return parentCollateral;
  }

  return getActivePrimaryCollateral(market.chainId) ?? outcomeToken;
}

export function SwapWidget({
  market,
}: SwapWidgetProps): React.ReactElement {
  const { address: account, chainId: connectedChainId } = useAccount();
  const { switchChain, isPending: isSwitchPending } = useSwitchChain();
  const isWrongChain =
    account != null &&
    connectedChainId != null &&
    connectedChainId !== market.chainId;
  const lastAutoSwitchChainIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!account || connectedChainId == null) return;
    if (connectedChainId === market.chainId) return;
    if (lastAutoSwitchChainIdRef.current === market.chainId) return;
    lastAutoSwitchChainIdRef.current = market.chainId;
    switchChain({ chainId: market.chainId });
  }, [account, connectedChainId, market.chainId, switchChain]);

  const [mode, setMode] = React.useState<'buy' | 'sell'>('buy');
  const [outcomeIndex, setOutcomeIndex] = React.useState(0);
  const [amount, setAmount] = React.useState('');

  const outcomeTokens = React.useMemo(
    () => buildOutcomeTokens(market),
    [market]
  );

  const parentId = market.parentMarket.id;
  const isChildMarket =
    typeof parentId === 'string' &&
    !isAddressEqual(parentId, zeroAddress);

  const parentOutcomeIndex = isChildMarket
    ? Number(market.parentOutcome)
    : undefined;

  const { data: parentMarket } = useMarket(
    market.parentMarket.id,
    market.chainId
  );

  const parentCollateralAddress =
    isChildMarket && parentMarket && parentOutcomeIndex !== undefined
      ? parentMarket.wrappedTokens?.[parentOutcomeIndex]
      : undefined;

  const { data: parentCollateral } = useTokenInfo(
    parentCollateralAddress,
    market.chainId
  );

  const debouncedAmount = useDebounce(amount, 500);

  const safeOutcomeIndex =
    outcomeTokens.length === 0
      ? 0
      : Math.min(Math.max(outcomeIndex, 0), outcomeTokens.length - 1);

  const outcomeToken =
    outcomeTokens[safeOutcomeIndex] ?? outcomeTokens[0];

  const hasLiquidity = useMarketHasLiquidity(market, safeOutcomeIndex);

  const selectedCollateral = getSelectedCollateral(
    market,
    outcomeToken,
    parentCollateral
  );

  const amountForQuote =
    isAddressEqual(selectedCollateral.address, outcomeToken.address)
      ? ''
      : debouncedAmount;

  const sellToken = mode === 'buy' ? selectedCollateral : outcomeToken;

  const { data: balance = 0n } = useTokenBalance(
    account,
    sellToken?.address,
    market.chainId
  );

  const {
    data: quoteData,
    isLoading: quoteIsLoading,
    error: quoteError,
  } = useQuoteTrade(
    market.chainId,
    account,
    amountForQuote,
    outcomeToken,
    selectedCollateral,
    mode,
    TradeType.EXACT_INPUT,
    '1',
    false
  );

  const requiredAmount = quoteData?.trade
    ? getMaximumAmountIn(quoteData.trade)
    : 0n;

  const insufficientBalance =
    !!quoteData?.trade && requiredAmount > 0n && balance < requiredAmount;

  const isSeerCreditsCollateral = selectedCollateral
    ? isSeerCredits(market.chainId, selectedCollateral.address)
    : false;

  const {
    data: missingApprovals = [],
    isLoading: isApprovalLoading,
  } = useMissingTradeApproval(account, quoteData?.trade);

  const needsTokenApproval =
    !isSeerCreditsCollateral && missingApprovals.length > 0;

  const approveTokensMutation = useApproveTokens(toastifyTx);

  const { tradeTokens } = useTrade(
    account,
    quoteData?.trade,
    isSeerCreditsCollateral,
    () => {
      setAmount('');
    },
    false,
    toastify,
    toastifyTx
  );

  const executeTrade = tradeTokens.mutateAsync;
  const isTradePending = tradeTokens.isPending;

  const receivedAmount = quoteData
    ? Number(formatUnits(quoteData.value, quoteData.decimals))
    : 0;

  const isDisabled = hasLiquidity === false;

  const outcomeOptions: readonly Token[] = React.useMemo(
    () => outcomeTokens,
    [outcomeTokens]
  );

  const { data: outcomeShares = 0n } = useTokenBalance(
    account,
    outcomeToken?.address,
    market.chainId
  );

  const payBalanceRaw = mode === 'buy' ? balance : outcomeShares;

  const payDecimals =
    mode === 'buy'
      ? selectedCollateral?.decimals ?? 18
      : WRAPPED_OUTCOME_TOKEN_DECIMALS;

  const payBalanceHuman = Number(formatUnits(payBalanceRaw, payDecimals));

  const setAmountToPercent = React.useCallback(
    (pct: number) => {
      const value = (payBalanceHuman * pct) / 100;
      setAmount(value <= 0 ? '0' : value.toFixed(4).replace(/\.?0+$/, ''));
    },
    [payBalanceHuman]
  );

  const addBuyAmount = React.useCallback((delta: number) => {
    setAmount((prev) => {
      const next = (Number(prev) || 0) + delta;
      return next <= 0 ? '' : String(next);
    });
  }, []);

  const setTradeMode = React.useCallback((next: 'buy' | 'sell') => {
    setMode(next);
    setAmount('');
  }, []);

  const payBalance =
    mode === 'buy'
      ? account
        ? Number(
            formatUnits(balance, selectedCollateral?.decimals ?? 18)
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : '0.00'
      : account
        ? Number(
            formatUnits(outcomeShares, WRAPPED_OUTCOME_TOKEN_DECIMALS)
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
          })
        : '0.00';

  const displayReceiveAmount =
    quoteData && Number(debouncedAmount) > 0 && !quoteIsLoading
      ? receivedAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        })
      : '0.0';

  const amountIn = Number(debouncedAmount) || 0;
  const amountOut = receivedAmount;

  const avgPrice =
    quoteData && amountIn > 0 && amountOut > 0 && !quoteIsLoading
      ? mode === 'buy'
        ? amountIn / amountOut
        : amountOut / amountIn
      : null;

  const avgPriceDisplay =
    avgPrice != null
      ? `${avgPrice.toFixed(4)} ${selectedCollateral?.symbol ?? ''}`
      : '—';

  const mapTokenToIndex = React.useCallback(
    (token: Token): number => {
      const addr = token.address.toLowerCase();
      const idx = outcomeTokens.findIndex(
        (t) => t.address.toLowerCase() === addr
      );
      return idx >= 0 ? idx : 0;
    },
    [outcomeTokens]
  );

  const handleSelectOutcome = React.useCallback(
    (token: Token) => {
      setOutcomeIndex(mapTokenToIndex(token));
    },
    [mapTokenToIndex]
  );

  const handleApprove = React.useCallback(async () => {
    if (!missingApprovals[0]) return;
    const a = missingApprovals[0];
    await approveTokensMutation.mutateAsync({
      tokenAddress: a.address,
      spender: a.spender,
      amount: a.amount,
      chainId: market.chainId,
    });
  }, [approveTokensMutation, missingApprovals, market.chainId]);

  const canSubmit =
    !isDisabled &&
    !insufficientBalance &&
    !isTradePending &&
    !!account &&
    !!quoteData?.trade &&
    !isApprovalLoading;

  const handleSwitchNetwork = React.useCallback(
    () => switchChain({ chainId: market.chainId }),
    [switchChain, market.chainId]
  );

  const sellTokenSymbol = sellToken?.symbol ?? undefined;
  const collateralSymbol = selectedCollateral?.symbol ?? 'sDAI';

  const onFormSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!account || !quoteData?.trade || insufficientBalance || isTradePending)
        return;
      try {
        await executeTrade({
          trade: quoteData.trade,
          account,
          isBuyExactOutputNative: false,
          isSellToNative: false,
          isSeerCredits: isSeerCreditsCollateral,
        });
      } catch (err) {
        console.error('Trade failed:', err);
      }
    },
    [
      account,
      quoteData?.trade,
      insufficientBalance,
      isTradePending,
      executeTrade,
      isSeerCreditsCollateral,
    ]
  );

  const submitLabel = (() => {
    if (isTradePending) return 'Executing…';
    if (!account) return 'Connect wallet to trade';
    if (isDisabled) return 'No liquidity';
    if (!amount || Number(amount) <= 0) return 'Enter an amount';
    if (quoteIsLoading) return 'Getting quote…';
    if (quoteError) return 'Quote unavailable';
    if (insufficientBalance) return 'Insufficient balance';
    if (!quoteData?.trade) return 'Enter an amount';
    return 'Place Trade';
  })();

  const amountLabel = mode === 'buy' ? 'Amount' : 'Shares';
  const receiveLabel = mode === 'buy' ? 'You receive' : 'You get';

  return (
    <div
      className={`lot-panel p-6 md:p-8 ${isDisabled ? 'opacity-90' : ''}`}
    >
      <div className="mb-5 flex justify-start border-b border-edge">
        <div className="flex" role="group" aria-label="Trade mode">
          <button
            type="button"
            onClick={() => setTradeMode('buy')}
            className={`relative -mb-px px-4 pb-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up ${
              mode === 'buy'
                ? 'border-b-2 border-up text-up'
                : 'border-b-2 border-transparent text-muted hover:text-paper'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setTradeMode('sell')}
            className={`relative -mb-px px-4 pb-3 text-xs font-semibold uppercase tracking-[0.08em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up ${
              mode === 'sell'
                ? 'border-b-2 border-up text-up'
                : 'border-b-2 border-transparent text-muted hover:text-paper'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      {isDisabled && (
        <p
          role="status"
          className="mb-4 border-y border-down/35 py-3 text-xs leading-relaxed text-paper"
        >
          This outcome lacks enough liquidity to trade right now.
        </p>
      )}
      {insufficientBalance && !isDisabled && (
        <p
          role="status"
          className="mb-4 border-y border-down/45 py-3 text-xs leading-relaxed text-down"
        >
          Insufficient balance. You need more{' '}
          {sellTokenSymbol ?? 'tokens'} to complete this trade.
        </p>
      )}

      <form className="space-y-5" onSubmit={onFormSubmit}>
        <div className="flex flex-col gap-2">
          <label className={labelClass}>Outcome</label>
          {outcomeToken ? (
            <TokensDropdown
              layout="block"
              options={outcomeOptions}
              value={outcomeToken}
              onSelect={handleSelectOutcome}
            />
          ) : (
            <div className="rounded-panel border border-edge bg-wall px-4 py-3 text-sm text-muted">
              No outcomes
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="trade-amount" className={labelClass}>
              {amountLabel}
            </label>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-paper">
              Bal: {payBalance}
            </span>
          </div>
          <div className="relative">
            <input
              id="trade-amount"
              type="number"
              placeholder="0.00"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isDisabled}
              className={amountInputClass}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              {mode === 'buy' ? collateralSymbol : outcomeToken?.symbol ?? 'Shares'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {mode === 'buy'
              ? BUY_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => addBuyAmount(n)}
                    disabled={isDisabled}
                    className={presetBtnClass}
                  >
                    +{n}
                  </button>
                ))
              : SELL_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setAmountToPercent(p.pct)}
                    disabled={isDisabled || payBalanceHuman <= 0}
                    className={presetBtnClass}
                  >
                    {p.label}
                  </button>
                ))}
          </div>
        </div>

        {quoteError && Number(amount) > 0 && (
          <p className="text-xs text-down">
            {quoteError.message === 'No route found'
              ? 'Not enough liquidity. Try a smaller amount.'
              : quoteError.message}
          </p>
        )}

        <div className="flex flex-col gap-2.5 border-t border-edge pt-4">
          <div className="flex justify-between gap-3">
            <span className={labelClass}>{receiveLabel}</span>
            <span className="font-mono text-sm font-semibold text-paper">
              {quoteIsLoading && Number(amount) > 0 ? '…' : displayReceiveAmount}{' '}
              <span className="text-muted">
                {mode === 'buy'
                  ? outcomeToken?.symbol ?? ''
                  : collateralSymbol}
              </span>
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className={labelClass}>Avg price</span>
            <span className="font-mono text-sm font-semibold text-paper">
              {avgPriceDisplay}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className={labelClass}>Slippage</span>
            <span className="font-mono text-sm font-semibold text-paper">
              0.5%
            </span>
          </div>
        </div>

        {!account ? (
          <ConnectKitButton.Custom>
            {({ show }: { show?: () => void }) => (
              <button
                type="button"
                onClick={() => show?.()}
                className={primaryBtnClass}
              >
                Connect wallet to trade
              </button>
            )}
          </ConnectKitButton.Custom>
        ) : isWrongChain ? (
          <button
            type="button"
            onClick={handleSwitchNetwork}
            disabled={isSwitchPending}
            className={warnBtnClass}
          >
            {isSwitchPending ? 'Switching…' : 'Change network'}
          </button>
        ) : !insufficientBalance && needsTokenApproval ? (
          <button
            type="button"
            onClick={() => {
              void handleApprove();
            }}
            disabled={approveTokensMutation.isPending || isApprovalLoading}
            className={warnBtnClass}
          >
            {approveTokensMutation.isPending || isApprovalLoading
              ? 'Approving…'
              : 'Approve'}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSubmit}
            className={primaryBtnClass}
          >
            {submitLabel}
          </button>
        )}
      </form>
    </div>
  );
}

export default SwapWidget;
