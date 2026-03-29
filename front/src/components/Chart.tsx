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
        height={320}
        series={series}
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        radar={{
          max: 100, // Match percentage max is 100
          metrics: metrics,
        }}
        sx={{
          "& .MuiChartsLegend-root": { display: "none" },
          "& .MuiChartsAxis-tickLabel": {
            fill: "var(--text)",
            fontSize: "13px",
            fontFamily: "var(--font-sans)",
            fontWeight: "900",
          },
          "& .MuiChartsRadar-polygon": {
            fill: "var(--brand) !important",
            fillOpacity: "0.25 !important",
            stroke: "var(--brand) !important",
            strokeWidth: "3px !important",
            strokeLinejoin: "round",
          },
          "& .MuiChartsRadar-mark": {
            fill: "var(--brand) !important",
            stroke: "var(--surface) !important",
            strokeWidth: "2px !important",
            r: 5,
          },
          "& line": {
            stroke: "var(--brand)",
            strokeOpacity: 0.3,
            strokeWidth: 1.5,
          },
          "& polygon.MuiChartsGrid-line": {
            stroke: "var(--brand)",
            strokeOpacity: 0.15,
            strokeDasharray: "none",
            strokeWidth: 1,
            fill: "var(--brand)",
            fillOpacity: 0.03,
          },
        }}
      />
    </Box>
  );
}
