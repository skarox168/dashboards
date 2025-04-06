import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PieChartProps {
  data: any[];
  config: {
    colors?: string[];
    innerRadius?: number;
    outerRadius?: number;
    dataKey?: string;
    nameKey?: string;
    showLegend?: boolean;
  };
}

export function PieChart({ data, config }: PieChartProps) {
  const {
    colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"],
    innerRadius = 0,
    outerRadius = 80,
    dataKey = "value",
    nameKey = "name",
    showLegend = true,
  } = config;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        {showLegend && <Legend />}
      </RechartsChart>
    </ResponsiveContainer>
  );
}