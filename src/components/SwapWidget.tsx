import * as React from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { formatUnits, isAddressEqual, zeroAddress } from 'viem';
import type { Market, Token } from '@seer-pm/sdk';
import {
  TradeType,
  isTradingCredits,
  getMaximumAmountIn,
  WRAPPED_OUTCOME_TOKEN_DECIMALS,
  getActiveCollateralProfile,
  getActiveCreditsTokenAddress,
  getActiveCreditsManagerAddress,
  getActiveCreditsSymbol,
  getTradeTokenIn,
  hasTradingCredits,
  countCompleteSetBatches,
  type MintToCoverStatus,
} from '@seer-pm/sdk';
import {
  useCheck7702Support,
  useMarket,
  useMarketHasLiquidity,
  useParentMarkets,
  useQuoteTrade,
  useTokenBalance,
  useTokenInfo,
  useTrade,
  useApproveTokens,
} from '@seer-pm/react';
import { ConnectKitButton } from 'connectkit';
import { useMintToCover } from '../hooks/useMintToCover';
import { useSmartWalletPreference } from '../hooks/useSmartWalletPreference';
import type { ChainedMarketData } from '../lib/chainedMarket';
import { toastifyTx } from '../lib/toastify';
import { TokensDropdown } from './TokensDropdown';
import { TradeNotice } from './TradeNotice';
import { SmartWalletSwitch } from './SmartWalletSwitch';
import { labelClass, primaryBtnClass, warnBtnClass } from './tradeStyles';

const amountFieldClass =
  'flex w-full items-center gap-3 rounded-panel border border-edge bg-wall px-4 py-3 transition-colors focus-within:border-up has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-up';

const amountInputClass =
  'min-w-0 flex-1 bg-transparent text-xl font-semibold tabular-nums text-paper caret-up placeholder:text-muted focus:outline-none';

const amountUnitClass =
  'max-w-[45%] flex-shrink-0 truncate text-xs font-semibold uppercase tracking-[0.08em] text-muted';

const presetBtnClass =
  'rounded-control border border-edge bg-wall px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted transition-colors hover:border-paper/25 hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-up disabled:cursor-not-allowed disabled:opacity-40';

const BUY_PRESETS = [1, 5, 10, 100] as const;
const SELL_PRESETS = [
  { label: '25%', pct: 25 },
  { label: '50%', pct: 50 },
  { label: '75%', pct: 75 },
  { label: 'Max', pct: 100 },
] as const;

