import type { LifeStage, ProductDetail, ProductStatus, ProductType } from "@/lib/types";

// Mock seed shape — decoupled from the runtime `Product` type so the seed
// can carry legacy fields (`price`, `currency`, `seller`, `location`,
// `relatedIds`) that the runtime model no longer needs. Only the fields
// consumed by `prisma/mock.ts` are meaningful here; the rest are kept
// because they describe each product naturally and we don't want to
// hand-strip them.
export interface ProductSeed {
  id: string;
  title: string;
  seller?: string;
  sellerId: string;
  location?: string;
  price?: number;
  currency?: string;
  productType: ProductType;
  variants: { id: string; label: string; price: number; currency: string; stock: number }[];
  status: ProductStatus;
  verified: boolean;
  description: string;
  details: ProductDetail;
  lifeStages: LifeStage[];
  relatedIds?: string[];
}

export const products: ProductSeed[] = [
  {
    id: "remains-bracelet-001",
    title: "Remains infused bracelet",
    seller: "Earthen Studio",
    sellerId: "earthen-studio",
    location: "Portland, OR",
    price: 165,
    currency: "USD",
    productType: "jewelry",
    variants: [
      { id: "remains-bracelet-001-sm", label: "Small (6.5\" wrist)", price: 165, currency: "USD", stock: 10 },
      { id: "remains-bracelet-001-std", label: "Standard (7\" wrist)", price: 165, currency: "USD", stock: 14 },
      { id: "remains-bracelet-001-lg", label: "Large (7.5\" wrist)", price: 180, currency: "USD", stock: 9 },
    ],
    status: "published",
    verified: true,
    description:
      "Every bead on this bracelet is rolled by hand from stoneware clay carrying a small infusion of cremated remains — about a teaspoon in all, worked through the clay body before the beads are shaped, dried, and fired. The remains become part of the material itself rather than sitting sealed in a compartment, so there is nothing to open, spill, or lose.\n\nCeramicist Nora Hayashi makes each set to order in her Portland studio, then strings the beads on a knotted elastic cord that slips over the wrist without a clasp. The deep charcoal glaze pools differently on every bead, so no two are the same shape or depth of color. Remains are sent in after ordering using the enclosed kit; anything not used comes back with the finished piece.",
    details: {
      material: "High-fire stoneware clay, remains-infused",
      finish: "Charcoal glaze, hand-applied",
      dimensions: 'Beads approx. 0.5" across, 7 per bracelet',
      closure: "Knotted elastic cord, no clasp",
      remainsNeeded: "Approx. 1 teaspoon (returned if unused)",
      includes: "Remains-sending kit, velvet pouch",
      delivery: "Made to order — ships 3–4 weeks after remains arrive",
      shipsIn: "Padded, biodegradable box",
      madeIn: "Portland, Oregon, USA",
    },
    lifeStages: ["post-death"],
    relatedIds: ["pendant-silver-001", "urn-keepsake-003", "urn-terra-002"],
  },
  {
    id: "pendant-silver-001",
    title: "Memorial ash pendant, sterling silver",
    seller: "Keepsake & Co.",
    sellerId: "keepsake-co",
    location: "Austin, TX",
    price: 89,
    currency: "USD",
    productType: "jewelry",
    variants: [
      { id: "pendant-silver-001-std", label: "Sterling silver", price: 89, currency: "USD", stock: 25 },
    ],
    status: "published",
    verified: true,
    description:
      "A delicate pendant designed to hold a small portion of cremated remains, allowing you to carry a loved one close. Handcrafted in sterling silver with a secure screw-top closure.",
    details: {
      material: "Sterling silver .925",
      dimensions: '0.75" diameter',
      closure: "Threaded screw-top",
      includes: "18\" sterling chain, velvet pouch",
      madeIn: "Austin, Texas, USA",
    },
    lifeStages: ["post-death"],
    relatedIds: ["remains-bracelet-001", "urn-keepsake-003"],
  },
  {
    id: "shroud-cotton-001",
    title: "Organic cotton burial shroud, undyed",
    seller: "Gentle Passage",
    sellerId: "gentle-passage",
    location: "Vermont",
    price: 220,
    currency: "USD",
    productType: "shrouds",
    variants: [
      { id: "shroud-cotton-001-std", label: "Standard (fits up to 6\')", price: 220, currency: "USD", stock: 15 },
      { id: "shroud-cotton-001-lg", label: "Large (fits up to 6\'6\")", price: 240, currency: "USD", stock: 8 },
    ],
    status: "published",
    verified: true,
    description:
      "A simple, dignified burial shroud made from certified organic cotton, undyed and free of synthetic finishes. Designed for natural and home burial, green cemeteries, and families who wish to prepare their loved one themselves.",
    details: {
      material: "100% GOTS certified organic cotton",
      dimensions: "72\" × 108\" (standard)",
      finish: "Undyed, natural",
      includes: "Shroud, 4 cotton ties",
      certification: "GOTS organic",
      madeIn: "Vermont, USA",
    },
    lifeStages: ["active-dying", "planning-ahead"],
    relatedIds: ["remains-bracelet-001", "planning-workbook-001"],
  },
  {
    id: "planning-workbook-001",
    title: "End of life planning workbook",
    seller: "Threshold Press",
    sellerId: "threshold-press",
    location: "United States",
    price: 32,
    currency: "USD",
    productType: "planning",
    variants: [
      { id: "planning-workbook-001-pdf", label: "Digital PDF", price: 18, currency: "USD", stock: 999 },
      { id: "planning-workbook-001-print", label: "Printed & bound", price: 32, currency: "USD", stock: 50 },
    ],
    status: "published",
    verified: true,
    description:
      "A comprehensive, compassionate workbook for documenting your end-of-life wishes, values, and important information. Covers healthcare directives, financial accounts, digital assets, funeral preferences, and messages for loved ones.",
    details: {
      format: "64 pages, perfect bound",
      delivery: "Ships in 3–5 business days / PDF instant",
      dimensions: '8.5" × 11"',
      madeIn: "United States",
    },
    lifeStages: ["planning-ahead"],
    relatedIds: ["planning-template-001", "shroud-cotton-001"],
  },
  {
    id: "urn-keepsake-003",
    title: "Keepsake urn, ceramic mini",
    seller: "Earthen Studio",
    sellerId: "earthen-studio",
    location: "Portland, OR",
    price: 68,
    currency: "USD",
    productType: "urns",
    variants: [
      { id: "urn-keepsake-003-std", label: "Keepsake (30 cu in)", price: 68, currency: "USD", stock: 20 },
    ],
    status: "published",
    verified: true,
    description:
      "A smaller companion to Earthen Studio's full-size urns. Designed to hold a portion of remains, allowing multiple family members to keep a keepsake. Made with the same care and attention as every piece from the studio.",
    details: {
      dimensions: '4" H × 3" W',
      capacity: "30 cubic inches",
      material: "High-fire stoneware clay",
      madeIn: "Portland, Oregon, USA",
    },
    lifeStages: ["active-dying", "planning-ahead"],
    relatedIds: ["remains-bracelet-001", "pendant-silver-001"],
  },
  {
    id: "planning-template-001",
    title: "Advance care planning template set",
    seller: "Threshold Press",
    sellerId: "threshold-press",
    location: "United States",
    price: 24,
    currency: "USD",
    productType: "planning",
    variants: [
      { id: "planning-template-001-pdf", label: "Digital PDF", price: 24, currency: "USD", stock: 999 },
    ],
    status: "published",
    verified: false,
    description:
      "A set of printable templates covering advance directives, durable power of attorney for healthcare, POLST forms, and funeral pre-planning. Designed with attorneys and end-of-life professionals. Instant download.",
    details: {
      format: "12 templates, PDF",
      delivery: "Instant download",
      madeIn: "United States",
    },
    lifeStages: ["planning-ahead"],
    relatedIds: ["planning-workbook-001"],
  },
  {
    id: "burial-guide-001",
    title: "Eco burial guide & resource kit",
    seller: "Green Passage",
    sellerId: "green-passage",
    location: "Oregon",
    price: 18,
    currency: "USD",
    productType: "planning",
    variants: [
      { id: "burial-guide-001-pdf", label: "Digital PDF", price: 18, currency: "USD", stock: 999 },
    ],
    status: "published",
    verified: false,
    description:
      "An in-depth guide to green burial options in the US: natural burial grounds, home burial laws by state, conservation burial, and resources for families. Written by a certified funeral celebrant.",
    details: {
      format: "48-page PDF",
      delivery: "Instant download",
      madeIn: "Oregon, USA",
    },
    lifeStages: ["active-dying", "planning-ahead"],
    relatedIds: ["shroud-cotton-001", "planning-workbook-001"],
  },
  {
    id: "portrait-custom-001",
    title: "Memorial portrait, custom illustration",
    seller: "Still Life Studio",
    sellerId: "still-life-studio",
    location: "Brooklyn, NY",
    price: 120,
    currency: "USD",
    productType: "memorial",
    variants: [
      { id: "portrait-custom-001-digital-8x10", label: '8" × 10" digital', price: 80, currency: "USD", stock: 999 },
      { id: "portrait-custom-001-print-8x10", label: '8" × 10" print', price: 120, currency: "USD", stock: 50 },
      { id: "portrait-custom-001-print-11x14", label: '11" × 14" print', price: 160, currency: "USD", stock: 30 },
    ],
    status: "published",
    verified: true,
    description:
      "A custom illustrated portrait of your loved one, created from a photo. Each piece is drawn by hand and scanned at high resolution. The artist works closely with each family to capture the essence of the person.",
    details: {
      delivery: "2–3 week turnaround",
      format: "Digital file or archival print",
      madeIn: "Brooklyn, New York, USA",
    },
    lifeStages: ["post-death"],
    relatedIds: ["planning-workbook-001"],
  },
  {
    id: "urn-terra-002",
    title: "Ceramic urn, terracotta glaze",
    seller: "Earthen Studio",
    sellerId: "earthen-studio",
    location: "Portland, OR",
    price: 145,
    currency: "USD",
    productType: "urns",
    variants: [
      { id: "urn-terra-002-std", label: "Standard (200 cu in)", price: 145, currency: "USD", stock: 10 },
      { id: "urn-terra-002-lg", label: "Large (280 cu in)", price: 185, currency: "USD", stock: 5 },
    ],
    status: "published",
    verified: true,
    description:
      "The same beautifully hand-thrown form as the sage glaze urn, finished in a warm terracotta glaze. Each piece bears the subtle marks of the hand that made it.",
    details: {
      dimensions: '9.5" H × 5.5" W (standard)',
      capacity: "200 cubic inches (standard adult)",
      material: "High-fire stoneware clay",
      madeIn: "Portland, Oregon, USA",
      glazes: ["Terra", "Sage", "Cream", "Charcoal"],
    },
    lifeStages: ["active-dying", "planning-ahead"],
    relatedIds: ["remains-bracelet-001", "urn-keepsake-003"],
  },
  {
    id: "funeral-planning-workbook-001",
    title: "Funeral planning workbook",
    seller: "Threshold Press",
    sellerId: "threshold-press",
    location: "United States",
    price: 28,
    currency: "USD",
    productType: "planning",
    variants: [
      { id: "funeral-planning-workbook-001-pdf", label: "Digital PDF", price: 14, currency: "USD", stock: 999 },
      { id: "funeral-planning-workbook-001-print", label: "Printed & bound", price: 28, currency: "USD", stock: 50 },
    ],
    status: "published",
    verified: true,
    description:
      "A practical workbook for documenting your wishes around your funeral or memorial — service style, music, readings, who to invite, what to wear, where ashes or remains go. Designed to spare your family from guessing at a difficult time.",
    details: {
      format: "48 pages, perfect bound",
      delivery: "Ships in 3–5 business days / PDF instant",
      dimensions: '8.5" × 11"',
      madeIn: "United States",
    },
    lifeStages: ["planning-ahead"],
    relatedIds: ["planning-workbook-001", "planning-template-001"],
  },
  {
    id: "will-kit-001",
    title: "Simple will & estate creation kit",
    seller: "Threshold Press",
    sellerId: "threshold-press",
    location: "United States",
    price: 45,
    currency: "USD",
    productType: "planning",
    variants: [
      { id: "will-kit-001-pdf", label: "Digital PDF", price: 25, currency: "USD", stock: 999 },
      { id: "will-kit-001-print", label: "Printed & bound", price: 45, currency: "USD", stock: 40 },
    ],
    status: "published",
    verified: true,
    description:
      "Step-by-step templates and guidance for creating a simple will, naming an executor, and recording basic estate wishes. State-specific guidance included. Reviewed by estate attorneys. Not a substitute for legal counsel for complex estates — pair with an attorney consultation if your situation is involved.",
    details: {
      format: "Will template + 32-page guide",
      delivery: "Instant download / Ships in 3–5 days",
      madeIn: "United States",
    },
    lifeStages: ["planning-ahead"],
    relatedIds: ["planning-template-001", "planning-workbook-001"],
  },
];
