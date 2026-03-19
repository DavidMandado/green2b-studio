"use client";

import { ArrowUpDown, Search } from "lucide-react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function DataTable<TData>({
  title,
  description,
  columns,
  data,
  searchPlaceholder = "Search",
  initialSearch = "",
}: {
  title: string;
  description?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  searchPlaceholder?: string;
  initialSearch?: string;
}) {
  const [globalFilter, setGlobalFilter] = useState(initialSearch);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: (updater) =>
      setSorting(typeof updater === "function" ? updater(sorting) : updater),
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const text = JSON.stringify(row.original).toLowerCase();
      return text.includes(String(filterValue).toLowerCase());
    },
  });

  const rows = useMemo(() => table.getRowModel().rows, [table]);

  return (
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? <p className="mt-2 text-sm muted-copy">{description}</p> : null}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="pl-10"
            placeholder={searchPlaceholder}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-3 pb-2 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-white">
                  {row.getVisibleCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "border-y border-[var(--border)] px-3 py-3 text-sm align-top",
                        index === 0 && "rounded-l-2xl border-l",
                        index === row.getVisibleCells().length - 1 && "rounded-r-2xl border-r",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[var(--border)] p-10 text-center text-sm muted-copy">
              No rows match the current filter.
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
