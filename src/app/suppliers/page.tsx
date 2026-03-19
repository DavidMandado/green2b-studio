import { SuppliersManager } from "@/components/products/suppliers-manager";
import { PageHeader } from "@/components/shared/page-header";
import { getSuppliers } from "@/lib/server/queries";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <>
      <PageHeader
        eyebrow="Supplier Database"
        title="Suppliers"
        description="Supplier profiles, credibility signals, evidence completeness, and pipeline readiness."
      />
      <SuppliersManager suppliers={suppliers} />
    </>
  );
}
