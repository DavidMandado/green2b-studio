export const PRODUCT_CATEGORY_LABELS = {
  STRAWS: "Straws",
  TAKEAWAY_CUPS: "Takeaway Cups",
  BOWLS: "Bowls",
  CUTLERY: "Cutlery",
  LIDS: "Lids",
  NAPKINS: "Napkins",
  FOOD_CONTAINERS: "Food Containers",
} as const;

export const CONTACT_STAGE_LABELS = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  PILOT: "Pilot",
  NEGOTIATING: "Negotiating",
  ON_HOLD: "On Hold",
} as const;

export const ROLE_LABELS = {
  ANALYST: "Analyst",
  FOUNDER: "Founder",
  BUYER_DEMO: "Buyer Demo",
} as const;

export const COMPETITOR_TYPE_LABELS = {
  DIRECT: "Direct",
  INDIRECT: "Indirect",
  ADJACENT: "Adjacent",
} as const;

export const REGULATION_THEME_LABELS = {
  PACKAGING: "Packaging",
  IMPORT: "Import",
  WASTE: "Waste / EPR",
  LABELING: "Labeling",
  PROOF: "Proof",
  CERTIFICATION: "Certification",
  FOOD_CONTACT: "Food Contact",
} as const;

export const VERIFICATION_STATUS_LABELS = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  EXPIRED: "Expired",
  MISSING_CRITICAL: "Missing Critical",
} as const;

export const SCORE_STATUS_LABELS = {
  VERIFIED: "Verified",
  PROVISIONAL: "Provisional",
  INSUFFICIENT_DATA: "Insufficient Data",
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/research/countries", label: "Countries" },
  { href: "/research/interviews", label: "Interviews" },
  { href: "/research/competitors", label: "Competitors" },
  { href: "/research/regulations", label: "Regulations" },
  { href: "/suppliers", label: "Suppliers" },
  { href: "/products", label: "Products" },
  { href: "/compare", label: "Buyer Compare" },
  { href: "/pipeline", label: "Pipeline Demo" },
  { href: "/settings/scoring", label: "Scoring Settings" },
  { href: "/reports/summary", label: "Summary Report" },
] as const;

export const CATEGORY_ORDER = Object.keys(PRODUCT_CATEGORY_LABELS) as Array<
  keyof typeof PRODUCT_CATEGORY_LABELS
>;
