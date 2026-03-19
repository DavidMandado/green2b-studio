import { z } from "zod";

const optionalNumber = z
  .union([z.number(), z.nan(), z.null(), z.undefined()])
  .transform((value) => (typeof value === "number" && !Number.isNaN(value) ? value : null));

export const supplierSchema = z.object({
  name: z.string().min(2),
  supplierCode: z.string().min(2),
  country: z.string().min(2),
  city: z.string().min(2),
  website: z.string().min(2),
  primaryMaterials: z.array(z.string()).min(1),
  productCategories: z.array(z.string()).min(1),
  bcorpCertified: z.boolean(),
  otherCertifications: z.array(z.string()).default([]),
  evidenceCompletenessScore: z.number().min(0).max(100),
  contactStage: z.enum(["NEW", "CONTACTED", "QUALIFIED", "PILOT", "NEGOTIATING", "ON_HOLD"]),
  reliabilityRating: z.number().min(0).max(100),
  notes: z.string().min(2),
  riskFlags: z.array(z.string()).default([]),
});

export const productSchema = z.object({
  supplierId: z.string().min(1),
  productCode: z.string().min(2),
  productName: z.string().min(2),
  category: z.enum([
    "STRAWS",
    "TAKEAWAY_CUPS",
    "BOWLS",
    "CUTLERY",
    "LIDS",
    "NAPKINS",
    "FOOD_CONTAINERS",
  ]),
  targetSegment: z.string().min(2),
  unitPriceEur: z.number().min(0),
  currency: z.string().min(3),
  minimumOrderQuantity: z.number().int().min(1),
  leadTimeDays: z.number().int().min(1),
  originCountry: z.string().min(2),
  materialDescription: z.string().min(2),
  renewableMaterialPercent: optionalNumber,
  recycledMaterialPercent: optionalNumber,
  virginPlasticPercent: optionalNumber,
  plasticLining: z.boolean().nullable(),
  recyclableInPractice: z.boolean().nullable(),
  industrialCompostable: z.boolean().nullable(),
  homeCompostable: z.boolean().nullable(),
  packagingMaterial: z.string().nullable(),
  packagingRecycledContentPercent: optionalNumber,
  packagingWeightGramsPer100Units: optionalNumber,
  productWeightGramsPer100Units: optionalNumber,
  estimatedCo2ePer1000Units: optionalNumber,
  estimatedWaterLitersPer1000Units: optionalNumber,
  transportMode: z.string().nullable(),
  distanceKm: optionalNumber,
  supplierDisclosureScore: optionalNumber,
  laborPolicyScore: optionalNumber,
  traceabilityScore: optionalNumber,
  evidenceStatus: z.string().min(2),
  notes: z.string().min(2),
});

export const interviewSchema = z.object({
  companyName: z.string().min(2),
  city: z.string().min(2),
  countryResearchId: z.string().min(1),
  businessType: z.string().min(2),
  numberOfLocations: z.number().int().min(1),
  currentSupplierType: z.string().min(2),
  sustainabilityImportance: z.number().int().min(1).max(5),
  priceSensitivity: z.number().int().min(1).max(5),
  opennessToAlternativeSuppliers: z.number().int().min(1).max(5),
  painPoints: z.array(z.string()).min(1),
  keyQuote: z.string().min(4),
  currentProductsBought: z.array(z.string()).min(1),
  willingnessToPayNotes: z.string().min(4),
  contactStatus: z.string().min(2),
  summaryInsight: z.string().min(4),
});

export const competitorSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["DIRECT", "INDIRECT", "ADJACENT"]),
  geography: z.string().min(2),
  targetCustomers: z.array(z.string()).min(1),
  strengths: z.array(z.string()).min(1),
  weaknesses: z.array(z.string()).min(1),
  pricingSignal: z.string().min(2),
  hasScoringFeature: z.boolean(),
  hasCertificationFeature: z.boolean(),
  hasSourcingFeature: z.boolean(),
  hasMarketplaceFeature: z.boolean(),
  notes: z.string().min(4),
  differentiationNotes: z.string().min(4),
});

export const regulationSchema = z.object({
  countryResearchId: z.string().min(1),
  productCategory: z.enum([
    "STRAWS",
    "TAKEAWAY_CUPS",
    "BOWLS",
    "CUTLERY",
    "LIDS",
    "NAPKINS",
    "FOOD_CONTAINERS",
  ]),
  theme: z.enum(["PACKAGING", "IMPORT", "WASTE", "LABELING", "PROOF", "CERTIFICATION", "FOOD_CONTACT"]),
  requirementTitle: z.string().min(4),
  description: z.string().min(4),
  businessImplication: z.string().min(4),
  requiredDocuments: z.array(z.string()).min(1),
  complexityScore: z.number().min(0).max(100),
  urgencyScore: z.number().min(0).max(100),
  notes: z.string().min(4),
});

export const scoringConfigSchema = z.object({
  pillarWeights: z.object({
    material: z.number().min(0).max(100),
    packaging: z.number().min(0).max(100),
    carbon: z.number().min(0).max(100),
    water: z.number().min(0).max(100),
    sourcing: z.number().min(0).max(100),
    transport: z.number().min(0).max(100),
    social: z.number().min(0).max(100),
  }),
  gradeThresholds: z.array(
    z.object({
      grade: z.enum(["A", "B", "C", "D", "E"]),
      min: z.number().min(0).max(100),
      max: z.number().min(0).max(100),
    }),
  ),
  missingDataPenalties: z.object({
    renewableMaterialPercent: z.number().min(0).max(25),
    packagingData: z.number().min(0).max(25),
    co2eEstimate: z.number().min(0).max(25),
    waterEstimate: z.number().min(0).max(25),
    traceabilityScore: z.number().min(0).max(25),
    transportMode: z.number().min(0).max(25),
  }),
  rawWeight: z.number().min(0).max(1),
  confidenceWeight: z.number().min(0).max(1),
  notes: z.string().min(4),
  benchmarks: z.array(
    z.object({
      category: z.enum([
        "STRAWS",
        "TAKEAWAY_CUPS",
        "BOWLS",
        "CUTLERY",
        "LIDS",
        "NAPKINS",
        "FOOD_CONTAINERS",
      ]),
      co2eBenchmark: z.number().min(0),
      waterBenchmark: z.number().min(0),
    }),
  ),
});
