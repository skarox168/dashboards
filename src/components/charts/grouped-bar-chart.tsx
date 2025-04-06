import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GroupedBarChartProps {
  data: any[];
  config: {
    xAxisKey?: string;
    dataKeys?: string[];
    colors?: string[];
    showGrid?: boolean;
    showLegend?: boolean;
  };
}

export function GroupedBarChart({ data, config }: GroupedBarChartProps) {
  const {
    xAxisKey = "date",
    dataKeys = ["Product A", "Product B", "Product C"],
    colors = ["#8884d8", "#82ca9d", "#ffc658"],
    showGrid = true,
    showLegend = true,
  } = config;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
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
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}