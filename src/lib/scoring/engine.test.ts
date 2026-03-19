import { describe, expect, it } from "vitest";

import { DEFAULT_SCORING_CONFIG } from "@/lib/scoring/defaults";
import {
  calculateMissingDataPenalty,
  calculateScore,
  determineStatus,
  mapGrade,
  scoreRelativeToBenchmark,
} from "@/lib/scoring/engine";

const baseProduct = {
  category: "STRAWS" as const,
  productName: "Test Straw",
  renewableMaterialPercent: 90,
  recycledMaterialPercent: 10,
  virginPlasticPercent: 0,
  plasticLining: false,
  recyclableInPractice: false,
  industrialCompostable: true,
  homeCompostable: true,
  packagingMaterial: "corrugated carton",
  packagingRecycledContentPercent: 80,
  packagingWeightGramsPer100Units: 35,
  productWeightGramsPer100Units: 100,
  estimatedCo2ePer1000Units: 8.4,
  estimatedWaterLitersPer1000Units: 84,
  transportMode: "sea",
  distanceKm: 7200,
  supplierDisclosureScore: 84,
  laborPolicyScore: 76,
  traceabilityScore: 74,
};

const baseSupplier = {
  bcorpCertified: true,
  otherCertifications: ["B Corp", "FSC supplier declaration"],
  evidenceCompletenessScore: 86,
};

const baseEvidence = [
  { type: "CERTIFICATE" as const, verificationStatus: "VERIFIED" as const, critical: true },
  { type: "DECLARATION" as const, verificationStatus: "VERIFIED" as const, critical: true },
  { type: "PRODUCT_SHEET" as const, verificationStatus: "VERIFIED" as const, critical: true },
  { type: "PACKAGING_SPEC" as const, verificationStatus: "VERIFIED" as const, critical: true },
];

describe("scoring engine", () => {
  it("calculates a strong final score for a well-documented product", () => {
    const result = calculateScore({
      product: baseProduct,
      supplier: baseSupplier,
      evidence: baseEvidence,
      benchmark: { co2eBenchmark: 10.5, waterBenchmark: 100 },
      config: DEFAULT_SCORING_CONFIG,
    });

    expect(result.finalScore).toBeGreaterThan(80);
    expect(result.grade).toBe("A");
    expect(result.status).toBe("VERIFIED");
  });

  it("maps grade thresholds correctly", () => {
    expect(mapGrade(86, DEFAULT_SCORING_CONFIG.gradeThresholds)).toBe("A");
    expect(mapGrade(72, DEFAULT_SCORING_CONFIG.gradeThresholds)).toBe("B");
    expect(mapGrade(56, DEFAULT_SCORING_CONFIG.gradeThresholds)).toBe("C");
    expect(mapGrade(45, DEFAULT_SCORING_CONFIG.gradeThresholds)).toBe("D");
    expect(mapGrade(12, DEFAULT_SCORING_CONFIG.gradeThresholds)).toBe("E");
  });

  it("determines provisional and insufficient data states", () => {
    expect(determineStatus({ missingCriticalFields: 0, verifiedEvidenceRatio: 0.72 })).toBe("VERIFIED");
    expect(determineStatus({ missingCriticalFields: 2, verifiedEvidenceRatio: 0.4 })).toBe("PROVISIONAL");
    expect(determineStatus({ missingCriticalFields: 3, verifiedEvidenceRatio: 0.8 })).toBe("INSUFFICIENT_DATA");
  });

  it("caps missing data penalties at 25", () => {
    const penalty = calculateMissingDataPenalty(
      {
        ...baseProduct,
        renewableMaterialPercent: null,
        packagingRecycledContentPercent: null,
        packagingWeightGramsPer100Units: null,
        estimatedCo2ePer1000Units: null,
        estimatedWaterLitersPer1000Units: null,
        traceabilityScore: null,
        transportMode: null,
      },
      DEFAULT_SCORING_CONFIG.missingDataPenalties,
    );

    expect(penalty.total).toBe(25);
    expect(penalty.applied).toHaveLength(6);
  });

  it("scores better than benchmark more favorably", () => {
    expect(scoreRelativeToBenchmark(8, 10)).toBeGreaterThan(scoreRelativeToBenchmark(12, 10));
    expect(scoreRelativeToBenchmark(8, 10)).toBeGreaterThan(75);
  });
});
