import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: any[];
  config: {
    columns?: string[];
    pageSize?: number;
  };
}

export function DataTable({ data, config }: DataTableProps) {
  const { columns = [], pageSize = 10 } = config;
  
  // If no columns are specified, use all keys from the first data item
  const tableColumns = columns.length > 0 
    ? columns 
    : data.length > 0 
      ? Object.keys(data[0]) 
      : [];

  return (
    <div className="h-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {tableColumns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.slice(0, pageSize).map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {tableColumns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`}>{row[column]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}