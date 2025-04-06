import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DualAxisChartProps {
  data: any[];
  config: {
    xAxisKey?: string;
    barKeys?: string[];
    lineKeys?: string[];
    barColors?: string[];
    lineColors?: string[];
    showGrid?: boolean;
    showLegend?: boolean;
  };
}

export function DualAxisChart({ data, config }: DualAxisChartProps) {
  const {
    xAxisKey = "date",
    barKeys = ["Product A"],
    lineKeys = ["Product B", "Product C"],
    barColors = ["#8884d8"],
    lineColors = ["#ff7300", "#82ca9d"],
    showGrid = true,
    showLegend = true,
  } = config;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        {showGrid && <CartesianGrid stroke="#f5f5f5" />}
        <XAxis dataKey={xAxisKey} scale="band" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        {showLegend && <Legend />}
        {barKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            yAxisId="left"
            fill={barColors[index % barColors.length]}
          />
        ))}
        {lineKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            yAxisId="right"
            stroke={lineColors[index % lineColors.length]}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}