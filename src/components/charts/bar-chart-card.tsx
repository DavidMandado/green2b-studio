import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Datum = Record<string, string | number>;

function maxValue(data: Datum[], keys: string[]) {
  return Math.max(
    1,
    ...data.flatMap((row) =>
      keys
        .map((key) => row[key])
        .filter((value): value is number => typeof value === "number"),
    ),
  );
}

export function BarChartCard({
  title,
  description,
  data,
  dataKey,
  color = "#1f6a52",
  secondaryKey,
}: {
  title: string;
  description?: string;
  data: Datum[];
  dataKey: string;
  color?: string;
  secondaryKey?: string;
}) {
  const seriesKeys = secondaryKey ? [dataKey, secondaryKey] : [dataKey];
  const maximum = maxValue(data, seriesKeys);
  const chartHeight = 220;
  const leftPad = 50;
  const rightPad = 20;
  const bottomPad = 46;
  const chartWidth = 720;
  const rowWidth = (chartWidth - leftPad - rightPad) / Math.max(data.length, 1);
  const barGroupWidth = Math.max(20, rowWidth * 0.58);
  const singleBarWidth = secondaryKey ? barGroupWidth / 2 - 4 : barGroupWidth;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm muted-copy">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + bottomPad + 20}`}
            className="h-[300px] w-full min-w-[680px]"
            role="img"
            aria-label={title}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
              const y = 10 + chartHeight - chartHeight * fraction;
              const label = Math.round(maximum * fraction);

              return (
                <g key={fraction}>
                  <line x1={leftPad} y1={y} x2={chartWidth - rightPad} y2={y} stroke="#d7ddd1" strokeDasharray="4 4" />
                  <text x={leftPad - 10} y={y + 4} fontSize="12" textAnchor="end" fill="#667267">
                    {label}
                  </text>
                </g>
              );
            })}

            {data.map((entry, index) => {
              const primary = typeof entry[dataKey] === "number" ? (entry[dataKey] as number) : 0;
              const secondary = secondaryKey && typeof entry[secondaryKey] === "number" ? (entry[secondaryKey] as number) : null;
              const baseX = leftPad + index * rowWidth + (rowWidth - barGroupWidth) / 2;
              const primaryHeight = (primary / maximum) * chartHeight;
              const secondaryHeight = secondary !== null ? (secondary / maximum) * chartHeight : 0;

              return (
                <g key={`${String(entry.name)}-${index}`}>
                  <rect
                    x={baseX}
                    y={10 + chartHeight - primaryHeight}
                    width={singleBarWidth}
                    height={primaryHeight}
                    rx="12"
                    fill={typeof entry.fill === "string" ? (entry.fill as string) : color}
                  />
                  {secondary !== null ? (
                    <rect
                      x={baseX + singleBarWidth + 8}
                      y={10 + chartHeight - secondaryHeight}
                      width={singleBarWidth}
                      height={secondaryHeight}
                      rx="12"
                      fill="#d1a95b"
                    />
                  ) : null}
                  <text x={baseX + barGroupWidth / 2} y={chartHeight + 32} fontSize="12" textAnchor="middle" fill="#667267">
                    {String(entry.name)}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span>{dataKey}</span>
            </div>
            {secondaryKey ? (
              <div className="flex items-center gap-2">
                <span className={cn("h-3 w-3 rounded-full")} style={{ backgroundColor: "#d1a95b" }} />
                <span>{secondaryKey}</span>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
