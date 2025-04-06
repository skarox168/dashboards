import { useState, useEffect } from "react";
import { Widget as WidgetType } from "@/types/dashboard";
import { WidgetContainer } from "./widget-container";

interface DashboardGridProps {
  widgets: WidgetType[];
  isEditing: boolean;
  onLayoutChange?: (layout: any) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onWidgetEdit?: (widgetId: string) => void;
}

export function DashboardGrid({
  widgets,
  isEditing,
  onLayoutChange,
  onWidgetRemove,
  onWidgetEdit,
}: DashboardGridProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure grid layout recalculates after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // In a real implementation, we would use react-grid-layout for drag-and-drop functionality
  // For now, we'll just create a simple grid layout
  return (
    <div className="dashboard-grid p-4">
      <div className="grid grid-cols-12 gap-4">
        {widgets.map((widget) => {
          // Calculate the grid column span based on widget width
          const colSpan = widget.size.width;
          // Calculate the height in pixels based on widget height
          const height = widget.size.height * 60;
          
          return (
            <div
              key={widget.id}
              className={`col-span-${colSpan} md:col-span-${colSpan}`}
              style={{ height: `${height}px` }}
            >
              <WidgetContainer
                widget={widget}
                isEditing={isEditing}
                onRemove={onWidgetRemove ? () => onWidgetRemove(widget.id) : undefined}
                onEdit={onWidgetEdit ? () => onWidgetEdit(widget.id) : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}