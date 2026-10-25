import {
  useMarketChartData,
  type ChartData,
} from '../../hooks/chart/useChartData';
import {
  INVALID_RESULT_OUTCOME_TEXT,
  type Market,
  MarketTypes,
  getMarketType,
} from '@seer-pm/sdk';
import { format } from 'date-fns';
import {
  LineSeries,
  LineStyle,
  createChart,
  type UTCTimestamp,
  type IChartApi,
  type ISeriesApi,
  type IRange,
  type Time,
} from 'lightweight-charts';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import Legend from './Legend';

export interface IOutcomeData {
  outcome: { name: string };
  data: Array<{ time: UTCTimestamp; value: number }>;
}

function getSeries(market: Market, chartData: ChartData['chartData']) {
  if (market.type === 'Futarchy') {
    return chartData
      .map((x, index) => ({
        ...x,
        data: x.data,
        originalIndex: index,
      }))
      .sort(
        (a, b) => b.data[b.data.length - 1][1] - a.data[a.data.length - 1][1],
      );
  }

  if (getMarketType(market) === MarketTypes.SCALAR) {
    return chartData;
  }

  return chartData
    .filter((x) => x.name !== INVALID_RESULT_OUTCOME_TEXT)
    .sort(
      (a, b) => b.data[b.data.length - 1][1] - a.data[a.data.length - 1][1],
    );
}

function getFilteredSeries(market: Market, chartData: ChartData['chartData']) {
  const rawSeries = getSeries(market, chartData);
  if (!rawSeries.length) return rawSeries;

  let validStartIndex = 0;
  const dataLength = rawSeries[0].data.length;

  for (let i = 0; i < dataLength; i++) {
    const hasExtreme = rawSeries.some((series) => {
      const value = series.data[i]?.[1] ?? 0;
      return value > 99.9 || value < 0.1;
    });

    if (!hasExtreme && i > 0) {
      validStartIndex = i;
      break;
    }
  }

  if (validStartIndex > 0) {
    return rawSeries.map((series) => ({
      ...series,
      data: series.data.slice(validStartIndex),
    }));
  }

  return rawSeries;
}

export default function MarketChart({ market }: { market: Market }) {
  const { data, isPending: isPendingChart } = useMarketChartData(market);
  const chartData = data?.chartData;
  const series = useMemo(
    () =>
      getFilteredSeries(market, chartData ?? []).map((item) => ({
        outcome: { name: item.name },
        data: item.data.map(([time, value]) => ({
          time: time as UTCTimestamp,
          value,
        })),
      })),
    [market, chartData],
  );
  return (
    <div className="min-w-0 w-full">
      {isPendingChart ? (
        <div
          role="status"
          aria-label="Loading price history"
          className="h-[300px] animate-pulse rounded-panel bg-wall"
        />
      ) : series.length ? (
        <LightweightChart key={market.id} series={series} market={market} />
      ) : (
        <p className="text-sm text-muted">No chart data.</p>
      )}
    </div>
  );
}

function readChartColors() {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string) => css.getPropertyValue(`--seer-${name}`).trim();
  return {
    muted: read('muted'),
    text: read('text'),
    surface: read('surface'),
    border: read('border'),
    font: read('font-sans'),
    series: [1, 2, 3, 4].map((n) => read(`series-${n}`)),
  };
}

