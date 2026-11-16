"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ChartPoint {
  label: string;
  Lamaran: number;
  Lowongan: number;
}

export default function ImpactChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Grafik lamaran dan lowongan per bulan">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Lamaran" fill="#16A34A" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Lowongan" fill="#0F766E" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
