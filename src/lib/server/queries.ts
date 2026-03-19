import { unstable_noStore as noStore } from "next/cache";

import { db } from "@/lib/db";
import {
  aggregateInterviewInsights,
  countPotentialBProducts,
  getCategoryAverages,
  getCompetitorWedge,
  getDashboardAlerts,
  getRecommendedFocusCountry,
  type ScoredProductRecord,
} from "@/lib/insights";
import { benchmarkMap, toConfigPayload } from "@/lib/scoring/defaults";
import { calculateScore } from "@/lib/scoring/engine";

function jsonArray(value: unknown) {
  return Array.isArray(value) ? (value as string[]) : [];
}

export async function getAppState() {
  noStore();
  const state = await db.appState.findUnique({ where: { id: 1 } });

  if (state) {
    return state;
  }

  return db.appState.create({
    data: {
      id: 1,
      activeRole: "ANALYST",
    },
  });
}

export async function getScoringContext() {
  noStore();
  const [config, benchmarks] = await Promise.all([
    db.scoringConfig.findUnique({ where: { id: 1 } }),
    db.benchmark.findMany({ orderBy: { category: "asc" } }),
  ]);

  return {
    config: toConfigPayload(config),
    benchmarks,
    benchmarkLookup: benchmarkMap(benchmarks),
  };
}

export async function getCountries() {
  noStore();
  return db.countryResearch.findMany({
    orderBy: [{ priorityMarket: "desc" }, { marketAttractivenessScore: "desc" }],
    include: {
      interviews: true,
      regulations: true,
    },
  });
}

export async function getCountryById(id: string) {
  noStore();
  return db.countryResearch.findUnique({
    where: { id },
    include: {
      interviews: true,
      regulations: true,
    },
  });
}

export async function getInterviews() {
  noStore();
  return db.buyerInterview.findMany({
    orderBy: { companyName: "asc" },
    include: {
      country: true,
    },
  });
}

export async function getCompetitors() {
  noStore();
  return db.competitor.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getRegulations() {
  noStore();
  return db.regulationNote.findMany({
    orderBy: [{ urgencyScore: "desc" }, { complexityScore: "desc" }],
    include: {
      country: true,
    },
  });
}

export async function getSuppliers() {
  noStore();
  return db.supplier.findMany({
    orderBy: { reliabilityRating: "desc" },
    include: {
      evidence: true,
      products: true,
    },
  });
}

export async function getSupplierById(id: string) {
  noStore();
  return db.supplier.findUnique({
    where: { id },
    include: {
      evidence: true,
      products: {
        include: {
          evidence: true,
        },
      },
    },
  });
}

export async function getProductsWithScores() {
  noStore();
  const { config, benchmarkLookup } = await getScoringContext();
  const products = await db.product.findMany({
    orderBy: { productName: "asc" },
    include: {
      evidence: true,
      supplier: {
        include: {
          evidence: true,
        },
      },
    },
  });

  return products.map((product) => {
    const score = calculateScore({
      product,
      supplier: {
        bcorpCertified: product.supplier.bcorpCertified,
        otherCertifications: jsonArray(product.supplier.otherCertifications),
        evidenceCompletenessScore: product.supplier.evidenceCompletenessScore,
      },
      evidence: [...product.evidence, ...product.supplier.evidence].map((evidence) => ({
        type: evidence.type,
        verificationStatus: evidence.verificationStatus,
        critical: evidence.critical,
      })),
      benchmark: benchmarkLookup[product.category],
      config,
    });

    return {
      ...product,
      supplierEvidence: product.supplier.evidence,
      score,
    } satisfies ScoredProductRecord;
  });
}

export async function getProductById(id: string) {
  noStore();
  const products = await getProductsWithScores();
  return products.find((product) => product.id === id) ?? null;
}

export async function getDashboardData() {
  noStore();
  const [appState, countries, interviews, competitors, regulations, suppliers, scoredProducts] = await Promise.all([
    getAppState(),
    getCountries(),
    getInterviews(),
    getCompetitors(),
    getRegulations(),
    getSuppliers(),
    getProductsWithScores(),
  ]);

  const focusCountry = getRecommendedFocusCountry(countries);
  const interviewInsights = aggregateInterviewInsights(interviews);
  const categoryAverages = getCategoryAverages(scoredProducts);
  const dashboardAlerts = getDashboardAlerts(
    scoredProducts,
    suppliers.map((supplier) => ({
      ...supplier,
      primaryMaterials: supplier.primaryMaterials,
      productCategories: supplier.productCategories,
      otherCertifications: supplier.otherCertifications,
      riskFlags: supplier.riskFlags,
    })),
  );

  return {
    appState,
    countries,
    interviews,
    competitors,
    regulations,
    suppliers,
    scoredProducts,
    focusCountry,
    interviewInsights,
    categoryAverages,
    competitorWedge: getCompetitorWedge(competitors),
    potentialBProducts: countPotentialBProducts(scoredProducts),
    dashboardAlerts,
  };
}