function LightweightChart({
  series,
  market,
}: {
  series: IOutcomeData[];
  market: Market;
}) {
  const { theme } = useTheme();
  // Slots belong to names, so sorting or unfollowing a peer never recolors a survivor.
  const [followed, setFollowed] = useState<Array<string | null>>(() => {
    const initial =
      series.length <= 4
        ? [...series].sort(
            (a, b) =>
              market.outcomes.indexOf(a.outcome.name) -
              market.outcomes.indexOf(b.outcome.name),
          )
        : series;
    return Array.from(
      { length: 4 },
      (_, i) => initial[i]?.outcome.name ?? null,
    );
  });
  const currentFollowed = followed.map((name) =>
    series.some((item) => item.outcome.name === name) ? name : null,
  );
  const followedKey = JSON.stringify(currentFollowed);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineRefs = useRef<Array<{ name: string; line: ISeriesApi<'Line'> }>>(
    [],
  );
  const rangeRef = useRef<IRange<Time> | null>(null);
  const [tooltip, setTooltip] = useState<{
    time: UTCTimestamp;
    values: Array<{ name: string; value: number; slot: number }>;
  } | null>(null);

  const toggle = (name: string) => {
    setFollowed(() => {
      const next = [...currentFollowed];
      const slot = next.indexOf(name);
      if (slot >= 0) next[slot] = null;
      else {
        const free = next.indexOf(null);
        if (free < 0) return followed;
        next[free] = name;
      }
      return next;
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const colors = readChartColors();
    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 300,
      layout: {
        background: { color: 'transparent' },
        textColor: colors.muted,
        fontFamily: colors.font,
      },
      rightPriceScale: { borderVisible: false },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        minBarSpacing: 0.001,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.border, style: LineStyle.SparseDotted },
      },
      crosshair: {
        vertLine: { color: colors.muted, labelBackgroundColor: colors.surface },
        horzLine: { color: colors.muted, labelBackgroundColor: colors.surface },
      },
    });
    chartRef.current = chart;
    const slots: Array<string | null> = JSON.parse(followedKey);
    // Context is drawn first so the four followed lines remain above it.
    lineRefs.current = [...series]
      .sort(
        (a, b) =>
          Number(slots.includes(a.outcome.name)) -
          Number(slots.includes(b.outcome.name)),
      )
      .map((item) => {
        const slot = slots.indexOf(item.outcome.name);
        const line = chart.addSeries(LineSeries, {
          color: slot < 0 ? colors.muted : colors.series[slot],
          lineWidth: slot < 0 ? 1 : 2,
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: slot >= 0,
          priceFormat: {
            type: 'price',
            precision: market.type === 'Futarchy' ? 3 : 2,
            minMove: 0.001,
          },
        });
        line.setData(item.data);
        return { name: item.outcome.name, line };
      });
    if (rangeRef.current) chart.timeScale().setVisibleRange(rangeRef.current);
    else chart.timeScale().fitContent();
    chart.subscribeCrosshairMove((event) => {
      if (
        !event.time ||
        !event.point ||
        event.point.x < 0 ||
        event.point.y < 0
      ) {
        setTooltip(null);
        return;
      }
      const values = lineRefs.current.flatMap(({ name, line }) => {
        const slot = slots.indexOf(name);
        const point = event.seriesData.get(line);
        return slot >= 0 && point && 'value' in point
          ? [{ name, value: point.value, slot }]
          : [];
      });
      setTooltip(
        values.length ? { time: event.time as UTCTimestamp, values } : null,
      );
    });
    return () => {
      // Read after the chart has painted, rather than synchronously after fitContent().
      rangeRef.current = chart.timeScale().getVisibleRange();
      chart.remove();
      chartRef.current = null;
      lineRefs.current = [];
    };
  }, [series, followedKey, market.type]);

  useEffect(() => {
    const colors = readChartColors();
    chartRef.current?.applyOptions({
      layout: { textColor: colors.muted, fontFamily: colors.font },
      grid: { horzLines: { color: colors.border } },
      crosshair: {
        vertLine: { color: colors.muted, labelBackgroundColor: colors.surface },
        horzLine: { color: colors.muted, labelBackgroundColor: colors.surface },
      },
    });
    const slots: Array<string | null> = JSON.parse(followedKey);
    lineRefs.current.forEach(({ name, line }) => {
      const slot = slots.indexOf(name);
      line.applyOptions({
        color: slot < 0 ? colors.muted : colors.series[slot],
      });
    });
  }, [theme, series, followedKey]);

  return (
    <div className="min-w-0">
      <Legend
        outcomesData={series}
        followed={currentFollowed}
        onToggleOutcome={toggle}
        market={market}
      />
      <div
        ref={containerRef}
        className="mt-4"
        aria-label="Outcome price history"
      />
      <div className="mt-3 min-h-6 text-sm text-muted" aria-live="off">
        {tooltip ? (
          <>
            <p>{format(new Date(tooltip.time * 1000), 'MMM d, yyyy HH:mm')}</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {tooltip.values.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: `var(--seer-series-${item.slot + 1})`,
                    }}
                  />
                  <span>{item.name}</span>
                  <strong className="text-paper">
                    {item.value.toFixed(market.type === 'Futarchy' ? 3 : 2)}%
                  </strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Hover or touch the chart to inspect prices.</p>
        )}
      </div>
    </div>
  );
}
