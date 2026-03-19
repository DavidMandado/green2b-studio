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
  const size = 320;
  const center = size / 2;
  const radius = 108;
  const rings = [0.25, 0.5, 0.75, 1];
  const angleStep = (Math.PI * 2) / data.length;
  const points = data
    .map((item, index) => {
      const angle = -Math.PI / 2 + index * angleStep;
      const pointRadius = radius * (item.value / 100);
      const x = center + Math.cos(angle) * pointRadius;
      const y = center + Math.sin(angle) * pointRadius;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm muted-copy">{countryName}</p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-[320px] w-full max-w-[420px]" role="img" aria-label={title}>
            {rings.map((ring) => (
              <polygon
                key={ring}
                points={data
                  .map((_, index) => {
                    const angle = -Math.PI / 2 + index * angleStep;
                    const x = center + Math.cos(angle) * radius * ring;
                    const y = center + Math.sin(angle) * radius * ring;
                    return `${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#d7ddd1"
              />
            ))}

            {data.map((item, index) => {
              const angle = -Math.PI / 2 + index * angleStep;
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              const labelX = center + Math.cos(angle) * (radius + 28);
              const labelY = center + Math.sin(angle) * (radius + 28);

              return (
                <g key={item.metric}>
                  <line x1={center} y1={center} x2={x} y2={y} stroke="#d7ddd1" />
                  <text x={labelX} y={labelY} textAnchor="middle" fontSize="12" fill="#667267">
                    {item.metric}
                  </text>
                </g>
              );
            })}

            <polygon points={points} fill="#1f6a52" fillOpacity="0.28" stroke="#1f6a52" strokeWidth="2" />
            {data.map((item, index) => {
              const angle = -Math.PI / 2 + index * angleStep;
              const pointRadius = radius * (item.value / 100);
              const x = center + Math.cos(angle) * pointRadius;
              const y = center + Math.sin(angle) * pointRadius;

              return <circle key={item.metric} cx={x} cy={y} r="4" fill="#1f6a52" />;
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}
