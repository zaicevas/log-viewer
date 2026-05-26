"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { bucket } from "@/features/logs/lib/bucket";
import {
  isChartDatum,
  type ChartDatum,
} from "@/features/logs/lib/chart-datum";
import type { NormalizedLog } from "@/features/logs/api/normalize";
import {
  formatRange,
  makeFormatTime,
  pluralize,
} from "@/shared/lib/format";

type Props = {
  logs: NormalizedLog[];
};

export function Histogram({ logs }: Props) {
  const buckets = bucket(logs);
  const first = buckets[0];
  const last = buckets[buckets.length - 1];
  const spansMultipleDays =
    !!first &&
    !!last &&
    new Date(first.binStart).getUTCDate() !==
      new Date(last.binEnd - 1).getUTCDate();
  const formatTime = makeFormatTime(spansMultipleDays);

  const chartDatum: ChartDatum[] = buckets.map((bucket) => ({
    label: formatTime(bucket.binStart),
    count: bucket.count,
    binStart: bucket.binStart,
    binEnd: bucket.binEnd,
  }));

  if (chartDatum.length === 0) {
    return (
      <div
        data-testid="histogram__empty"
        className="border-hairline flex h-64 items-center justify-center rounded-lg border border-dashed"
      >
        <p className="text-muted-foreground font-mono text-xs">
          No data to chart
        </p>
      </div>
    );
  }

  const totalCount = chartDatum.reduce((acc, datum) => acc + datum.count, 0);

  return (
    <div
      data-testid="histogram"
      className="border-hairline bg-surface-raised h-64 w-full rounded-lg border p-3"
      role="img"
      aria-label={`Histogram of ${pluralize(totalCount, "log")} across ${pluralize(chartDatum.length, "time bucket")}`}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        // Remove once recharts > 3.8.1 ships with the upstream fix:
        // https://github.com/recharts/recharts/pull/7174
        initialDimension={{ width: 1, height: 1 }}
      >
        <BarChart
          accessibilityLayer
          data={chartDatum}
          margin={{
            top: 4,
            right: spansMultipleDays ? 44 : 24,
            bottom: 0,
            left: 0,
          }}
          barCategoryGap={2}
        >
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={spansMultipleDays ? 80 : 48}
            padding={{ left: 16, right: 0 }}
            tick={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fill: "var(--color-muted-foreground)",
            }}
            stroke="var(--color-hairline)"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              fill: "var(--color-muted-foreground)",
            }}
            stroke="var(--color-hairline)"
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "var(--color-foreground)", opacity: 0.08 }}
            separator=""
            contentStyle={{
              backgroundColor: "var(--color-popover)",
              border: "1px solid var(--color-hairline)",
              borderRadius: "0.375rem",
              padding: "0.5rem 0.75rem",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-popover-foreground)",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.15)",
            }}
            labelStyle={{
              color: "var(--color-muted-foreground)",
              marginBottom: 4,
            }}
            itemStyle={{ color: "var(--color-foreground)" }}
            labelFormatter={(_label, payload) => {
              const item: unknown = payload[0]?.payload;
              if (!isChartDatum(item)) return "";
              return formatRange(item.binStart, item.binEnd);
            }}
            formatter={(value) => [String(value), ""]}
          />
          <Bar
            dataKey="count"
            fill="var(--color-primary)"
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
            activeBar={{
              fill: "color-mix(in srgb, var(--color-primary) 60%, white)",
              stroke: "var(--color-primary)",
              strokeWidth: 1,
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
