"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CountryRadarCard({
  title,
  countryName,
  data,
}: {
  title: string;
  countryName: string;
  data: Array<{ metric: string; value: number }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm muted-copy">{countryName}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid stroke="#d7ddd1" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#667267", fontSize: 12 }} />
              <Radar dataKey="value" stroke="#1f6a52" fill="#1f6a52" fillOpacity={0.35} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
