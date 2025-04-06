import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  data: any;
  config: {
    valueKey?: string;
    labelKey?: string;
    changeKey?: string;
    format?: string;
    prefix?: string;
    suffix?: string;
  };
}

export function KpiCard({ data, config }: KpiCardProps) {
  const {
    valueKey = "value",
    labelKey = "label",
    changeKey = "change",
    format = "number",
    prefix = "",
    suffix = "",
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

  const value = item[valueKey];
  const label = item[labelKey] || "Value";
  const change = item[changeKey];

  // Format the value based on the specified format
  let formattedValue = value;
  if (format === "currency") {
    formattedValue = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  } else if (format === "percent") {
    formattedValue = `${value}%`;
  } else if (format === "number") {
    formattedValue = new Intl.NumberFormat().format(value);
  }

  return (
    <div className="flex h-full flex-col justify-center p-2">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="text-3xl font-bold">
        {prefix}
        {formattedValue}
        {suffix}
      </div>
      {change !== undefined && (
        <div
          className={cn(
            "flex items-center text-sm",
            change >= 0 ? "text-green-500" : "text-red-500"
          )}
        >
          {change >= 0 ? (
            <ArrowUp className="mr-1 h-4 w-4" />
          ) : (
            <ArrowDown className="mr-1 h-4 w-4" />
          )}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}