import { PrismaClient } from "@prisma/client";

import { DEFAULT_BENCHMARKS, DEFAULT_SCORING_CONFIG } from "../src/lib/scoring/defaults";
import { countrySeed, competitorSeed, interviewSeed, regulationSeed } from "../src/lib/seed-data/base";
import { productSeed, supplierSeed } from "../src/lib/seed-data/catalog";
import { evidenceSeed } from "../src/lib/seed-data/evidence";

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.evidence.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.regulationNote.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.buyerInterview.deleteMany();
  await prisma.countryResearch.deleteMany();
  await prisma.benchmark.deleteMany();
  await prisma.scoringConfig.deleteMany();
  await prisma.appState.deleteMany();

  await prisma.appState.create({
    data: {
      id: 1,
      activeRole: "ANALYST",
    },
  });

  await prisma.scoringConfig.create({
    data: {
      id: 1,
      pillarWeights: DEFAULT_SCORING_CONFIG.pillarWeights,
      gradeThresholds: DEFAULT_SCORING_CONFIG.gradeThresholds,
      missingDataPenalties: DEFAULT_SCORING_CONFIG.missingDataPenalties,
      rawWeight: DEFAULT_SCORING_CONFIG.rawWeight,
      confidenceWeight: DEFAULT_SCORING_CONFIG.confidenceWeight,
      notes: DEFAULT_SCORING_CONFIG.notes,
    },
  });

  await prisma.benchmark.createMany({
    data: DEFAULT_BENCHMARKS,
  });

  const countries = new Map<string, string>();
  for (const country of countrySeed) {
    const created = await prisma.countryResearch.create({
      data: {
        ...country,
        slug: slugify(country.name),
      },
    });
    countries.set(created.name, created.id);
  }

  for (const interview of interviewSeed) {
    await prisma.buyerInterview.create({
      data: {
        slug: slugify(interview.companyName),
        companyName: interview.companyName,
        city: interview.city,
        countryResearchId: countries.get(interview.country)!,
        businessType: interview.businessType,
        numberOfLocations: interview.numberOfLocations,
        currentSupplierType: interview.currentSupplierType,
        sustainabilityImportance: interview.sustainabilityImportance,
        priceSensitivity: interview.priceSensitivity,
        opennessToAlternativeSuppliers: interview.opennessToAlternativeSuppliers,
        painPoints: interview.painPoints,
        keyQuote: interview.keyQuote,
        currentProductsBought: interview.currentProductsBought,
        willingnessToPayNotes: interview.willingnessToPayNotes,
        contactStatus: interview.contactStatus,
        summaryInsight: interview.summaryInsight,
      },
    });
  }

  for (const competitor of competitorSeed) {
    await prisma.competitor.create({
      data: {
        ...competitor,
        slug: slugify(competitor.name),
      },
    });
  }

  for (const regulation of regulationSeed) {
    await prisma.regulationNote.create({
      data: {
        slug: slugify(`${regulation.country}-${regulation.requirementTitle}`),
        countryResearchId: countries.get(regulation.country)!,
        productCategory: regulation.productCategory,
        theme: regulation.theme,
        requirementTitle: regulation.requirementTitle,
        description: regulation.description,
        businessImplication: regulation.businessImplication,
        requiredDocuments: regulation.requiredDocuments,
        complexityScore: regulation.complexityScore,
        urgencyScore: regulation.urgencyScore,
        notes: regulation.notes,
      },
    });
  }

  const supplierIds = new Map<string, string>();
  for (const supplier of supplierSeed) {
    const created = await prisma.supplier.create({
      data: {
        ...supplier,
        slug: slugify(supplier.name),
      },
    });
    supplierIds.set(created.name, created.id);
  }

  const productIds = new Map<string, string>();
  for (const product of productSeed) {
    const { supplierName, ...productData } = product;
    const created = await prisma.product.create({
      data: {
        ...productData,
        supplierId: supplierIds.get(supplierName)!,
        slug: slugify(product.productName),
      },
    });
    productIds.set(created.productName, created.id);
  }

  for (const evidence of evidenceSeed) {
    await prisma.evidence.create({
      data: {
        evidenceCode: evidence.evidenceCode,
        supplierId: evidence.supplierName ? supplierIds.get(evidence.supplierName)! : undefined,
        productId: evidence.productName ? productIds.get(evidence.productName)! : undefined,
        type: evidence.type,
        title: evidence.title,
        issuer: evidence.issuer,
        issueDate: new Date(evidence.issueDate),
        expiryDate: evidence.expiryDate ? new Date(evidence.expiryDate) : null,
        verificationStatus: evidence.verificationStatus,
        verifiedBy: evidence.verifiedBy ?? null,
        fileName: evidence.fileName,
        notes: evidence.notes,
        critical: evidence.critical,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
