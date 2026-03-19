import type { ProductCategory } from "@prisma/client";

type RequestTemplate = {
  summary: string;
  checklist: string[];
};

export const REQUEST_TEMPLATES: Record<ProductCategory, RequestTemplate> = {
  STRAWS: {
    summary: "Validate material composition, lining disclosure, and compostability proof before pricing discussions.",
    checklist: [
      "Full material composition with paper, fiber, PLA, or other coatings split out",
      "Plastic-lining disclosure with thickness or coating description",
      "Compostability claim support and standard referenced",
      "Packaging specification sheet with recycled-content percentage",
      "Food-contact declaration and country of test lab",
      "Transport mode declaration and latest shipment lane",
    ],
  },
  TAKEAWAY_CUPS: {
    summary: "Cup buyers care about insulation, proof of coating claims, and practical recyclability.",
    checklist: [
      "Cup wall composition and any barrier coating details",
      "Recycled-content proof for cup body and outer carton",
      "Product technical sheet covering gsm, weight, and dimensions",
      "Food-contact compliance declaration",
      "End-of-life guidance by market and recyclability statement",
      "Factory quality control note for leak and heat performance",
    ],
  },
  BOWLS: {
    summary: "Bowls need source proof, grease resistance clarity, and declarations around added chemistries.",
    checklist: [
      "Bagasse or molded-fiber source declaration",
      "PFAS-free or coating-free declaration where relevant",
      "Packaging specification and carton recycled content",
      "Compostability or disposal claim support",
      "Product weight and dimensional spec sheet",
      "Batch traceability description",
    ],
  },
  CUTLERY: {
    summary: "Cutlery requires clear sourcing proof and durable product specs because operational performance matters.",
    checklist: [
      "Wood or bamboo source proof",
      "Surface treatment and additive disclosure",
      "Breakage or durability testing note",
      "Outer pack specification with recycled content",
      "Labor policy or supplier code of conduct",
      "Transport declaration for standard EU route",
    ],
  },
  LIDS: {
    summary: "Lids are judged on fit consistency, material claims, and whether buyers can trust the disposal guidance.",
    checklist: [
      "Material composition by weight",
      "Fit compatibility note with cup sizes",
      "Recycled-content declaration for product and packaging",
      "Technical sheet with weight and temperature tolerance",
      "Compostability or recyclability evidence if claimed",
      "Production site traceability reference",
    ],
  },
  NAPKINS: {
    summary: "Napkins are simple, but buyers still want fiber origin, recycled content, and proof of consistent quality.",
    checklist: [
      "Virgin versus recycled fiber split",
      "FSC or recycled-fiber declaration if claimed",
      "Pack and carton specification",
      "Absorbency or product quality note",
      "Supplier labor policy and grievance policy",
      "Shipment mode declaration",
    ],
  },
  FOOD_CONTAINERS: {
    summary: "Food containers need the strongest documentation because compliance, coatings, and commercial performance all matter.",
    checklist: [
      "Material composition and any barrier treatment disclosure",
      "PFAS-free or additive-free declaration",
      "Food-contact declaration with applicable scope",
      "Packaging spec sheet and carton recycled content",
      "Product technical sheet with weight, dimensions, and heat limits",
      "Transport emissions or route declaration",
    ],
  },
};
