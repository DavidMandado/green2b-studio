import type {
  BuyerInterview,
  Competitor,
  CountryResearch,
  Evidence,
  Product,
  Supplier,
} from "@prisma/client";

import { average, round } from "@/lib/utils";

export type ScoredProductRecord = Product & {
  supplier: Supplier;
  evidence: Evidence[];
  supplierEvidence: Evidence[];
  score: {
    finalScore: number;
    rawScore: number;
    confidenceScore: number;
    grade: string;
    status: string;
    pillars: Record<string, { score: number; weight: number; contribution: number }>;
    topReasons: string[];
    missingInputs: string[];
    totalPenalty: number;
  };
};

function scoreCountry(country: CountryResearch) {
  return round(
    country.marketAttractivenessScore * 0.35 +
      country.sustainabilityMaturityScore * 0.2 +
      country.easeOfEntryScore * 0.15 +
      country.logisticsFitScore * 0.15 +
      country.willingnessToPaySignalScore * 0.15,
  );
}

export function getRecommendedFocusCountry(countries: CountryResearch[]) {
  return countries
    .filter((country) => country.priorityMarket)
    .map((country) => ({ country, score: scoreCountry(country) }))
    .sort((left, right) => right.score - left.score)[0];
}

export function aggregateInterviewInsights(interviews: BuyerInterview[]) {
  const painPointCounts = new Map<string, number>();
  const highIntent = interviews.filter(
    (interview) =>
      interview.sustainabilityImportance >= 4 &&
      interview.opennessToAlternativeSuppliers >= 4 &&
      interview.priceSensitivity <= 4,
  );

  for (const interview of interviews) {
    const painPoints = (interview.painPoints as string[]) ?? [];
    for (const pain of painPoints) {
      painPointCounts.set(pain, (painPointCounts.get(pain) ?? 0) + 1);
    }
  }

  const topPainPoints = [...painPointCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label]) => label);

  const claimProofCount = interviews.filter((interview) =>
    ((interview.painPoints as string[]) ?? []).some((pain) => /proof|claim|transparency/.test(pain.toLowerCase())),
  ).length;
  const pricingPressureCount = interviews.filter((interview) =>
    ((interview.painPoints as string[]) ?? []).some((pain) => /price|margin/.test(pain.toLowerCase())),
  ).length;
  const comparisonNeedCount = interviews.filter((interview) =>
    ((interview.painPoints as string[]) ?? []).some((pain) => /compare|comparison|standardized/.test(pain.toLowerCase())),
  ).length;

  const bestSegment =
    highIntent.some((interview) => /chain/i.test(interview.businessType)) &&
    highIntent.some((interview) => /café|cafe/i.test(interview.businessType))
      ? "Small chains and sustainability-conscious independent cafés"
      : "Sustainability-conscious independents and office catering teams";

  return {
    topPainPoints,
    bestSegment,
    priorityDimensions: [
      { label: "Credible proof of sustainability claims", count: claimProofCount },
      { label: "Commercially acceptable price-performance", count: pricingPressureCount },
      { label: "Fast product comparison for procurement", count: comparisonNeedCount },
    ].sort((left, right) => right.count - left.count),
  };
}

export function getCategoryAverages(products: ScoredProductRecord[]) {
  const grouped = new Map<string, number[]>();

  for (const product of products) {
    grouped.set(product.category, [...(grouped.get(product.category) ?? []), product.score.finalScore]);
  }

  return [...grouped.entries()].map(([category, scores]) => ({
    category,
    averageScore: round(average(scores), 1),
  }));
}

export function countPotentialBProducts(products: ScoredProductRecord[]) {
  return products.filter((product) => {
    if (product.score.finalScore >= 70) {
      return false;
    }
    const optimisticScore = product.score.rawScore * 0.85 + 15 - Math.max(product.score.totalPenalty - 8, 0);
    return optimisticScore >= 70;
  }).length;
}

export function getCompetitorWedge(competitors: Competitor[]) {
  const sourcingLight = competitors.filter((competitor) => competitor.hasSourcingFeature).length;
  const scoringLight = competitors.filter((competitor) => competitor.hasScoringFeature).length;

  return sourcingLight > 0 && scoringLight > 0
    ? "Green2B’s wedge is a lighter-weight sourcing plus scoring workflow: more credible than marketplaces, more usable than audit-heavy systems."
    : "Green2B’s wedge is a practical evidence-backed sourcing workflow tailored to hospitality buyers.";
}

export function getDashboardAlerts(products: ScoredProductRecord[], suppliers: Supplier[]) {
  const productsNeedingReview = products
    .filter((product) => product.score.status !== "VERIFIED")
    .slice(0, 4)
    .map((product) => ({
      label: product.productName,
      detail: `${product.score.grade} grade, ${product.score.status.toLowerCase().replaceAll("_", " ")}`,
    }));

  const supplierGaps = suppliers
    .filter((supplier) => supplier.evidenceCompletenessScore < 70)
    .slice(0, 4)
    .map((supplier) => ({
      label: supplier.name,
      detail: `${round(supplier.evidenceCompletenessScore, 0)} evidence completeness`,
    }));

  return {
    productsNeedingReview,
    supplierGaps,
  };
}
