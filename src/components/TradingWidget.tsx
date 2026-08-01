import * as React from 'react';
import type { Market } from '@seer-pm/sdk';
import { SwapWidget } from './SwapWidget';

export interface TradingWidgetProps {
  readonly className?: string;
  readonly market: Market;
}

export const TradingWidget: React.FC<TradingWidgetProps> = ({
  className = '',
  market,
}) => {
  return (
    <aside
      id="trade"
      className={className}
      data-purpose="trading-interface"
    >
      <SwapWidget market={market} />
    </aside>
  );
};

export default TradingWidget;
