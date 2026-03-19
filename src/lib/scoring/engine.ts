import type { EvidenceType, ProductCategory, ScoreStatus, VerificationStatus } from "@prisma/client";

import type { GradeThreshold, MissingPenaltyMap, PillarKey, ScoringConfigShape } from "@/lib/scoring/defaults";
import { clamp, round } from "@/lib/utils";

export type ScoreableEvidence = {
  type: EvidenceType;
  verificationStatus: VerificationStatus;
  critical: boolean;
};

export type ScoreableSupplier = {
  bcorpCertified: boolean;
  otherCertifications: string[];
  evidenceCompletenessScore: number;
};

export type ScoreableProduct = {
  category: ProductCategory;
  productName: string;
  renewableMaterialPercent: number | null;
  recycledMaterialPercent: number | null;
  virginPlasticPercent: number | null;
  plasticLining: boolean | null;
  recyclableInPractice: boolean | null;
  industrialCompostable: boolean | null;
  homeCompostable: boolean | null;
  packagingMaterial: string | null;
  packagingRecycledContentPercent: number | null;
  packagingWeightGramsPer100Units: number | null;
  productWeightGramsPer100Units: number | null;
  estimatedCo2ePer1000Units: number | null;
  estimatedWaterLitersPer1000Units: number | null;
  transportMode: string | null;
  distanceKm: number | null;
  supplierDisclosureScore: number | null;
  laborPolicyScore: number | null;
  traceabilityScore: number | null;
};

export type ScoreBenchmark = {
  co2eBenchmark: number;
  waterBenchmark: number;
};

export type ScoreBreakdown = {
  [key in PillarKey]: {
    score: number;
    weight: number;
    contribution: number;
  };
};

export type ScoreResult = {
  rawScore: number;
  confidenceScore: number;
  finalScore: number;
  grade: string;
  status: ScoreStatus;
  penaltiesApplied: Array<{ label: string; value: number }>;
  totalPenalty: number;
  pillars: ScoreBreakdown;
  topReasons: string[];
  missingInputs: string[];
};

const MATERIAL_SUPPORTING_EVIDENCE: EvidenceType[] = [
  "CERTIFICATE",
  "DECLARATION",
  "PRODUCT_SHEET",
  "PACKAGING_SPEC",
];

function normalizedList(values: string[]) {
  return values.map((value) => value.toLowerCase());
}

export function scoreRelativeToBenchmark(value: number | null, benchmark: number) {
  if (value === null || value === undefined) {
    return 35;
  }

  const ratio = value / benchmark;

  if (ratio <= 0.75) {
    return clamp(96 + (0.75 - ratio) * 16);
  }

  if (ratio <= 1) {
    return clamp(78 + (1 - ratio) * 72);
  }

  if (ratio <= 1.25) {
    return clamp(58 - (ratio - 1) * 72);
  }

  if (ratio <= 1.5) {
    return clamp(34 - (ratio - 1.25) * 64);
  }

  return 12;
}

export function calculateMissingDataPenalty(product: ScoreableProduct, penalties: MissingPenaltyMap) {
  const applied: Array<{ label: string; value: number }> = [];

  if (product.renewableMaterialPercent === null || product.renewableMaterialPercent === undefined) {
    applied.push({ label: "Renewable material data missing", value: penalties.renewableMaterialPercent });
  }

  if (
    product.packagingRecycledContentPercent === null ||
    product.packagingRecycledContentPercent === undefined ||
    product.packagingWeightGramsPer100Units === null ||
    product.packagingWeightGramsPer100Units === undefined
  ) {
    applied.push({ label: "Packaging data missing", value: penalties.packagingData });
  }

  if (product.estimatedCo2ePer1000Units === null || product.estimatedCo2ePer1000Units === undefined) {
    applied.push({ label: "CO2e estimate missing", value: penalties.co2eEstimate });
  }

  if (product.estimatedWaterLitersPer1000Units === null || product.estimatedWaterLitersPer1000Units === undefined) {
    applied.push({ label: "Water estimate missing", value: penalties.waterEstimate });
  }

  if (product.traceabilityScore === null || product.traceabilityScore === undefined) {
    applied.push({ label: "Traceability score missing", value: penalties.traceabilityScore });
  }

  if (!product.transportMode) {
    applied.push({ label: "Transport mode missing", value: penalties.transportMode });
  }

  const total = Math.min(
    applied.reduce((sum, item) => sum + item.value, 0),
    25,
  );

  return { applied, total };
}

