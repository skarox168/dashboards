import { Edit, Maximize2, MoreVertical, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Widget as WidgetType } from "@/types/dashboard";
import { ChartFactory } from "@/components/charts/chart-factory";

interface WidgetContainerProps {
  widget: WidgetType;
  isEditing: boolean;
  onRemove?: () => void;
  onEdit?: () => void;
  onExpand?: () => void;
}

export function WidgetContainer({
  widget,
  isEditing,
  onRemove,
  onEdit,
  onExpand,
}: WidgetContainerProps) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {(isEditing || onExpand) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onExpand && (
                <DropdownMenuItem onClick={onExpand}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Expand
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0 h-[calc(100%-40px)]">
        <ChartFactory widget={widget} />
      </CardContent>
    </Card>
  );
}