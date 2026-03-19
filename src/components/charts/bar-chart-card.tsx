"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BarChartCard({
  title,
  description,
  data,
  dataKey,
  color = "#1f6a52",
  secondaryKey,
}: {
  title: string;
  description?: string;
  data: Record<string, string | number>[];
  dataKey: string;
  color?: string;
  secondaryKey?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="text-sm muted-copy">{description}</p> : null}
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7ddd1" />
              <XAxis dataKey="name" stroke="#667267" tickLine={false} axisLine={false} />
              <YAxis stroke="#667267" tickLine={false} axisLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} radius={[12, 12, 0, 0]} fill={color}>
                {data.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={typeof entry.fill === "string" ? entry.fill : color} />
                ))}
              </Bar>
              {secondaryKey ? <Bar dataKey={secondaryKey} radius={[12, 12, 0, 0]} fill="#d1a95b" /> : null}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
