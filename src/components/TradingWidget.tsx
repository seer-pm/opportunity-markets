import * as React from 'react';
import type { Market } from '@seer-pm/sdk';
import { SwapWidget } from './SwapWidget';

export interface TradingWidgetProps {
  readonly className?: string;
  readonly market: Market;
  readonly outcomeIndex: number;
  readonly onOutcomeIndexChange: (index: number) => void;
}

export const TradingWidget: React.FC<TradingWidgetProps> = ({
  className = '',
  market,
  outcomeIndex,
  onOutcomeIndexChange,
}) => {
  return (
    <aside
      id="trade"
      className={className}
      data-purpose="trading-interface"
    >
      <SwapWidget
        market={market}
        outcomeIndex={outcomeIndex}
        onOutcomeIndexChange={onOutcomeIndexChange}
      />
    </aside>
  );
};

export default TradingWidget;
