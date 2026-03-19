import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { DEFAULT_BENCHMARKS, DEFAULT_SCORING_CONFIG } from "@/lib/scoring/defaults";
import { scoringConfigSchema } from "@/lib/validation";

export async function PUT(request: Request) {
  const parsed = scoringConfigSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  await db.scoringConfig.upsert({
    where: { id: 1 },
    update: {
      pillarWeights: data.pillarWeights,
      gradeThresholds: data.gradeThresholds,
      missingDataPenalties: data.missingDataPenalties,
      rawWeight: data.rawWeight,
      confidenceWeight: data.confidenceWeight,
      notes: data.notes,
    },
    create: {
      id: 1,
      pillarWeights: data.pillarWeights,
      gradeThresholds: data.gradeThresholds,
      missingDataPenalties: data.missingDataPenalties,
      rawWeight: data.rawWeight,
      confidenceWeight: data.confidenceWeight,
      notes: data.notes,
    },
  });

  for (const benchmark of data.benchmarks) {
    await db.benchmark.upsert({
      where: { category: benchmark.category },
      update: {
        co2eBenchmark: benchmark.co2eBenchmark,
        waterBenchmark: benchmark.waterBenchmark,
      },
      create: benchmark,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await db.scoringConfig.upsert({
    where: { id: 1 },
    update: {
      pillarWeights: DEFAULT_SCORING_CONFIG.pillarWeights,
      gradeThresholds: DEFAULT_SCORING_CONFIG.gradeThresholds,
      missingDataPenalties: DEFAULT_SCORING_CONFIG.missingDataPenalties,
      rawWeight: DEFAULT_SCORING_CONFIG.rawWeight,
      confidenceWeight: DEFAULT_SCORING_CONFIG.confidenceWeight,
      notes: DEFAULT_SCORING_CONFIG.notes,
    },
    create: {
      id: 1,
      pillarWeights: DEFAULT_SCORING_CONFIG.pillarWeights,
      gradeThresholds: DEFAULT_SCORING_CONFIG.gradeThresholds,
      missingDataPenalties: DEFAULT_SCORING_CONFIG.missingDataPenalties,
      rawWeight: DEFAULT_SCORING_CONFIG.rawWeight,
      confidenceWeight: DEFAULT_SCORING_CONFIG.confidenceWeight,
      notes: DEFAULT_SCORING_CONFIG.notes,
    },
  });

  for (const benchmark of DEFAULT_BENCHMARKS) {
    await db.benchmark.upsert({
      where: { category: benchmark.category },
      update: benchmark,
      create: benchmark,
    });
  }

  return NextResponse.json({ ok: true });
}
