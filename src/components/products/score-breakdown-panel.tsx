import type { ScoreResult } from "@/lib/scoring/engine";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

export function ScoreBreakdownPanel({ score }: { score: ScoreResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(score.pillars).map(([key, pillar]) => (
            <div key={key} className="rounded-3xl border border-[var(--border)] bg-white/80 p-4">
              <p className="text-sm font-semibold capitalize">{key}</p>
              <p className="mt-2 text-2xl font-semibold">{formatNumber(pillar.score)}</p>
              <p className="mt-1 text-xs muted-copy">
                Weight {pillar.weight}% · Contribution {formatNumber(pillar.contribution, 1)}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 rounded-[28px] bg-[var(--card-strong)] p-5 sm:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Raw Score</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(score.rawScore, 1)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Confidence</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(score.confidenceScore, 1)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Penalty</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(score.totalPenalty, 1)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Final</p>
            <p className="mt-2 text-2xl font-semibold">{formatNumber(score.finalScore, 1)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
