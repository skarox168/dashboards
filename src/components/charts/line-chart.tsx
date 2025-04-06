import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: any[];
  config: {
    xAxisKey?: string;
    dataKeys?: string[];
    colors?: string[];
    showGrid?: boolean;
    showLegend?: boolean;
    showDots?: boolean;
  };
}

export function LineChart({ data, config }: LineChartProps) {
  const {
    xAxisKey = "date",
    dataKeys = ["Product A", "Product B", "Product C"],
    colors = ["#8884d8", "#82ca9d", "#ffc658"],
    showGrid = true,
    showLegend = true,
    showDots = true,
  } = config;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
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
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
            dot={showDots}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}