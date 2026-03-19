import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  badge?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card-surface rounded-[32px] p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{eyebrow}</p>
          ) : null}
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            {badge ? <Badge variant="success">{badge}</Badge> : null}
          </div>
          <p className="max-w-2xl text-base leading-7 muted-copy">{description}</p>
        </div>

        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
