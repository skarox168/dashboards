import { useEffect, useState } from "react";
import { Widget } from "@/types/dashboard";
import { getChartData } from "@/lib/database-utils";
import { PieChart } from "./pie-chart";
import { BarChart } from "./bar-chart";
import { LineChart } from "./line-chart";
import { DataTable } from "./data-table";
import { KpiCard } from "./kpi-card";
import { MindMap } from "./mind-map";
import { FlowChart } from "./flow-chart";
import { ScatterPlot } from "./scatter-plot";
import { GaugeChart } from "./gauge-chart";
import { GroupedBarChart } from "./grouped-bar-chart";
import { StackedBarChart } from "./stacked-bar-chart";
import { DualAxisChart } from "./dual-axis-chart";
import { TextView } from "./text-view";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartFactoryProps {
  widget: Widget;
}

export function ChartFactory({ widget }: ChartFactoryProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const chartData = await getChartData(widget.type, widget.dataSource);
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [widget.type, widget.dataSource]);

  if (loading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Render the appropriate chart based on widget type
  switch (widget.type) {
    case "pie":
      return <PieChart data={data} config={widget.config} />;
    case "bar":
      return <BarChart data={data} config={widget.config} />;
    case "line":
      return <LineChart data={data} config={widget.config} />;
    case "table":
      return <DataTable data={data} config={widget.config} />;
    case "kpi":
      return <KpiCard data={data} config={widget.config} />;
    case "mindMap":
      return <MindMap data={data} config={widget.config} />;
    case "flowChart":
      return <FlowChart data={data} config={widget.config} />;
    case "scatter":
      return <ScatterPlot data={data} config={widget.config} />;
    case "gauge":
      return <GaugeChart data={data} config={widget.config} />;
    case "groupedBar":
      return <GroupedBarChart data={data} config={widget.config} />;
    case "stackedBar":
      return <StackedBarChart data={data} config={widget.config} />;
    case "dualAxis":
      return <DualAxisChart data={data} config={widget.config} />;
    case "text":
      return <TextView data={data} config={widget.config} />;
    default:
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Unsupported widget type: {widget.type}
          </p>
        </div>
      );
  }
}