import Link from "next/link";

import { ProductsManager } from "@/components/products/products-manager";
import { PageHeader } from "@/components/shared/page-header";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getProductsWithScores, getSuppliers } from "@/lib/server/queries";

export default async function ProductsPage() {
  const [products, suppliers] = await Promise.all([getProductsWithScores(), getSuppliers()]);
  const categoryAverages = Object.fromEntries(
    [...new Set(products.map((product) => product.category))].map((category) => [
      category,
      products
        .filter((product) => product.category === category)
        .reduce((sum, product) => sum + product.score.finalScore, 0) /
        products.filter((product) => product.category === category).length,
    ]),
  );

  return (
    <>
      <PageHeader
        eyebrow="Product Database"
        title="Products"
        description="Full commercial and sustainability dataset, ready for scoring, comparison, and buyer-facing grade cards."
        actions={
          <Link href="/api/products/export" className={cn("inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition", buttonStyles.secondary)}>
            Export CSV
          </Link>
        }
      />
      <ProductsManager products={products} suppliers={suppliers} categoryAverages={categoryAverages} />
    </>
  );
}
