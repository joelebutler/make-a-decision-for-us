import * as React from "react";
import Box from "@mui/material/Box";
import { RadarChart, type RadarSeries } from "@mui/x-charts/RadarChart";

export interface ChartProps {
  metrics: string[];
  data: number[];
  label: string;
}

export default function Chart({ metrics, data, label }: ChartProps) {
  const series: RadarSeries[] = [
    {
      label: label,
      data: data,
      hideMark: false,
      fillArea: true,
    },
  ];

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <RadarChart
        height={300}
        series={series}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        radar={{
          max: 100, // Match percentage max is 100
          metrics: metrics,
        }}
      />
    </Box>
  );
}
