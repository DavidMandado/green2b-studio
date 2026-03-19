import { CompareView } from "@/components/products/compare-view";
import { PageHeader } from "@/components/shared/page-header";
import { getProductsWithScores } from "@/lib/server/queries";

export default async function ComparePage() {
  const products = await getProductsWithScores();
  const categoryAverages = Object.fromEntries(
    [...new Set(products.map((product) => product.category))].map((category) => [
      category,
      products.filter((product) => product.category === category).reduce((sum, product) => sum + product.score.finalScore, 0) /
        products.filter((product) => product.category === category).length,
    ]),
  );

  return (
    <>
      <PageHeader
        eyebrow="Buyer Demo"
        title="Compare products side by side"
        description="Buyer-friendly shortlist view for comparing grade, price, confidence, and material sustainability."
      />
      <CompareView products={products} categoryAverages={categoryAverages} />
    </>
  );
}
