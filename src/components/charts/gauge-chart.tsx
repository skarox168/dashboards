import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  data: any;
  config: {
    min?: number;
    max?: number;
    value?: number;
    valueKey?: string;
    colors?: string[];
    thickness?: number;
  };
}

export function GaugeChart({ data, config }: GaugeChartProps) {
  const {
    min = 0,
    max = 100,
    valueKey = "value",
    colors = ["#ff0000", "#ffff00", "#00ff00"],
    thickness = 60,
  } = config;

  // Use the first item if data is an array
  const item = Array.isArray(data) ? data[0] : data;
  
  if (!item) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const value = item[valueKey] || 0;
  const percentage = ((value - min) / (max - min)) * 100;
  
  // Create data for the gauge chart
  const gaugeData = [
    { name: "value", value: percentage },
    { name: "empty", value: 100 - percentage },
  ];

  // Determine color based on percentage
  let color;
  if (percentage <= 33) {
    color = colors[0]; // Red for low values
  } else if (percentage <= 66) {
    color = colors[1]; // Yellow for medium values
  } else {
    color = colors[2]; // Green for high values
  }

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={gaugeData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={100 - thickness}
            outerRadius={100}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#f3f4f6" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">
          {min} - {max}
        </div>
      </div>
    </div>
  );
}