export interface SwapWidgetProps {
  readonly market: Market;
  /** Set when `market` flattens chained markets (root → child → …). */
  readonly chained?: ChainedMarketData;
  readonly outcomeIndex: number;
  readonly onOutcomeIndexChange: (index: number) => void;
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

function getCollateralOptions(
  market: Market,
  mode: 'buy' | 'sell',
  parentCollateral?: Token
): Token[] {
  const parentId = market.parentMarket.id;
  const hasParent =
    typeof parentId === 'string' &&
    !isAddressEqual(parentId, zeroAddress) &&
    parentCollateral;

  if (hasParent && parentCollateral) {
    return [parentCollateral];
  }

  const profile = getActiveCollateralProfile(market.chainId);
  const options: Token[] = [profile.primary];

  if (profile.secondary) {
    options.push(profile.secondary);
  }

  if (profile.secondary?.wrapped) {
    options.push(profile.secondary.wrapped);
  }

  if (profile.swap) {
    options.push(...profile.swap);
  }

  // Trading credits can only be used when buying (pay with credits), not as receive collateral
  if (mode === 'buy' && hasTradingCredits(market.chainId)) {
    const creditsAddress = getActiveCreditsTokenAddress(market.chainId);
    if (creditsAddress) {
      options.push({
        address: creditsAddress,
        chainId: market.chainId,
        symbol: getActiveCreditsSymbol(),
        decimals: 18,
      });
    }
  }

  return options;
}

function formatShares(value: bigint): string {
  return Number(
    formatUnits(value, WRAPPED_OUTCOME_TOKEN_DECIMALS)
  ).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

interface MintToCoverNoticeProps {
  status: MintToCoverStatus;
  collateralSymbol: string;
  outcomeBalance: bigint;
  supports7702: boolean;
}

/**
 * Explains a sell bigger than the shares held: the shortfall is minted as a
 * full set and the other outcomes stay in the wallet, so the user is short
 * the outcome they sell.
 */
function MintToCoverNotice({
  status,
  collateralSymbol,
  outcomeBalance,
  supports7702,
}: MintToCoverNoticeProps) {
  if (status.kind === 'insufficientCollateral') {
    return (
      <TradeNotice title="Insufficient balance" className="mb-5">
        You don't hold enough shares to sell that much. Add{' '}
        {formatShares(status.splitAmount - status.collateralBalance)}{' '}
        {collateralSymbol} and we can mint the difference for you.
      </TradeNotice>
    );
  }
  if (status.kind === 'splitTooLarge') {
    return (
      <TradeNotice title="Insufficient balance" className="mb-5">
        You don't hold enough shares to sell that much, and{' '}
        {status.isParent ? 'a parent market' : 'this market'} has{' '}
        {status.outcomeCount} outcomes, more than the{' '}
        {status.maxOutcomeCount} a single transaction can mint. Sell what you
        hold, or buy first.
      </TradeNotice>
    );
  }
  if (status.kind !== 'ready' || !status.quote.completeSetLeg) return null;

  const leg = status.quote.completeSetLeg;
  const splitAmount = leg.splitAmount ?? 0n;
  const batches = supports7702 ? countCompleteSetBatches(leg) : 0;
  const risk = !supports7702
    ? ' This runs as separate transactions; if the sell fails you keep the minted set.'
    : batches > 1
      ? ` This runs as ${batches} transactions; if one fails after the first you keep the sets already minted.`
      : '';

  return (
    <TradeNotice tone="info" title="We'll mint the rest" className="mb-5">
      You hold {formatShares(outcomeBalance)} shares.{' '}
      {formatShares(splitAmount)} {collateralSymbol} will be minted into a
      full set so you can sell {formatShares(leg.swapInputAmount ?? 0n)}, and
      you'll keep {formatShares(splitAmount)} of each other outcome.
      {risk}
    </TradeNotice>
  );
}

export function SwapWidget({
  market,
  chained,
  outcomeIndex,
  onOutcomeIndexChange,
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
  const [amount, setAmount] = React.useState('');
  const [collateralAddress, setCollateralAddress] = React.useState<
    string | null
  >(null);

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

  const collateralOptions = React.useMemo(
    () => getCollateralOptions(market, mode, parentCollateral),
    [market, mode, parentCollateral]
  );

  const selectedCollateral = React.useMemo(() => {
    if (collateralOptions.length === 0) {
      return getActiveCollateralProfile(market.chainId).primary;
    }
    if (collateralAddress) {
      const match = collateralOptions.find((token) =>
        isAddressEqual(
          token.address,
          collateralAddress as `0x${string}`
        )
      );
      if (match) return match;
    }
    return collateralOptions[0];
  }, [collateralOptions, collateralAddress, market.chainId]);

  React.useEffect(() => {
    setCollateralAddress(null);
    setAmount('');
  }, [market.id, market.chainId]);

  // Drop trading credits (and any other mode-gated token) when leaving buy mode
  React.useEffect(() => {
    if (!collateralAddress) return;
    const stillValid = collateralOptions.some((token) =>
      isAddressEqual(token.address, collateralAddress as `0x${string}`)
    );
    if (!stillValid) {
      setCollateralAddress(null);
    }
  }, [collateralOptions, collateralAddress]);

  const canChooseCollateral = collateralOptions.length > 1;

  const debouncedAmount = useDebounce(amount, 500);

  const safeOutcomeIndex =
    outcomeTokens.length === 0
      ? 0
      : Math.min(Math.max(outcomeIndex, 0), outcomeTokens.length - 1);

  const outcomeToken =
    outcomeTokens[safeOutcomeIndex] ?? outcomeTokens[0];

  const hasLiquidity = useMarketHasLiquidity(market, safeOutcomeIndex);

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
    market,
    safeOutcomeIndex
  );

  const requiredAmount = quoteData?.trade
    ? getMaximumAmountIn(quoteData.trade)
    : 0n;

  const { data: parentMarkets } = useParentMarkets(market);

  // A flattened chained market is not on-chain: minting has to split the real
  // level that holds the outcome, through every level above it from the root.
  const mintTarget = React.useMemo(() => {
    const row = chained?.rows[safeOutcomeIndex];
    const level = row ? chained?.levels[row.level] : undefined;
    if (!chained || !row || !level) {
      return { market, parentMarkets, outcomeIndex: safeOutcomeIndex };
    }
    return {
      market: level,
      parentMarkets: chained.levels.slice(0, row.level),
      outcomeIndex: row.outcomeIndex,
    };
  }, [chained, market, parentMarkets, safeOutcomeIndex]);

  // In sell mode `balance` is the outcome's, so the collateral needs its own.
  const { data: collateralBalance = 0n } = useTokenBalance(
    account,
    mode === 'sell' ? selectedCollateral.address : undefined,
    market.chainId
  );

  const mintToCover = useMintToCover({
    market: mintTarget.market,
    parentMarkets: mintTarget.parentMarkets,
    outcomeIndex: mintTarget.outcomeIndex,
    selectedCollateral,
    swapType: mode,
    account,
    amount: amountForQuote,
    outcomeBalance: balance,
    collateralBalance,
    quoteData,
  });
  const isMintToCover = mintToCover.kind === 'ready';
  const mintToCoverBlocked =
    mintToCover.kind === 'insufficientCollateral' ||
    mintToCover.kind === 'splitTooLarge';

  // Everything downstream of the quote (approvals, execution) must see the
  // composite mint + sell route, not the plain sell it was derived from.
  const effectiveQuote =
    mintToCover.kind === 'ready' ? mintToCover.quote : quoteData;
  const completeSetLeg = effectiveQuote?.completeSetLeg;

  const insufficientBalance =
    !!quoteData?.trade &&
    requiredAmount > 0n &&
    balance < requiredAmount &&
    mintToCover.kind === 'off';

  const isTradingCreditsCollateral = selectedCollateral
    ? isTradingCredits(market.chainId, selectedCollateral.address)
    : false;

  // Credits trades are funded by the credits manager's own collateral balance,
  // so the swap reverts if the manager can't cover the trade's input amount.
  const creditsManagerAddress = isTradingCreditsCollateral
    ? getActiveCreditsManagerAddress(market.chainId)
    : undefined;
  const tradeTokenIn = quoteData?.trade
    ? getTradeTokenIn(quoteData.trade)
    : undefined;

  const { data: creditsManagerBalance } = useTokenBalance(
    creditsManagerAddress,
    tradeTokenIn?.address as `0x${string}` | undefined,
    market.chainId
  );

  const insufficientCreditsLiquidity =
    isTradingCreditsCollateral &&
    !!quoteData?.trade &&
    requiredAmount > 0n &&
    creditsManagerBalance !== undefined &&
    creditsManagerBalance < requiredAmount;

  const creditsAvailable =
    creditsManagerBalance !== undefined && tradeTokenIn
      ? Number(formatUnits(creditsManagerBalance, tradeTokenIn.decimals))
      : 0;

  const creditsAvailableDisplay = (
    Math.floor(creditsAvailable * 100) / 100
  ).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [useSmartWallet, setUseSmartWallet] = useSmartWalletPreference();
  const walletSupports7702 = useCheck7702Support(true);
  const supports7702 = walletSupports7702 && useSmartWallet;

  // With a smart wallet the approvals ride inside the batch, so `approvals`
  // comes back empty; credits trades need none either.
  const {
    tradeTokens,
    approvals: { data: missingApprovals = [], isLoading: isApprovalLoading },
  } = useTrade(
    account,
    effectiveQuote?.trade,
    isTradingCreditsCollateral,
    () => {
      setAmount('');
    },
    supports7702,
    toastifyTx,
    market,
    effectiveQuote?.psm3Leg,
    completeSetLeg
  );

  const needsTokenApproval =
    !isTradingCreditsCollateral && missingApprovals.length > 0;

  const approveTokensMutation = useApproveTokens(toastifyTx);

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
  }, []);

