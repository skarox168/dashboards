import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BarChartProps {
  data: any[];
  config: {
    xAxisKey?: string;
    dataKeys?: string[];
    colors?: string[];
    stacked?: boolean;
    showGrid?: boolean;
    showLegend?: boolean;
  };
}

export function BarChart({ data, config }: BarChartProps) {
  const {
    xAxisKey = "date",
    dataKeys = ["Product A", "Product B", "Product C"],
    colors = ["#8884d8", "#82ca9d", "#ffc658"],
    stacked = false,
    showGrid = true,
    showLegend = true,
  } = config;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}