export function mapGrade(score: number, thresholds: GradeThreshold[]) {
  return thresholds.find((threshold) => score >= threshold.min && score <= threshold.max)?.grade ?? "E";
}

export function determineStatus({
  missingCriticalFields,
  verifiedEvidenceRatio,
}: {
  missingCriticalFields: number;
  verifiedEvidenceRatio: number;
}): ScoreStatus {
  if (missingCriticalFields >= 3) {
    return "INSUFFICIENT_DATA";
  }

  if (missingCriticalFields === 0 && verifiedEvidenceRatio >= 0.7) {
    return "VERIFIED";
  }

  return "PROVISIONAL";
}

export function calculateScore({
  product,
  supplier,
  evidence,
  benchmark,
  config,
}: {
  product: ScoreableProduct;
  supplier: ScoreableSupplier;
  evidence: ScoreableEvidence[];
  benchmark: ScoreBenchmark;
  config: ScoringConfigShape;
}): ScoreResult {
  const certifications = normalizedList(supplier.otherCertifications);
  const verifiedEvidence = evidence.filter((item) => item.verificationStatus === "VERIFIED");
  const verifiedEvidenceRatio = evidence.length ? verifiedEvidence.length / evidence.length : 0;
  const criticalEvidence = evidence.filter((item) => item.critical);
  const criticalVerifiedRatio = criticalEvidence.length
    ? criticalEvidence.filter((item) => item.verificationStatus === "VERIFIED").length / criticalEvidence.length
    : verifiedEvidenceRatio;

  const materialScore = clamp(
    (product.renewableMaterialPercent ?? 0) * 0.45 +
      (product.recycledMaterialPercent ?? 0) * 0.25 -
      (product.virginPlasticPercent ?? 0) * 0.25 -
      (product.plasticLining ? 15 : 0),
  );

  let packagingScore =
    (product.packagingRecycledContentPercent ?? 0) * 0.5 +
    clamp(40 - (product.packagingWeightGramsPer100Units ?? 80) * 0.45, 0, 40);

  const packagingMaterial = product.packagingMaterial?.toLowerCase() ?? "";
  if (/(paper|fiber|carton|mono|pulp)/.test(packagingMaterial)) {
    packagingScore += 12;
  }
  if (/(mixed plastic|laminate|multi-layer)/.test(packagingMaterial)) {
    packagingScore -= 12;
  }
  packagingScore = clamp(packagingScore);

  const carbonScore = scoreRelativeToBenchmark(product.estimatedCo2ePer1000Units, benchmark.co2eBenchmark);
  const waterScore = scoreRelativeToBenchmark(product.estimatedWaterLitersPer1000Units, benchmark.waterBenchmark);

  let sourcingScore =
    (supplier.bcorpCertified ? 15 : 0) +
    Math.min(certifications.filter((item) => /(fsc|compost|food contact|iso|audit|declaration)/.test(item)).length * 6, 24) +
    (product.traceabilityScore ?? 0) * 0.35 +
    criticalVerifiedRatio * 30;

  if (evidence.some((item) => item.verificationStatus === "EXPIRED")) {
    sourcingScore -= 8;
  }
  if (evidence.some((item) => item.verificationStatus === "PENDING")) {
    sourcingScore -= 4;
  }
  sourcingScore = clamp(sourcingScore);

  const transportBase =
    {
      sea: 80,
      rail: 68,
      road: 56,
      air: 15,
    }[product.transportMode?.toLowerCase() ?? ""] ?? 38;

  const distanceAdjustment =
    product.distanceKm === null || product.distanceKm === undefined
      ? 0
      : clamp(18 - product.distanceKm / 550, -12, 18);
  const transportScore = clamp(transportBase + distanceAdjustment);

  const socialScore = clamp(
    (product.supplierDisclosureScore ?? 0) * 0.4 +
      (product.laborPolicyScore ?? 0) * 0.35 +
      supplier.evidenceCompletenessScore * 0.25,
  );

  const missingCriticalFields = [
    product.renewableMaterialPercent,
    product.packagingRecycledContentPercent,
    product.estimatedCo2ePer1000Units,
    product.estimatedWaterLitersPer1000Units,
    product.traceabilityScore,
    product.transportMode,
  ].filter((value) => value === null || value === undefined || value === "").length;

  const evidenceSupport = MATERIAL_SUPPORTING_EVIDENCE.every((type) =>
    verifiedEvidence.some((item) => item.type === type),
  )
    ? 100
    : verifiedEvidence.some((item) => MATERIAL_SUPPORTING_EVIDENCE.includes(item.type))
      ? 75
      : 45;

  const confidenceScore = clamp(
    supplier.evidenceCompletenessScore * 0.35 +
      verifiedEvidenceRatio * 35 +
      clamp(100 - missingCriticalFields * 18, 0, 100) * 0.2 +
      evidenceSupport * 0.1,
  );

  const penalties = calculateMissingDataPenalty(product, config.missingDataPenalties);

  const pillars = {
    material: {
      score: round(materialScore),
      weight: config.pillarWeights.material,
      contribution: round((materialScore * config.pillarWeights.material) / 100, 2),
    },
    packaging: {
      score: round(packagingScore),
      weight: config.pillarWeights.packaging,
      contribution: round((packagingScore * config.pillarWeights.packaging) / 100, 2),
    },
    carbon: {
      score: round(carbonScore),
      weight: config.pillarWeights.carbon,
      contribution: round((carbonScore * config.pillarWeights.carbon) / 100, 2),
    },
    water: {
      score: round(waterScore),
      weight: config.pillarWeights.water,
      contribution: round((waterScore * config.pillarWeights.water) / 100, 2),
    },
    sourcing: {
      score: round(sourcingScore),
      weight: config.pillarWeights.sourcing,
      contribution: round((sourcingScore * config.pillarWeights.sourcing) / 100, 2),
    },
    transport: {
      score: round(transportScore),
      weight: config.pillarWeights.transport,
      contribution: round((transportScore * config.pillarWeights.transport) / 100, 2),
    },
    social: {
      score: round(socialScore),
      weight: config.pillarWeights.social,
      contribution: round((socialScore * config.pillarWeights.social) / 100, 2),
    },
  } satisfies ScoreBreakdown;

  const rawScore = round(
    Object.values(pillars).reduce((sum, pillar) => sum + pillar.contribution, 0),
    2,
  );

  const finalScore = clamp(
    config.rawWeight * rawScore + config.confidenceWeight * confidenceScore - penalties.total,
  );
  const grade = mapGrade(finalScore, config.gradeThresholds);
  const status = determineStatus({ missingCriticalFields, verifiedEvidenceRatio });

  const rankedReasons = [
    {
      label: "Strong material profile",
      score: materialScore + (product.homeCompostable ? 8 : 0) + (product.industrialCompostable ? 4 : 0),
    },
    {
      label: "Packaging spec looks efficient",
      score: packagingScore,
    },
    {
      label: "Low transport burden for the route used",
      score: transportScore,
    },
    {
      label: "Supplier credibility and social documentation are comparatively solid",
      score: socialScore + sourcingScore,
    },
    {
      label: "Verified documentation supports the core claims",
      score: confidenceScore,
    },
  ]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((item) => item.label);

  const missingInputs = [
    product.renewableMaterialPercent === null ? "Renewable material split" : null,
    product.packagingRecycledContentPercent === null || product.packagingWeightGramsPer100Units === null
      ? "Packaging composition and weight" : null,
    product.estimatedCo2ePer1000Units === null ? "Category CO2e estimate" : null,
    product.estimatedWaterLitersPer1000Units === null ? "Category water estimate" : null,
    product.traceabilityScore === null ? "Traceability score and supporting proof" : null,
    !product.transportMode ? "Transport mode declaration" : null,
  ].filter((item): item is string => Boolean(item));

  return {
    rawScore,
    confidenceScore: round(confidenceScore),
    finalScore: round(finalScore),
    grade,
    status,
    penaltiesApplied: penalties.applied,
    totalPenalty: penalties.total,
    pillars,
    topReasons: rankedReasons,
    missingInputs,
  };
}
