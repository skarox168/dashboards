import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ScatterPlotProps {
  data: any[];
  config: {
    xAxisKey?: string;
    yAxisKey?: string;
    groupKey?: string;
    colors?: string[];
    showGrid?: boolean;
    showLegend?: boolean;
  };
}

export function ScatterPlot({ data, config }: ScatterPlotProps) {
  const {
    xAxisKey = "x",
    yAxisKey = "y",
    groupKey = "category",
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
    showGrid = true,
    showLegend = true,
  } = config;

  // Group data by the groupKey
  const groupedData: Record<string, any[]> = data.reduce((acc: Record<string, any[]>, item) => {
    const group = item[groupKey] || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});

  // Ensure we have at least one group with data
  if (Object.keys(groupedData).length === 0) {
    groupedData["default"] = data; // Use all data as default group if no grouping
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }}
      >
        {showGrid && <CartesianGrid />}
        <XAxis type="number" dataKey={xAxisKey} name="x" />
        <YAxis type="number" dataKey={yAxisKey} name="y" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} />
        {showLegend && <Legend />}
        {Object.entries(groupedData).map(([group, points], index) => {
          // Only render Scatter if we have points
          if (points && points.length > 0) {
            return (
              <Scatter
                key={group}
                name={group}
                data={points}
                fill={colors[index % colors.length]}
              />
            );
          }
          return null;
        })}
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
}