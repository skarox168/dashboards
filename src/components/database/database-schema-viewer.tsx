import { useState } from "react";
import { ChevronDown, ChevronRight, Database, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { DatabaseSchema } from "@/lib/database-utils";

interface DatabaseSchemaViewerProps {
  schema: DatabaseSchema;
}

export function DatabaseSchemaViewer({ schema }: DatabaseSchemaViewerProps) {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 flex items-center gap-2 bg-muted/50">
        <Database className="h-5 w-5" />
        <h3 className="font-medium">Database Schema</h3>
      </div>
      <div className="p-2">
        {schema.tables.length === 0 ? (
          <p className="text-sm text-muted-foreground p-2">No tables found in this database.</p>
        ) : (
          <ul className="space-y-1">
            {schema.tables.map((table) => (
              <li key={table.name} className="text-sm">
                <button
                  onClick={() => toggleTable(table.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-muted",
                    expandedTables[table.name] && "bg-muted"
                  )}
                >
                  {expandedTables[table.name] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Table className="h-4 w-4" />
                  <span>{table.name}</span>
                </button>
                
                {expandedTables[table.name] && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {table.columns.map((column) => (
                      <li
                        key={`${table.name}-${column.name}`}
                        className="flex items-center gap-2 px-2 py-1 text-muted-foreground"
                      >
                        <div className="h-4 w-4" /> {/* Spacer */}
                        <span>{column.name}</span>
                        <span className="text-xs text-muted-foreground">({column.type})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}