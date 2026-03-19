import type { Benchmark, ProductCategory } from "@prisma/client";

export type PillarKey =
  | "material"
  | "packaging"
  | "carbon"
  | "water"
  | "sourcing"
  | "transport"
  | "social";

export type PillarWeights = Record<PillarKey, number>;

export type MissingPenaltyMap = {
  renewableMaterialPercent: number;
  packagingData: number;
  co2eEstimate: number;
  waterEstimate: number;
  traceabilityScore: number;
  transportMode: number;
};

export type GradeThreshold = {
  grade: "A" | "B" | "C" | "D" | "E";
  min: number;
  max: number;
};

export type ScoringConfigShape = {
  pillarWeights: PillarWeights;
  gradeThresholds: GradeThreshold[];
  missingDataPenalties: MissingPenaltyMap;
  rawWeight: number;
  confidenceWeight: number;
  notes: string;
};

export const DEFAULT_PILLAR_WEIGHTS: PillarWeights = {
  material: 28,
  packaging: 16,
  carbon: 14,
  water: 10,
  sourcing: 14,
  transport: 10,
  social: 8,
};

export const DEFAULT_MISSING_DATA_PENALTIES: MissingPenaltyMap = {
  renewableMaterialPercent: 10,
  packagingData: 8,
  co2eEstimate: 8,
  waterEstimate: 6,
  traceabilityScore: 8,
  transportMode: 6,
};

export const DEFAULT_GRADE_THRESHOLDS: GradeThreshold[] = [
  { grade: "A", min: 85, max: 100 },
  { grade: "B", min: 70, max: 84.99 },
  { grade: "C", min: 55, max: 69.99 },
  { grade: "D", min: 40, max: 54.99 },
  { grade: "E", min: 0, max: 39.99 },
];

export const DEFAULT_SCORING_CONFIG: ScoringConfigShape = {
  pillarWeights: DEFAULT_PILLAR_WEIGHTS,
  gradeThresholds: DEFAULT_GRADE_THRESHOLDS,
  missingDataPenalties: DEFAULT_MISSING_DATA_PENALTIES,
  rawWeight: 0.85,
  confidenceWeight: 0.15,
  notes:
    "Prototype scoring logic intended for internal decision support. Results combine weighted sustainability pillars with a data-confidence adjustment.",
};

export const DEFAULT_BENCHMARKS: Array<{
  category: ProductCategory;
  co2eBenchmark: number;
  waterBenchmark: number;
}> = [
  { category: "STRAWS", co2eBenchmark: 10.5, waterBenchmark: 100 },
  { category: "TAKEAWAY_CUPS", co2eBenchmark: 15.5, waterBenchmark: 120 },
  { category: "BOWLS", co2eBenchmark: 25, waterBenchmark: 220 },
  { category: "CUTLERY", co2eBenchmark: 8, waterBenchmark: 85 },
  { category: "LIDS", co2eBenchmark: 8.8, waterBenchmark: 76 },
  { category: "NAPKINS", co2eBenchmark: 5.2, waterBenchmark: 42 },
  { category: "FOOD_CONTAINERS", co2eBenchmark: 24, waterBenchmark: 210 },
];

export function toConfigPayload(config?: {
  pillarWeights: unknown;
  gradeThresholds: unknown;
  missingDataPenalties: unknown;
  rawWeight: number;
  confidenceWeight: number;
  notes: string;
} | null): ScoringConfigShape {
  if (!config) {
    return DEFAULT_SCORING_CONFIG;
  }

  return {
    pillarWeights: config.pillarWeights as PillarWeights,
    gradeThresholds: config.gradeThresholds as GradeThreshold[],
    missingDataPenalties: config.missingDataPenalties as MissingPenaltyMap,
    rawWeight: config.rawWeight,
    confidenceWeight: config.confidenceWeight,
    notes: config.notes,
  };
}

export function benchmarkMap(benchmarks: Benchmark[]) {
  return Object.fromEntries(
    benchmarks.map((benchmark) => [
      benchmark.category,
      {
        co2eBenchmark: benchmark.co2eBenchmark,
        waterBenchmark: benchmark.waterBenchmark,
      },
    ]),
  ) as Record<ProductCategory, { co2eBenchmark: number; waterBenchmark: number }>;
}