  const selectCollateral = React.useCallback((token: Token) => {
    setCollateralAddress(token.address);
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
      onOutcomeIndexChange(mapTokenToIndex(token));
    },
    [mapTokenToIndex, onOutcomeIndexChange]
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
    !mintToCoverBlocked &&
    !insufficientCreditsLiquidity &&
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
      if (
        !account ||
        !effectiveQuote?.trade ||
        insufficientBalance ||
        mintToCoverBlocked ||
        insufficientCreditsLiquidity ||
        isTradePending
      )
        return;
      try {
        // The mutation executes the props it receives, so the legs must ride
        // along or a PSM3 / mint + sell route would run as a plain swap.
        await executeTrade({
          trade: effectiveQuote.trade,
          account,
          isTradingCredits: isTradingCreditsCollateral,
          psm3Leg: effectiveQuote.psm3Leg,
          completeSetLeg: effectiveQuote.completeSetLeg,
        });
      } catch (err) {
        console.error('Trade failed:', err);
      }
    },
    [
      account,
      effectiveQuote,
      insufficientBalance,
      mintToCoverBlocked,
      insufficientCreditsLiquidity,
      isTradePending,
      executeTrade,
      isTradingCreditsCollateral,
    ]
  );

  const submitLabel = (() => {
    if (isTradePending) return 'Executing…';
    if (!account) return 'Connect wallet to trade';
    if (isDisabled) return 'No liquidity';
    if (!amount || Number(amount) <= 0) return 'Enter an amount';
    if (quoteIsLoading) return 'Getting quote…';
    if (quoteError) return 'Quote unavailable';
    if (insufficientBalance || mintToCoverBlocked) return 'Insufficient balance';
    if (insufficientCreditsLiquidity) return 'Credits unavailable';
    if (!quoteData?.trade) return 'Enter an amount';
    if (isMintToCover) return 'Mint & Sell';
    return 'Place Trade';
  })();

  const amountHasProblem =
    !isDisabled &&
    (insufficientBalance ||
      mintToCoverBlocked ||
      insufficientCreditsLiquidity ||
      (!!quoteError && Number(amount) > 0));

  const amountLabel = mode === 'buy' ? 'Amount' : 'Shares';
  const receiveLabel = mode === 'buy' ? 'You receive' : 'You get';

  // Outcome names run long, so the field and summary denominate in the short
  // unit and leave the outcome's identity to the Outcome picker above.
  const amountUnit = mode === 'buy' ? collateralSymbol : 'Shares';
  const receiveUnit = mode === 'buy' ? 'Shares' : collateralSymbol;

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
        <TradeNotice title="No liquidity" className="mb-5">
          This outcome lacks enough liquidity to trade right now.
        </TradeNotice>
      )}
      {insufficientBalance && !isDisabled && (
        <TradeNotice title="Insufficient balance" className="mb-5">
          You need more {sellTokenSymbol ?? 'tokens'} to complete this trade.
        </TradeNotice>
      )}
      {!isDisabled && (
        <MintToCoverNotice
          status={mintToCover}
          collateralSymbol={collateralSymbol}
          outcomeBalance={balance}
          supports7702={supports7702}
        />
      )}
      {insufficientCreditsLiquidity && !isDisabled && !insufficientBalance && (
        <TradeNotice title="Credits unavailable" className="mb-5">
          {creditsAvailable < 0.01
            ? "Credits can't be used right now: there aren't enough funds backing them. Pay with another token."
            : `Credits can cover up to ${creditsAvailableDisplay} ${collateralSymbol} right now. Lower the amount or pay with another token.`}
        </TradeNotice>
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

        {canChooseCollateral ? (
          <div className="flex flex-col gap-2">
            <label className={labelClass} id="collateral-label">
              {mode === 'buy' ? 'Pay with' : 'Receive as'}
            </label>
            <TokensDropdown
              layout="block"
              options={collateralOptions}
              value={selectedCollateral}
              onSelect={selectCollateral}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between gap-3">
            <label htmlFor="trade-amount" className={labelClass}>
              {amountLabel}
            </label>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-paper">
              Bal: {payBalance}
            </span>
          </div>
          <div
            className={`${amountFieldClass} ${isDisabled ? 'opacity-60' : ''} ${
              amountHasProblem ? '!border-down/50 focus-within:!border-down' : ''
            }`}
          >
            <input
              id="trade-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isDisabled}
              className={amountInputClass}
            />
            <span className={amountUnitClass} title={amountUnit}>
              {amountUnit}
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
          <TradeNotice
            title={
              quoteError.message === 'No route found'
                ? 'Not enough liquidity'
                : 'Quote unavailable'
            }
          >
            {quoteError.message === 'No route found'
              ? 'Try a smaller amount.'
              : quoteError.message}
          </TradeNotice>
        )}

        <div className="flex flex-col gap-2.5 border-t border-edge pt-4">
          <div className="flex justify-between gap-3">
            <span className={labelClass}>{receiveLabel}</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-paper">
              {quoteIsLoading && Number(amount) > 0 ? '…' : displayReceiveAmount}{' '}
              <span className="text-muted">{receiveUnit}</span>
            </span>
          </div>
          {isMintToCover && completeSetLeg?.leftoverTokens?.length ? (
            <div className="flex justify-between gap-3">
              <span className={labelClass}>You keep</span>
              <span
                className="text-right text-sm font-semibold text-paper"
                title={completeSetLeg.leftoverTokens
                  .map((l) => l.token.symbol)
                  .join(', ')}
              >
                <span className="font-mono tabular-nums">
                  {formatShares(completeSetLeg.splitAmount ?? 0n)}
                </span>{' '}
                <span className="text-muted">
                  of each other outcome (
                  {completeSetLeg.leftoverTokens.length})
                </span>
              </span>
            </div>
          ) : null}
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
          {account && walletSupports7702 ? (
            <SmartWalletSwitch
              enabled={useSmartWallet}
              onChange={setUseSmartWallet}
            />
          ) : null}
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
        ) : !insufficientBalance && !mintToCoverBlocked && needsTokenApproval ? (
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
